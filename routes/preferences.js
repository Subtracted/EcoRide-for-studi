const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Récupérer toutes les préférences
router.get('/', auth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Vérifier si les tables existent
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'preferences'
            )`
        );

        if (!tableCheck.rows[0].exists) {
            throw new Error('Tables non initialisées');
        }

        // Récupérer les préférences
        const result = await client.query(`
            SELECT 
                p.*,
                CASE WHEN up.utilisateur_id IS NOT NULL THEN true ELSE false END as selected
            FROM preferences p
            LEFT JOIN utilisateur_preferences up 
                ON p.id = up.preference_id 
                AND up.utilisateur_id = $1
            ORDER BY p.nom
        `, [req.user.id]);

        await client.query('COMMIT');
        res.json(result.rows);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erreur récupération préférences:', err);
        res.status(500).json({ 
            message: 'Erreur serveur',
            detail: err.message
        });
    } finally {
        client.release();
    }
});

// Ajouter/Retirer une préférence pour un utilisateur
router.post('/toggle', auth, async (req, res) => {
    const { preferenceId } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Vérifier si la préférence existe déjà
        const existingPref = await client.query(
            'SELECT * FROM utilisateur_preferences WHERE utilisateur_id = $1 AND preference_id = $2',
            [req.user.id, preferenceId]
        );

        if (existingPref.rows.length > 0) {
            // Supprimer la préférence
            await client.query(
                'DELETE FROM utilisateur_preferences WHERE utilisateur_id = $1 AND preference_id = $2',
                [req.user.id, preferenceId]
            );
        } else {
            // Ajouter la préférence
            await client.query(
                'INSERT INTO utilisateur_preferences (utilisateur_id, preference_id) VALUES ($1, $2)',
                [req.user.id, preferenceId]
            );
        }

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erreur toggle préférence:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    } finally {
        client.release();
    }
});

// Ajouter une nouvelle préférence
router.post('/', auth, async (req, res) => {
    const { nom } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO preferences (nom) VALUES ($1) RETURNING *',
            [nom]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erreur ajout préférence:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 