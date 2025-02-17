const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Route pour obtenir tous les trajets
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT t.*, u.pseudo as conducteur_pseudo 
            FROM trajets t
            JOIN utilisateurs u ON t.conducteur_id = u.id
            ORDER BY t.date_depart DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { depart, arrivee, prix_max, est_ecologique } = req.query;
        
        let query = `
            SELECT t.*, u.pseudo as conducteur_pseudo
            FROM trajets t
            JOIN utilisateurs u ON t.conducteur_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (depart) {
            query += ` AND LOWER(t.depart) LIKE LOWER($${params.length + 1})`;
            params.push(`%${depart}%`);
        }
        
        if (arrivee) {
            query += ` AND LOWER(t.arrivee) LIKE LOWER($${params.length + 1})`;
            params.push(`%${arrivee}%`);
        }
        
        query += ` ORDER BY t.date_depart`;
        
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route pour créer un trajet
router.post('/', auth, async (req, res) => {
    try {
        const { depart, arrivee, date_depart, places_totales, prix, est_ecologique, vehicule_id } = req.body;
        const conducteur_id = req.user.id;

        // Vérifier que le prix n'est pas trop élevé (max 18 crédits + 2 pour la plateforme)
        if (prix > 18) {
            return res.status(400).json({ 
                message: 'Le prix ne peut pas dépasser 18 crédits (+ 2 crédits pour la plateforme)' 
            });
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur
        const vehicule = await pool.query(
            'SELECT * FROM vehicules WHERE id = $1 AND conducteur_id = $2',
            [vehicule_id, req.user.id]
        );

        if (vehicule.rows.length === 0) {
            return res.status(400).json({ message: 'Véhicule non trouvé ou non autorisé' });
        }

        // Vérifier que le nombre de places ne dépasse pas la capacité du véhicule
        if (places_totales > vehicule.rows[0].places) {
            return res.status(400).json({ 
                message: `Le nombre de places ne peut pas dépasser la capacité du véhicule (${vehicule.rows[0].places} places)` 
            });
        }

        const result = await pool.query(`
            INSERT INTO trajets (
                depart, arrivee, date_depart, places_totales, 
                places_restantes, prix, est_ecologique, conducteur_id, vehicule_id
            ) VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8) RETURNING *
        `, [depart, arrivee, date_depart, places_totales, prix + 2, est_ecologique, conducteur_id, vehicule_id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour mettre à jour le prix d'un trajet
router.put('/:id/prix', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { prix } = req.body;

        // Vérifier que le prix n'est pas trop élevé (max 18 crédits + 2 pour la plateforme)
        if (prix > 18) {
            return res.status(400).json({ 
                message: 'Le prix ne peut pas dépasser 18 crédits (+ 2 crédits pour la plateforme)' 
            });
        }

        // Vérifier que l'utilisateur est bien le conducteur du trajet
        const trajet = await pool.query(
            'SELECT * FROM trajets WHERE id = $1 AND conducteur_id = $2',
            [id, req.user.id]
        );

        if (trajet.rows.length === 0) {
            return res.status(403).json({ 
                message: 'Vous n\'êtes pas autorisé à modifier ce trajet' 
            });
        }

        // Mettre à jour le prix (ajouter les 2 crédits pour la plateforme)
        const result = await pool.query(
            'UPDATE trajets SET prix = $1 WHERE id = $2 RETURNING *',
            [prix + 2, id]
        );

        res.json({
            message: 'Prix mis à jour avec succès',
            trajet: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir les trajets d'un conducteur
router.get('/conducteur', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM trajets WHERE conducteur_id = $1 ORDER BY date_depart DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération trajets conducteur:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 