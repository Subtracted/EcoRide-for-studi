const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const bcrypt = require('bcryptjs');
const { StatsService } = require('../services/statsService');
const { connectToMongo } = require('../config/mongodb');

// Route pour créer un employé (accessible uniquement par l'admin)
router.post('/employes', auth, checkRole('admin'), async (req, res) => {
    const { nom, prenom, email, password } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Vérifier si l'email existe déjà
        const emailCheck = await client.query(
            'SELECT * FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            throw new Error('Cet email est déjà utilisé');
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer l'utilisateur avec le rôle 'employe'
        const result = await client.query(
            `INSERT INTO utilisateurs (nom, prenom, email, password, role, statut)
             VALUES ($1, $2, $3, $4, 'employe', 'actif')
             RETURNING id, nom, prenom, email, role, statut`,
            [nom, prenom, email, hashedPassword]
        );

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erreur création employé:', err);
        res.status(400).json({ 
            message: err.message || 'Erreur lors de la création du compte employé'
        });
    } finally {
        client.release();
    }
});

// Obtenir les statistiques des covoiturages
router.get('/stats/covoiturages', auth, checkRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE(date_depart) as date, COUNT(*) as count
            FROM trajets
            WHERE date_depart >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(date_depart)
            ORDER BY date
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur stats covoiturages:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Obtenir les statistiques des crédits
router.get('/stats/credits', auth, checkRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE(date_creation) as date, SUM(montant) as amount
            FROM credits_plateforme
            WHERE date_creation >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(date_creation)
            ORDER BY date
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur stats crédits:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Suspendre/réactiver un compte
router.put('/suspend-account', auth, checkRole('admin'), async (req, res) => {
    try {
        const { userId, type } = req.body;
        const result = await pool.query(
            'UPDATE utilisateurs SET statut = CASE WHEN statut = \'actif\' THEN \'suspendu\' ELSE \'actif\' END WHERE id = $1 RETURNING *',
            [userId]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur suspension compte:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/stats', auth, checkRole('admin'), async (req, res) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Stats sur 30 jours
        
        const stats = await StatsService.getDailyStats(startDate, new Date());
        res.json(stats);
    } catch (err) {
        console.error('Erreur récupération stats:', err);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des statistiques',
            detail: err.message 
        });
    }
});

router.get('/dashboard', auth, checkRole('admin'), async (req, res) => {
    try {
        const db = await connectToMongo();
        
        // Récupérer les dernières connexions
        const recentConnections = await db.collection('connection_logs')
            .find()
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();
            
        // Récupérer les dernières actions sur les trajets
        const recentTrajetActions = await db.collection('trajet_logs')
            .find()
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();
            
        // Récupérer les stats des 30 derniers jours
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const stats = await StatsService.getDailyStats(startDate, new Date());
        
        res.json({
            recentConnections,
            recentTrajetActions,
            stats
        });
    } catch (err) {
        console.error('Erreur dashboard:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer la liste des employés
router.get('/employes', auth, checkRole('admin'), async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT id, nom, prenom, email, role, statut, credits
            FROM utilisateurs
            WHERE role = 'employe'
            ORDER BY nom, prenom
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération employés:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

module.exports = router; 