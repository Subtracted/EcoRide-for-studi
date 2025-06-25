const jwt = require('jsonwebtoken');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjsaovtcamcahdfks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTgzMDYsImV4cCI6MjA0OTU5NDMwNn0.rSO2vLnQs6VJQPEe2kJLDSjjFFsrApJ5kZl4FGYLd1I';
// Clé de service pour bypasser RLS sur les opérations d'écriture
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

  if (req.method === 'GET') {
    // RECHERCHE DE TRAJETS OU RÉCUPÉRATION D'UN TRAJET SPÉCIFIQUE
    try {
      // Vérification du token (optionnelle pour la recherche)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
      }
      
      // Vérifier si c'est une requête pour un trajet spécifique (id dans l'URL)
      const { id } = req.query;
      
      if (id) {
        // Récupération d'un trajet spécifique
        const trajetResponse = await fetch(
          `${supabaseUrl}/rest/v1/trajets?id=eq.${id}`, 
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!trajetResponse.ok) {
          throw new Error('Erreur lors de la récupération du trajet');
        }

        const trajets = await trajetResponse.json();
        
        if (trajets.length === 0) {
          return res.status(404).json({ message: 'Trajet non trouvé' });
        }

        return res.json(trajets[0]);
      }
      
      // Récupération des paramètres de recherche
      const { depart, arrivee, date, prix_max, est_ecologique } = req.query;
      
      // Construction de l'URL de recherche Supabase avec JOIN pour récupérer les infos du conducteur
      let searchUrl = `${supabaseUrl}/rest/v1/trajets?select=*,conducteur:utilisateurs(id,pseudo,note,nombre_avis,photo_url)&`;
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
      
      // Récupération des trajets avec informations du conducteur
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
      
      // Transformer les données pour aplatir les informations du conducteur
      const trajetsWithConducteurInfo = trajets.map(trajet => ({
        ...trajet,
        conducteur_pseudo: trajet.conducteur?.pseudo || 'Conducteur',
        conducteur_note: trajet.conducteur?.note || 0,
        conducteur_nombre_avis: trajet.conducteur?.nombre_avis || 0,
        conducteur_photo: trajet.conducteur?.photo_url || null
      }));
      
      res.json(trajetsWithConducteurInfo);

    } catch (err) {
      console.error('Erreur recherche trajets:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }

  } else if (req.method === 'POST') {
    // CRÉATION DE TRAJET
    try {
      // Vérification du token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
      
      const { 
        depart, 
        arrivee, 
        date_depart,
        date_arrivee,
        prix,
        places_totales,
        vehicule_id,
        est_ecologique,
        commentaire 
      } = req.body;

      // Log des données reçues pour debug
      console.log('Données reçues pour création trajet:', req.body);
      console.log('User ID from token:', decoded.userId);

      // Conversion des types de données
      const vehiculeIdInt = parseInt(vehicule_id);
      const placesTotalesInt = parseInt(places_totales);
      const prixFloat = parseFloat(prix);

      // Validation des données
      if (!depart || !arrivee || !date_depart || !prix || !places_totales || !vehicule_id) {
        console.log('Validation échouée:', { depart, arrivee, date_depart, prix, places_totales, vehicule_id });
        return res.status(400).json({ message: 'Tous les champs requis doivent être remplis' });
      }

      // Validation des types convertis
      if (isNaN(vehiculeIdInt) || isNaN(placesTotalesInt) || isNaN(prixFloat)) {
        console.log('Erreur conversion types:', { vehiculeIdInt, placesTotalesInt, prixFloat });
        return res.status(400).json({ message: 'Formats de données invalides' });
      }

      // Vérifier que le véhicule appartient bien au conducteur
      const vehiculeResponse = await fetch(
        `${supabaseUrl}/rest/v1/vehicules?id=eq.${vehiculeIdInt}&conducteur_id=eq.${decoded.userId}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!vehiculeResponse.ok) {
        console.error('Erreur vérification véhicule:', await vehiculeResponse.text());
        throw new Error('Erreur lors de la vérification du véhicule');
      }

      const vehicules = await vehiculeResponse.json();
      
      if (vehicules.length === 0) {
        console.log('Véhicule non trouvé:', vehiculeIdInt, 'pour conducteur:', decoded.userId);
        return res.status(400).json({ message: 'Véhicule non trouvé ou non autorisé' });
      }

      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/trajets`, 
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
            vehicule_id: vehiculeIdInt,
            depart,
            arrivee,
            date_depart,
            date_arrivee,
            prix: prixFloat,
            places_totales: placesTotalesInt,
            places_restantes: placesTotalesInt,
            est_ecologique: est_ecologique || false,
            commentaire: commentaire || '',
            created_at: new Date().toISOString()
          })
        }
      );

      if (!insertResponse.ok) {
        const errorData = await insertResponse.text();
        console.error('Erreur Supabase insertion trajet:', errorData);
        throw new Error(`Erreur lors de la création du trajet: ${errorData}`);
      }

      const newTrajet = await insertResponse.json();
      res.status(201).json(newTrajet[0]);

    } catch (err) {
      console.error('Erreur création trajet:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }

  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
} 
