const jwt = require('jsonwebtoken');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjsaovtcamcahdfks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTgzMDYsImV4cCI6MjA0OTU5NDMwNn0.rSO2vLnQs6VJQPEe2kJLDSjjFFsrApJ5kZl4FGYLd1I';

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Vérification du token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');

    if (req.method === 'GET') {
      // Récupération des préférences personnalisées utilisateur
      const preferencesResponse = await fetch(
        `${supabaseUrl}/rest/v1/preferences_custom?conducteur_id=eq.${decoded.userId}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!preferencesResponse.ok) {
        // Si les préférences n'existent pas, retourner un tableau vide
        return res.json([]);
      }

      const preferences = await preferencesResponse.json();
      res.json(preferences);

    } else if (req.method === 'POST') {
      // Création d'une nouvelle préférence personnalisée
      const { description } = req.body;

      if (!description) {
        return res.status(400).json({ message: 'Description requise' });
      }

      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/preferences_custom`, 
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            conducteur_id: decoded.userId,
            description
          })
        }
      );

      if (!insertResponse.ok) {
        const errorData = await insertResponse.text();
        console.error('Erreur création préférence:', errorData);
        throw new Error('Erreur lors de la création de la préférence');
      }

      const newPreference = await insertResponse.json();
      res.status(201).json(newPreference[0]);

    } else {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }

  } catch (err) {
    console.error('Erreur API preferences:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
} 