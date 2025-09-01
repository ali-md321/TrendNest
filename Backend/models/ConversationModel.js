const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    role: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});
// { _id: false }

const ConversationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [MessageSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema);