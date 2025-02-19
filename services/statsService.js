const { connectToMongo } = require('../config/mongodb');
const pool = require('../db');

class StatsService {
    static async updateDailyStats(date, stats) {
        try {
            const db = await connectToMongo();
            const dailyStats = db.collection('daily_stats');
            
            await dailyStats.updateOne(
                { date: date },
                { 
                    $inc: {
                        'trajets_count': stats.trajets || 0,
                        'credits_earned': stats.credits || 0,
                        'reservations_count': stats.reservations || 0
                    }
                },
                { upsert: true }
            );
        } catch (err) {
            console.error('Erreur mise à jour stats:', err);
        }
    }

    static async getDailyStats(startDate, endDate) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Récupérer les covoiturages par jour
            const covoituragesResult = await client.query(`
                SELECT DATE(date_depart) as date, COUNT(*) as count
                FROM trajets
                WHERE date_depart >= $1 AND date_depart <= $2
                GROUP BY DATE(date_depart)
                ORDER BY date
            `, [startDate, endDate]);

            // Récupérer les crédits par jour
            const creditsResult = await client.query(`
                SELECT DATE(date_creation) as date, SUM(montant) as amount
                FROM credits_plateforme
                WHERE date_creation >= $1 AND date_creation <= $2
                GROUP BY DATE(date_creation)
                ORDER BY date
            `, [startDate, endDate]);

            // Récupérer le total des crédits
            const totalCreditsResult = await client.query(`
                SELECT COALESCE(SUM(montant), 0) as total
                FROM credits_plateforme
            `);

            await client.query('COMMIT');

            return {
                covoituragesParJour: covoituragesResult.rows,
                creditsParJour: creditsResult.rows,
                totalCredits: totalCreditsResult.rows[0].total
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }
}

module.exports = { StatsService }; 