const { connectToMongo } = require('../config/mongodb');

class LogService {
    static async logConnection(userId, action, ip = 'unknown') {
        try {
            const db = await connectToMongo();
            const logs = db.collection('connection_logs');
            
            await logs.insertOne({
                userId,
                action, // 'login' ou 'logout'
                timestamp: new Date(),
                ip
            });
        } catch (err) {
            console.error('Erreur log connexion:', err);
        }
    }

    static async logTrajetAction(trajetId, userId, action) {
        try {
            const db = await connectToMongo();
            const logs = db.collection('trajet_logs');
            
            await logs.insertOne({
                trajetId,
                userId,
                action, // 'creation', 'reservation', 'annulation', 'completion'
                timestamp: new Date()
            });
        } catch (err) {
            console.error('Erreur log trajet:', err);
        }
    }
}

module.exports = LogService; 