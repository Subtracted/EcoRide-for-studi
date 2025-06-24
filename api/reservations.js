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
      // Récupération des réservations de l'utilisateur
      const reservationsResponse = await fetch(
        `${supabaseUrl}/rest/v1/reservations?passager_id=eq.${decoded.userId}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!reservationsResponse.ok) {
        throw new Error('Erreur lors de la récupération des réservations');
      }

      const reservations = await reservationsResponse.json();
      res.json(reservations);

    } else if (req.method === 'POST') {
      // Création d'une réservation
      const { trajet_id } = req.body;

      if (!trajet_id) {
        return res.status(400).json({ message: 'ID du trajet requis' });
      }

      // Vérifier que le trajet existe et a des places disponibles
      const trajetResponse = await fetch(
        `${supabaseUrl}/rest/v1/trajets?id=eq.${trajet_id}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const trajets = await trajetResponse.json();
      
      if (trajets.length === 0) {
        return res.status(404).json({ message: 'Trajet non trouvé' });
      }

      const trajet = trajets[0];
      
      if (trajet.places_restantes <= 0) {
        return res.status(400).json({ message: 'Plus de places disponibles' });
      }

      if (trajet.conducteur_id === decoded.userId) {
        return res.status(400).json({ message: 'Vous ne pouvez pas réserver votre propre trajet' });
      }

      // Créer la réservation
      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/reservations`, 
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            trajet_id,
            passager_id: decoded.userId,
            statut: 'confirmee',
            date_reservation: new Date().toISOString()
          })
        }
      );

      if (!insertResponse.ok) {
        const errorData = await insertResponse.text();
        console.error('Erreur Supabase insertion réservation:', errorData);
        throw new Error(`Erreur lors de la création de la réservation: ${errorData}`);
      }

      // Mettre à jour le nombre de places restantes
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/trajets?id=eq.${trajet_id}`, 
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            places_restantes: trajet.places_restantes - 1
          })
        }
      );

      if (!updateResponse.ok) {
        console.error('Erreur mise à jour places restantes');
      }

      const newReservation = await insertResponse.json();
      res.status(201).json(newReservation[0]);

    } else {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }

  } catch (err) {
    console.error('Erreur API réservations:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
} 