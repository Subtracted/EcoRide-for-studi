const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const LogService = require('../services/logService');
const StatsService = require('../services/statsService');

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
        console.log('Données reçues:', req.body);
        
        const { 
            depart, 
            arrivee, 
            date_depart,
            date_arrivee,
            prix,
            places_totales,
            vehicule_id,
            est_ecologique,
            commentaire 
        } = req.body;

        // Validation des données
        if (!depart || !arrivee || !date_depart || !prix || !places_totales || !vehicule_id) {
            console.log('Données manquantes:', {
                depart, arrivee, date_depart, prix, places_totales, vehicule_id
            });
            return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
        }

        const result = await pool.query(
            `INSERT INTO trajets (
                conducteur_id,
                vehicule_id,
                depart,
                arrivee,
                date_depart,
                date_arrivee,
                prix,
                places_totales,
                places_restantes,
                est_ecologique,
                commentaire
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10) 
            RETURNING *`,
            [
                req.user.userId,
                vehicule_id,
                depart,
                arrivee,
                date_depart,
                date_arrivee,
                prix,
                places_totales,
                est_ecologique,
                commentaire || ''
            ]
        );

        console.log('Trajet créé:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erreur création trajet:', err);
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
        console.log('Récupération des trajets pour conducteur:', req.user.userId);
        
        const result = await pool.query(`
            SELECT t.*, 
                   v.marque, v.modele,
                   u.pseudo as conducteur_pseudo
            FROM trajets t
            JOIN vehicules v ON t.vehicule_id = v.id
            JOIN utilisateurs u ON t.conducteur_id = u.id
            WHERE t.conducteur_id = $1 
            ORDER BY t.date_depart DESC`,
            [req.user.userId]
        );

        console.log('Trajets trouvés:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération trajets conducteur:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route pour obtenir un trajet spécifique
router.get('/:id', auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.*,
                u.pseudo as conducteur_pseudo,
                u.id as conducteur_id
            FROM trajets t
            JOIN utilisateurs u ON t.conducteur_id = u.id
            WHERE t.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Trajet non trouvé' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur récupération trajet:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 