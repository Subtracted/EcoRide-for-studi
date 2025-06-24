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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérification du token (optionnelle pour la recherche)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
    }
    
    // Récupération des paramètres de recherche
    const { depart, arrivee, date, prix_max, est_ecologique } = req.query;
    
    // Construction de l'URL de recherche Supabase
    let searchUrl = `${supabaseUrl}/rest/v1/trajets?`;
    const searchParams = [];
    
    if (depart) {
      searchParams.push(`depart=ilike.*${depart}*`);
    }
    
    if (arrivee) {
      searchParams.push(`arrivee=ilike.*${arrivee}*`);
    }
    
    if (date) {
      // Recherche par date (début de journée)
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      searchParams.push(`date_depart=gte.${searchDate.toISOString()}`);
      searchParams.push(`date_depart=lt.${nextDay.toISOString()}`);
    }
    
    if (prix_max) {
      searchParams.push(`prix=lte.${prix_max}`);
    }
    
    if (est_ecologique === 'true') {
      searchParams.push(`est_ecologique=eq.true`);
    }
    
    // Ajouter un filtre pour les places disponibles
    searchParams.push(`places_restantes=gt.0`);
    
    searchUrl += searchParams.join('&');
    
    // Récupération des trajets
    const trajetsResponse = await fetch(searchUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!trajetsResponse.ok) {
      throw new Error('Erreur lors de la recherche des trajets');
    }

    const trajets = await trajetsResponse.json();
    res.json(trajets);

  } catch (err) {
    console.error('Erreur recherche trajets:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
} 