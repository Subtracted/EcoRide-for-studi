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
    // Vérification du token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
    
    // Récupération du type de données via query parameter
    const { type } = req.query;

    switch(type) {
      case 'profile':
      case 'me':
        // Récupération du profil utilisateur
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

        if (!userResponse.ok) {
          throw new Error('Erreur lors de la récupération du profil');
        }

        const users = await userResponse.json();
        
        if (users.length === 0) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const user = users[0];
        
        // Retourner les données du profil (sans le mot de passe)
        res.json({
          id: user.id,
          pseudo: user.pseudo,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          telephone: user.telephone,
          credits: user.credits,
          role: user.role,
          photo_url: user.photo_url,
          note: user.note,
          nombre_avis: user.nombre_avis
        });
        break;

      case 'reservations':
        // Récupération des réservations de l'utilisateur avec les détails du trajet
        const reservationsResponse = await fetch(
          `${supabaseUrl}/rest/v1/reservations?passager_id=eq.${decoded.userId}&select=*,trajets(*)`, 
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

        const reservationsData = await reservationsResponse.json();
        
        // Transformer les données pour inclure les infos du trajet
        const reservationsWithDetails = await Promise.all(reservationsData.map(async (reservation) => {
          // Récupérer les détails du trajet
          const trajetResponse = await fetch(
            `${supabaseUrl}/rest/v1/trajets?id=eq.${reservation.trajet_id}`, 
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const trajets = await trajetResponse.json();
          const trajet = trajets[0] || {};

          // Récupérer les infos du conducteur
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
          const conducteur = conducteurs[0] || {};

          return {
            id: reservation.id,
            trajet_id: reservation.trajet_id,
            date_reservation: reservation.date_reservation,
            statut: reservation.statut,
            prix_total: reservation.prix_total,
            // Données du trajet
            depart: trajet.depart,
            arrivee: trajet.arrivee,
            date_depart: trajet.date_depart,
            prix: trajet.prix,
            // Données du conducteur
            conducteur_pseudo: conducteur.pseudo || conducteur.nom || 'Conducteur inconnu'
          };
        }));

        console.log('🔍 Réservations récupérées:', reservationsWithDetails);
        res.json(reservationsWithDetails);
        break;

      case 'trajets':
      case 'conducteur':
        // Récupération des trajets du conducteur
        const trajetsResponse = await fetch(
          `${supabaseUrl}/rest/v1/trajets?conducteur_id=eq.${decoded.userId}`, 
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!trajetsResponse.ok) {
          throw new Error('Erreur lors de la récupération des trajets');
        }

        const trajets = await trajetsResponse.json();
        res.json(trajets);
        break;

      case 'vehicules':
        // Récupération des véhicules de l'utilisateur
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
          throw new Error('Erreur lors de la récupération des véhicules');
        }

        const vehicules = await vehiculesResponse.json();
        res.json(vehicules);
        break;

      default:
        return res.status(400).json({ message: 'Type de données non spécifié. Utilisez ?type=profile|reservations|trajets|vehicules' });
    }

  } catch (err) {
    console.error('Erreur API user:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
} 
