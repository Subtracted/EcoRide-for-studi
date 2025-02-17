const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const bcrypt = require('bcryptjs');

// Créer un compte employé
router.post('/employes', auth, checkRole('admin'), async (req, res) => {
    try {
        const { email, password, nom, prenom } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO utilisateurs (email, password, nom, prenom, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [email, hashedPassword, nom, prenom, 'employe']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur création employé:', err);
        res.status(500).json({ message: 'Erreur serveur' });
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

module.exports = router; 