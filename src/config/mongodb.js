const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function connectToMongo() {
    try {
        await client.connect();
        console.log(' Connexion MongoDB réussie');
        return client.db('ecoride');
    } catch (err) {
        console.error(' Erreur connexion MongoDB:', err);
        throw err;
    }
}

module.exports = { connectToMongo }; 