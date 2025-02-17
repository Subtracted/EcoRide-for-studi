const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/profile', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, pseudo, email, credits FROM utilisateurs WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/trajets', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM trajets WHERE conducteur_id = $1 ORDER BY date_depart DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.put('/credits', auth, async (req, res) => {
    try {
        const { credits } = req.body;
        const result = await pool.query(
            'UPDATE utilisateurs SET credits = $1 WHERE id = $2 RETURNING credits',
            [credits, req.user.id]
        );

        res.json({ credits: result.rows[0].credits });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les réservations de l'utilisateur
router.get('/reservations', auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, t.*, u.pseudo as conducteur_pseudo 
            FROM reservations r
            JOIN trajets t ON r.trajet_id = t.id
            JOIN utilisateurs u ON t.conducteur_id = u.id
            WHERE r.passager_id = $1
            ORDER BY t.date_depart DESC
        `, [req.user.id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les crédits de l'utilisateur
router.get('/credits', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT credits FROM utilisateurs WHERE id = $1',
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        res.json({ credits: result.rows[0].credits });
    } catch (err) {
        console.error('Erreur crédits:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour mettre à jour les crédits
router.put('/credits/update', auth, async (req, res) => {
    try {
        const { amount, type } = req.body; // type peut être 'add' ou 'subtract'
        const result = await pool.query(
            'UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2 RETURNING credits',
            [type === 'add' ? amount : -amount, req.user.id]
        );
        res.json({ credits: result.rows[0].credits });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 