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

      // Vérifier si l'utilisateur a assez de crédits
      const userResponse = await fetch(
        `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${decoded.userId}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const users = await userResponse.json();
      const user = users[0];

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (user.credits < trajet.prix) {
        return res.status(400).json({ 
          message: `Crédits insuffisants. Vous avez ${user.credits} crédits, le trajet coûte ${trajet.prix} crédits.` 
        });
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
            prix_total: trajet.prix,
            nombre_places: 1,
            date_reservation: new Date().toISOString()
          })
        }
      );

      if (!insertResponse.ok) {
        const errorData = await insertResponse.text();
        console.error('Erreur Supabase insertion réservation:', errorData);
        throw new Error(`Erreur lors de la création de la réservation: ${errorData}`);
      }

      // Déduire les crédits de l'utilisateur
      const updateUserResponse = await fetch(
        `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${decoded.userId}`, 
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            credits: user.credits - trajet.prix
          })
        }
      );

      if (!updateUserResponse.ok) {
        console.error('Erreur mise à jour crédits utilisateur');
        // Note: En production, il faudrait ici annuler la réservation
      }

      // Ajouter des crédits au conducteur
      const conducteurResponse = await fetch(
        `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${trajet.conducteur_id}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const conducteurs = await conducteurResponse.json();
      const conducteur = conducteurs[0];

      if (conducteur) {
        await fetch(
          `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${trajet.conducteur_id}`, 
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              credits: conducteur.credits + trajet.prix
            })
          }
        );
      }

      // Mettre à jour le nombre de places restantes
      const updateTrajetResponse = await fetch(
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

      if (!updateTrajetResponse.ok) {
        console.error('Erreur mise à jour places restantes');
      }

      const newReservation = await insertResponse.json();
      
      console.log(`✅ Réservation créée: utilisateur ${decoded.userId} a payé ${trajet.prix} crédits pour le trajet ${trajet_id}`);
      
      res.status(201).json({
        ...newReservation[0],
        message: `Réservation confirmée ! ${trajet.prix} crédits déduits. Nouveau solde: ${user.credits - trajet.prix} crédits.`
      });

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
