const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Créer une réservation
router.post('/', auth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { trajetId } = req.body;
        const userId = req.user.userId;

        // Vérifier que l'utilisateur n'est pas le conducteur
        const trajetResult = await client.query(
            'SELECT * FROM trajets WHERE id = $1',
            [trajetId]
        );

        if (trajetResult.rows.length === 0) {
            throw new Error('Trajet non trouvé');
        }

        const trajet = trajetResult.rows[0];

        // Empêcher le conducteur de réserver son propre trajet
        if (trajet.conducteur_id === userId) {
            throw new Error('Vous ne pouvez pas réserver votre propre trajet');
        }

        // Vérifier les places
        if (trajet.places_restantes <= 0) {
            throw new Error('Plus de places disponibles');
        }

        // Vérifier les crédits
        const userResult = await client.query(
            'SELECT credits FROM utilisateurs WHERE id = $1',
            [userId]
        );

        if (userResult.rows[0].credits < trajet.prix) {
            throw new Error('Crédits insuffisants');
        }

        // Créer la réservation
        await client.query(
            'INSERT INTO reservations (trajet_id, utilisateur_id, statut) VALUES ($1, $2, $3)',
            [trajetId, userId, 'confirmé']
        );

        // Mettre à jour les places
        await client.query(
            'UPDATE trajets SET places_restantes = places_restantes - 1 WHERE id = $1',
            [trajetId]
        );

        // Mettre à jour les crédits
        await client.query(
            'UPDATE utilisateurs SET credits = credits - $1 WHERE id = $2',
            [trajet.prix, userId]
        );

        // Ajouter les crédits au conducteur
        await client.query(
            'UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2',
            [trajet.prix - 2, trajet.conducteur_id] // -2 pour les frais de plateforme
        );

        await client.query('COMMIT');
        
        res.json({ 
            message: 'Réservation effectuée avec succès',
            reservation: {
                trajetId,
                prix: trajet.prix,
                placesRestantes: trajet.places_restantes - 1
            }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erreur réservation:', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

// Route pour obtenir les réservations d'un utilisateur
router.get('/user', auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, 
                   t.depart, t.arrivee, t.date_depart, t.prix,
                   u.pseudo as conducteur_pseudo
            FROM reservations r
            JOIN trajets t ON r.trajet_id = t.id
            JOIN utilisateurs u ON t.conducteur_id = u.id
            WHERE r.passager_id = $1
            ORDER BY t.date_depart DESC
        `, [req.user.id]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur récupération réservations:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 