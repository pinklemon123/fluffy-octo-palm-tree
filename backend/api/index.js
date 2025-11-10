require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
    if (db) return db;
    try {
        await client.connect();
        db = client.db("forum"); // You can change "forum" to your DB name
        console.log("Successfully connected to MongoDB Atlas!");
        return db;
    } catch (error) {
        console.error("Could not connect to MongoDB Atlas:", error);
        process.exit(1);
    }
}

connectDB();

// Test route
app.get('/api/test', async (req, res) => {
    try {
        const database = await connectDB();
        await database.command({ ping: 1 });
        res.status(200).send("MongoDB connection is healthy!");
    } catch (error) {
        res.status(500).send("MongoDB connection error: " + error.message);
    }
});

// Placeholder for other routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/messages', require('./routes/messages'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
