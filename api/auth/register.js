const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuration de la base de données (vous devrez adapter selon votre solution DB)
// Pour Vercel, vous pouvez utiliser une base de données cloud comme Supabase, PlanetScale, ou Neon
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

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

    // Vérification des champs requis
    if (!pseudo || !email || !password || !nom || !prenom) {
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
      process.env.JWT_SECRET || 'fallback_secret',
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
} 