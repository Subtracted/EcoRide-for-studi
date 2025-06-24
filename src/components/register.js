const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction de validation du mot de passe côté serveur
const validatePasswordServer = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  // Vérification des motifs interdits
  const forbiddenPatterns = [/123456/, /password/i, /qwerty/i, /azerty/i];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(password)) {
      errors.push('Le mot de passe ne doit pas contenir de séquences communes');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjsaovtcamcahdfks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTgzMDYsImV4cCI6MjA0OTU5NDMwNn0.rSO2vLnQs6VJQPEe2kJLDSjjFFsrApJ5kZl4FGYLd1I';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDAxODMwNiwiZXhwIjoyMDQ5NTk0MzA2fQ.t8iNNxON1vOhKfhF3qGhxDcPcH3D1HlxYZKfOhF3qGh';

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

    // Validation du mot de passe
    const passwordValidation = validatePasswordServer(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Le mot de passe ne respecte pas les critères de sécurité',
        errors: passwordValidation.errors
      });
    }

    // Vérification si l'email existe déjà
    const emailCheck = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?email=eq.${email}`, 
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const existingUsers = await emailCheck.json();
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé' 
      });
    }

    // Vérification si le pseudo existe déjà
    const pseudoCheck = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?pseudo=eq.${pseudo}`, 
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const existingPseudos = await pseudoCheck.json();
    
    if (existingPseudos.length > 0) {
      return res.status(400).json({ 
        message: 'Ce pseudo est déjà utilisé' 
      });
    }

    // Hashage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertion de l'utilisateur avec tous les champs de la table
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs`, 
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pseudo,
          email,
          mot_de_passe: hashedPassword,
          nom,
          prenom,
          telephone: telephone || '',
          photo_url: '',
          note: 0,
          date_inscription: new Date().toISOString(),
          nombre_avis: 0,
          type_utilisateur: 'utilisateur',
          credits: 20,
          role: 'utilisateur',
          statut: 'actif',
          date_creation: new Date().toISOString()
        })
      }
    );

    if (!insertResponse.ok) {
      const errorData = await insertResponse.text();
      console.error('Erreur Supabase insertion:', errorData);
      throw new Error(`Erreur lors de la création de l'utilisateur: ${errorData}`);
    }

    const newUser = await insertResponse.json();
    console.log('Utilisateur créé:', newUser[0]);

    const token = jwt.sign(
      { 
        userId: newUser[0].id,
        role: newUser[0].role
      },
      process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser[0].id,
        pseudo: newUser[0].pseudo,
        email: newUser[0].email,
        role: newUser[0].role
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