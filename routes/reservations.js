const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Créer une réservation
router.post('/', auth, async (req, res) => {
    try {
        const { trajet_id } = req.body;
        const passager_id = req.user.id;

        // Vérifier le trajet et son prix
        const trajet = await pool.query(
            'SELECT t.*, u.credits as conducteur_credits FROM trajets t JOIN utilisateurs u ON t.conducteur_id = u.id WHERE t.id = $1',
            [trajet_id]
        );

        if (trajet.rows.length === 0) {
            return res.status(404).json({ message: 'Trajet non trouvé' });
        }

        // Vérifier les crédits de l'utilisateur
        const user = await pool.query(
            'SELECT credits FROM utilisateurs WHERE id = $1',
            [passager_id]
        );

        console.log('Détails de la réservation:');
        console.log('- Credits utilisateur:', user.rows[0].credits);
        console.log('- Prix trajet:', trajet.rows[0].prix);
        console.log('- Places restantes:', trajet.rows[0].places_restantes);

        if (user.rows[0].credits < trajet.rows[0].prix) {
            return res.status(400).json({ 
                message: 'Crédits insuffisants',
                credits_actuels: user.rows[0].credits,
                credits_necessaires: trajet.rows[0].prix
            });
        }

        // Vérifier les places disponibles
        if (trajet.rows[0].places_restantes < 1) {
            return res.status(400).json({ message: 'Plus de places disponibles' });
        }

        // Commencer la transaction
        await pool.query('BEGIN');

        // Créer la réservation
        await pool.query(
            'INSERT INTO reservations (passager_id, trajet_id) VALUES ($1, $2)',
            [passager_id, trajet_id]
        );

        // Mettre à jour les places
        await pool.query(
            'UPDATE trajets SET places_restantes = places_restantes - 1 WHERE id = $1',
            [trajet_id]
        );

        // Déduire les crédits du passager
        await pool.query(
            'UPDATE utilisateurs SET credits = credits - $1 WHERE id = $2',
            [trajet.rows[0].prix, passager_id]
        );

        // Ajouter les crédits au conducteur (prix - 2 crédits pour la plateforme)
        await pool.query(
            'UPDATE utilisateurs SET credits = credits + $1 WHERE id = $2',
            [trajet.rows[0].prix - 2, trajet.rows[0].conducteur_id]
        );

        // Ajouter les crédits à la plateforme (table credits_plateforme)
        await pool.query(
            'INSERT INTO credits_plateforme (montant, trajet_id) VALUES ($1, $2)',
            [2, trajet_id]
        );

        await pool.query('COMMIT');

        res.status(201).json({ 
            message: 'Réservation effectuée avec succès',
            credits_restants: user.rows[0].credits - trajet.rows[0].prix
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Erreur réservation:', err);
        res.status(500).json({ message: 'Erreur serveur' });
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