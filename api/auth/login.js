const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjsaovtcamcahdfks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTgzMDYsImV4cCI6MjA0OTU5NDMwNn0.rSO2vLnQs6VJQPEe2kJLDSjjFFsrApJ5kZl4FGYLd1I';

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
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Recherche de l'utilisateur
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?email=eq.${email}`, 
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const users = await userResponse.json();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.mot_de_passe);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        credits: user.credits,
        pseudo: user.pseudo
      }
    });
  } catch (err) {
    console.error('Erreur login détaillée:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
} 