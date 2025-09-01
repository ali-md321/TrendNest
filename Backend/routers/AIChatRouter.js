const router = require('express').Router();
const catchAsync = require('../middlewares/catchAsync');
const Conversation = require('../models/ConversationModel');
const { MongoClient } = require('mongodb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isAuthenticated, optionalAuth } = require('../middlewares/isAuthenticated');

const client = new MongoClient(process.env.ATLAS_URI, {
  tls: true,
});

client.connect();
const coll = client.db('trendnest_kb').collection('kb_chunks');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const GEN_MODEL = process.env.GEN_MODEL || 'text-bison-001'

const guestConversations = {}; // { sessionId/ip : [ { role, content } ] }

async function retrieveTopK(queryVector, k = 5) {
    const pipeline = [
        { $vectorSearch: {index: "vector_index", queryVector, path: 'embedding', numCandidates: 100, limit: k } },
        { $project: { text: 1, title: 1, sourceId: 1, metadata: 1, score: { $meta: "vectorSearchScore" } } }
    ];  
    return await coll.aggregate(pipeline).toArray();
}
router.post('/chat', optionalAuth,catchAsync(async (req, res) => {
  const { message } = req.body;
  const userId = req.userId || null;   // from optionalAuth if logged in
  const sessionKey = userId || req.ip; // fallback for guest

  // --- Embed query ---
  const embModel = genAI.getGenerativeModel({ model: process.env.EMBED_MODEL });
  const embResp = await embModel.embedContent(message);
  const queryVec = embResp?.embedding?.values || embResp?.embedding || embResp?.data?.[0]?.embedding;

  const retrieved = await retrieveTopK(queryVec, 6);

  const systemPrompt = `You are TrendNest Assistant — a helpful AI assistant for the TrendNest platform.
- If the provided SOURCE texts are relevant, use them in your answer (preferably mention the source).
- If the sources are not relevant, you can freely answer using your own general knowledge (like ChatGPT would).
- Always stay polite, concise, and conversational.
- Always keep your identity: you are TrendNest Assistant, the official support and companion assistant for users.
- Never refuse to answer just because sources are missing. If truly impossible, then say: "I don't know — please contact support at support@trendnest.example".`;


  const sourcesText = retrieved.map((r, i) => `SOURCE ${i+1} (id:${r.sourceId}): ${r.text}`).join('\n\n');

  // --- Load conversation history ---
  let historyText = '';
  let conv = null;

  if (userId) {
    conv = await Conversation.findOne({ user: userId });
    if (conv) {
      historyText = conv.messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
    }
  } else {
    if (!guestConversations[sessionKey]) guestConversations[sessionKey] = [];
    historyText = guestConversations[sessionKey].slice(-6).map(m => `${m.role}: ${m.content}`).join('\n');
  }

  // --- Prompt ---
  const prompt = `${systemPrompt}\n\n${sourcesText}\n\nConversation:\n${historyText}\n\nUser: ${message}\nAssistant:`;

  // --- Generate ---
  const genModel = genAI.getGenerativeModel({ model: GEN_MODEL });
  const genResp = await genModel.generateContent(prompt);
  const answer = genResp.response.text();

  // --- Save conversation ---
  if (userId) {
    if (!conv) conv = new Conversation({ user: userId, messages: [] });
    conv.messages.push({ role: 'user', content: message });
    conv.messages.push({ role: 'assistant', content: answer });
    await conv.save();
  } else {
    guestConversations[sessionKey].push({ role: 'user', content: message });
    guestConversations[sessionKey].push({ role: 'assistant', content: answer });
  }

  res.json({
    answer,
    sources: retrieved.map(r => ({ title: r.title, sourceId: r.sourceId })),
    conversationId: conv?._id || null,
    guest: !userId
  });
}));

router.get('/chat/history', optionalAuth, catchAsync(async (req, res) => {
  if (!req.userId) {
    return res.json({ messages: [] });
  }

  const conv = await Conversation.findOne({ user: req.userId });
  if (!conv) {
    return res.json({ messages: [] });
  }

  res.json({ messages: conv.messages });
}));

module.exports = router;