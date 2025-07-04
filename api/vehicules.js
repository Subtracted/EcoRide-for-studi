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

  try {
    // Vérification du token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');

    if (req.method === 'GET') {
      // Récupération des véhicules
      console.log(`Récupération des véhicules pour l'utilisateur ${decoded.userId}`);
      
      const vehiculesResponse = await fetch(
        `${supabaseUrl}/rest/v1/vehicules?conducteur_id=eq.${decoded.userId}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!vehiculesResponse.ok) {
        const errorText = await vehiculesResponse.text();
        console.error('Erreur Supabase véhicules:', errorText);
        throw new Error('Erreur lors de la récupération des véhicules');
      }

      const vehicules = await vehiculesResponse.json();
      console.log(`Véhicules trouvés:`, vehicules);
      res.json(vehicules);

    } else if (req.method === 'POST') {
      // Ajout d'un véhicule
      const { marque, modele, annee, places, est_ecologique, couleur, immatriculation, date_immatriculation } = req.body;

      if (!marque || !modele || !annee || !places) {
        return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
      }

      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/vehicules`, 
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
            marque,
            modele,
            annee: parseInt(annee),
            places: parseInt(places),
            est_ecologique: est_ecologique || false,
            couleur: couleur || '',
            immatriculation: immatriculation || '',
            date_immatriculation: date_immatriculation || null,
            created_at: new Date().toISOString()
          })
        }
      );

      if (!insertResponse.ok) {
        const errorData = await insertResponse.text();
        console.error('Erreur Supabase insertion véhicule:', errorData);
        throw new Error(`Erreur lors de la création du véhicule: ${errorData}`);
      }

      const newVehicule = await insertResponse.json();
      res.status(201).json(newVehicule[0]);
    } else {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }

  } catch (err) {
    console.error('Erreur API véhicules:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
} 
