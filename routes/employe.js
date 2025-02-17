const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Obtenir les avis en attente
router.get('/avis/en-attente', auth, checkRole('employe'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, 
                   u1.pseudo as auteur_pseudo,
                   u2.pseudo as conducteur_pseudo
            FROM avis a
            JOIN utilisateurs u1 ON a.auteur_id = u1.id
            JOIN utilisateurs u2 ON a.conducteur_id = u2.id
            WHERE a.statut = 'en_attente'
            ORDER BY a.date_creation DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération avis:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Valider/refuser un avis
router.put('/avis/:id/:action', auth, checkRole('employe'), async (req, res) => {
    try {
        const { id, action } = req.params;
        const nouveauStatut = action === 'valider' ? 'valide' : 'refuse';

        const result = await pool.query(
            'UPDATE avis SET statut = $1 WHERE id = $2 RETURNING *',
            [nouveauStatut, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur modification avis:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Obtenir les signalements
router.get('/signalements', auth, checkRole('employe'), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*,
                   t.depart as ville_depart,
                   t.arrivee as ville_arrivee,
                   t.date_depart,
                   u1.pseudo as conducteur_pseudo,
                   u1.email as conducteur_email,
                   u2.pseudo as passager_pseudo,
                   u2.email as passager_email
            FROM signalements s
            JOIN trajets t ON s.trajet_id = t.id
            JOIN utilisateurs u1 ON t.conducteur_id = u1.id
            JOIN utilisateurs u2 ON s.passager_id = u2.id
            ORDER BY s.date_signalement DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération signalements:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 