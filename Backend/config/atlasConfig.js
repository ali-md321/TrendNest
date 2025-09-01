require('dotenv').config();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.ATLAS_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000,
});

async function connect() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas!');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connect();
