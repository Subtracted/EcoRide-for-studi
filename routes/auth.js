const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/register', async (req, res) => {
    try {
        const { pseudo, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query(
            'SELECT * FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hash du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Créer l'utilisateur avec 20 crédits par défaut
        const result = await pool.query(
            'INSERT INTO utilisateurs (pseudo, email, mot_de_passe, credits) VALUES ($1, $2, $3, 20) RETURNING id, pseudo, email, credits',
            [pseudo, email, hashedPassword]
        );

        // Générer le token JWT
        const token = jwt.sign(
            { id: result.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: result.rows[0].id,
                pseudo: result.rows[0].pseudo,
                email: result.rows[0].email,
                credits: result.rows[0].credits
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;
        
        console.log('Tentative de connexion:', { email, mot_de_passe });

        const user = await pool.query(
            'SELECT * FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérification du mot de passe
        const validPassword = await bcrypt.compare(mot_de_passe, user.rows[0].mot_de_passe);
        
        console.log('Vérification mot de passe:', {
            recu: mot_de_passe,
            hash_stocke: user.rows[0].mot_de_passe,
            valide: validPassword
        });

        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Création du token
        const token = jwt.sign(
            { 
                userId: user.rows[0].id,
                role: user.rows[0].role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Retourner la réponse
        res.json({
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                pseudo: user.rows[0].pseudo,
                role: user.rows[0].role,
                credits: user.rows[0].credits
            },
            token
        });

    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 