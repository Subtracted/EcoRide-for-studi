const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const LogService = require('../services/logService');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    try {
        console.log('Données reçues:', req.body);

        const { 
            pseudo, 
            email, 
            password, 
            nom, 
            prenom, 
            telephone 
        } = req.body;

        // Log des données extraites
        console.log('Données extraites:', {
            pseudo, email, password: '***', nom, prenom, telephone
        });

        // Vérification des champs requis
        if (!pseudo || !email || !password || !nom || !prenom) {
            console.log('Champs manquants:', {
                pseudo: !!pseudo,
                email: !!email,
                password: !!password,
                nom: !!nom,
                prenom: !!prenom
            });
            return res.status(400).json({ 
                message: 'Tous les champs obligatoires doivent être remplis',
                details: {
                    pseudo: !pseudo ? 'Pseudo requis' : null,
                    email: !email ? 'Email requis' : null,
                    password: !password ? 'Mot de passe requis' : null,
                    nom: !nom ? 'Nom requis' : null,
                    prenom: !prenom ? 'Prénom requis' : null
                }
            });
        }

        // Vérification si l'email existe déjà
        const emailExists = await pool.query(
            'SELECT * FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (emailExists.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Cet email est déjà utilisé' 
            });
        }

        // Vérification si le pseudo existe déjà
        const pseudoExists = await pool.query(
            'SELECT * FROM utilisateurs WHERE pseudo = $1',
            [pseudo]
        );

        if (pseudoExists.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Ce pseudo est déjà utilisé' 
            });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertion de l'utilisateur
        const result = await pool.query(`
            INSERT INTO utilisateurs (
                pseudo, 
                email, 
                mot_de_passe,
                nom, 
                prenom, 
                telephone,
                credits,
                role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id, pseudo, email, role`,
            [
                pseudo, 
                email, 
                hashedPassword, 
                nom, 
                prenom, 
                telephone || '', 
                20, 
                'utilisateur'
            ]
        );

        console.log('Utilisateur créé:', result.rows[0]);

        const token = jwt.sign(
            { 
                userId: result.rows[0].id,
                role: result.rows[0].role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: result.rows[0].id,
                pseudo: result.rows[0].pseudo,
                email: result.rows[0].email,
                role: result.rows[0].role
            },
            token
        });

    } catch (err) {
        console.error('Erreur détaillée inscription:', err);
        res.status(500).json({ 
            message: 'Erreur lors de l\'inscription',
            details: err.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const user = await pool.query(
            'SELECT id, email, password, role, credits, pseudo FROM utilisateurs WHERE email = $1',
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { userId: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Renvoyer toutes les infos nécessaires
        res.json({
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                role: user.rows[0].role,
                credits: user.rows[0].credits,
                pseudo: user.rows[0].pseudo
            }
        });
    } catch (err) {
        console.error('Erreur login détaillée:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, email, role, credits, pseudo FROM utilisateurs WHERE id = $1',
            [req.user.userId]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({ user: user.rows[0] });
    } catch (err) {
        console.error('Erreur /me:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 