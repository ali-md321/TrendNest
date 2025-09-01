const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MongoClient } = require('mongodb');
const { chunkText } = require('./chunker.js');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const EMBED_MODEL = process.env.EMBED_MODEL || 'text-embedding-004';

const client = new MongoClient(process.env.ATLAS_URI, {
  tls: true,
});

const KNOWLEDGE_DIR = path.resolve(__dirname, './knowledge');

async function indexAll() {
  await client.connect();
  const db = client.db('trendnest_kb');
  const coll = db.collection('kb_chunks');

  const files = await fs.readdir(KNOWLEDGE_DIR);

  for (const fname of files) {
    const full = path.join(KNOWLEDGE_DIR, fname);
    const raw = await fs.readFile(full, 'utf8');

    const docMeta = {
      sourceId: fname.replace(/\.[^/.]+$/, ''),
      sourceType: fname.endsWith('.md') ? 'doc' : 'faq',
      title: fname,
      url: null,
    };

    const chunks = chunkText(raw, 3000, 500);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      // ✅ Generate embedding correctly
      const embedModel = genAI.getGenerativeModel({ model: EMBED_MODEL });
      const embResp = await embedModel.embedContent({
        model: EMBED_MODEL,
        content: {
          parts: [{ text: chunk }]
        }
      });

      const vector = embResp.embedding.values;

      // ✅ Insert into MongoDB
      await coll.insertOne({
        sourceId: docMeta.sourceId,
        sourceType: docMeta.sourceType,
        title: docMeta.title,
        chunkIndex: i,
        text: chunk,
        embedding: vector,
        metadata: docMeta,
        createdAt: new Date()
      });

      console.log(`✅ Indexed ${docMeta.sourceId} chunk ${i}`);
    }
  }

  console.log("🎉 Indexing complete");
  await client.close();
}

indexAll().catch(err => {
  console.error("❌ Indexing failed:", err);
  process.exit(1);
});
