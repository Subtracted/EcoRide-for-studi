const { connectToMongo } = require('../../config/mongodb');
const LogService = require('../../services/logService');
const StatsService = require('../../services/statsService');

async function testMongo() {
    try {
        console.log(' Test de connexion MongoDB...');
        const db = await connectToMongo();
        console.log(' Connexion MongoDB réussie\n');

        // Test des logs de connexion
        console.log(' Test des logs de connexion...');
        await LogService.logConnection(1, 'login');
        const connectionLogs = await db.collection('connection_logs').find({}).toArray();
        console.log(' Logs de connexion:', connectionLogs);
        console.log(' Test des logs de connexion réussi\n');

        // Test des logs de trajet
        console.log(' Test des logs de trajet...');
        await LogService.logTrajetAction(1, 1, 'creation');
        const trajetLogs = await db.collection('trajet_logs').find({}).toArray();
        console.log(' Logs de trajets:', trajetLogs);
        console.log(' Test des logs de trajet réussi\n');

        // Test des stats
        console.log(' Test des statistiques...');
        const today = new Date();
        await StatsService.updateDailyStats(today, {
            trajets: 1,
            credits: 2,
            reservations: 1
        });
        
        const stats = await StatsService.getDailyStats(
            new Date(today.setDate(today.getDate() - 1)),
            new Date()
        );
        console.log(' Statistiques:', stats);
        console.log(' Test des statistiques réussi');
    } catch (err) {
        console.error(' Erreur pendant les tests:', err);
    } finally {
        process.exit(0);
    }
}

testMongo(); 