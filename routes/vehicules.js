const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Récupérer les véhicules de l'utilisateur connecté
router.get('/mes-vehicules', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM vehicules WHERE conducteur_id = $1',
            [req.user.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération véhicules:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Ajouter un véhicule
router.post('/', auth, async (req, res) => {
    try {
        const { marque, modele, annee, places, est_ecologique } = req.body;
        const result = await pool.query(
            `INSERT INTO vehicules (conducteur_id, marque, modele, annee, places, est_ecologique)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user.userId, marque, modele, annee, places, est_ecologique]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur création véhicule:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 