const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Récupérer les véhicules de l'utilisateur
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM vehicules WHERE conducteur_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Ajouter un véhicule
router.post('/', auth, async (req, res) => {
    try {
        const { immatriculation, date_immatriculation, modele, couleur, marque, places } = req.body;
        
        const result = await pool.query(
            `INSERT INTO vehicules (conducteur_id, immatriculation, date_immatriculation, 
            modele, couleur, marque, places) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.id, immatriculation, date_immatriculation, modele, couleur, marque, places]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 