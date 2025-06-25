const jwt = require('jsonwebtoken');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjsaovtcamcahdfks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTgzMDYsImV4cCI6MjA0OTU5NDMwNn0.rSO2vLnQs6VJQPEe2kJLDSjjFFsrApJ5kZl4FGYLd1I';

export default async function handler(req, res) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID du trajet requis' });
  }

  if (req.method === 'GET') {
    try {
      // Vérification du token (optionnelle pour la récupération)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
      }

      // Récupération du trajet spécifique avec les informations du conducteur
      const trajetResponse = await fetch(
        `${supabaseUrl}/rest/v1/trajets?id=eq.${id}&select=*,conducteur:utilisateurs(id,pseudo,note,nombre_avis,photo_url)`, 
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

      const trajet = trajets[0];
      
      // Transformer les données pour aplatir les informations du conducteur
      const trajetWithConducteurInfo = {
        ...trajet,
        conducteur_pseudo: trajet.conducteur?.pseudo || 'Conducteur',
        conducteur_note: trajet.conducteur?.note || 0,
        conducteur_nombre_avis: trajet.conducteur?.nombre_avis || 0,
        conducteur_photo: trajet.conducteur?.photo_url || null
      };

      res.json(trajetWithConducteurInfo);

    } catch (err) {
      console.error('Erreur récupération trajet:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }

  } else if (req.method === 'PUT') {
    // Mise à jour d'un trajet (ou action démarrer/terminer)
    try {
      // Vérification du token obligatoire pour la modification
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');

      const { action } = req.body;

      // Gestion des actions spéciales (démarrer/terminer)
      if (action && ['demarrer', 'terminer'].includes(action)) {
        // Vérifier que l'utilisateur est le conducteur du trajet
        const trajetResponse = await fetch(
          `${supabaseUrl}/rest/v1/trajets?id=eq.${id}&conducteur_id=eq.${decoded.userId}`,
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
          return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à modifier ce trajet' });
        }

        // Utiliser le commentaire pour stocker le statut temporairement
        // En production, il faudrait ajouter une colonne statut à la table
        let updateData = {};
        
        if (action === 'demarrer') {
          updateData = {
            commentaire: `[DEMARRE]${trajets[0].commentaire || ''}`,
            date_depart: new Date().toISOString()
          };
        } else if (action === 'terminer') {
          updateData = {
            commentaire: (trajets[0].commentaire || '').replace('[DEMARRE]', '[TERMINE]'),
            date_arrivee: new Date().toISOString()
          };
        }

        // Mettre à jour le trajet
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/trajets?id=eq.${id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(updateData)
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Erreur Supabase update:', errorText);
          throw new Error('Erreur lors de la mise à jour du trajet');
        }

        const updatedTrajet = await updateResponse.json();

        return res.json({
          message: `Trajet ${action === 'demarrer' ? 'démarré' : 'terminé'} avec succès`,
          trajet: updatedTrajet[0]
        });
      }

      // Mise à jour normale du trajet
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/trajets?id=eq.${id}&conducteur_id=eq.${decoded.userId}`, 
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(req.body)
        }
      );

      if (!updateResponse.ok) {
        const errorData = await updateResponse.text();
        console.error('Erreur mise à jour trajet:', errorData);
        throw new Error('Erreur lors de la mise à jour du trajet');
      }

      const updatedTrajet = await updateResponse.json();
      
      if (updatedTrajet.length === 0) {
        return res.status(404).json({ message: 'Trajet non trouvé ou non autorisé' });
      }

      res.json(updatedTrajet[0]);

    } catch (err) {
      console.error('Erreur mise à jour trajet:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }

  } else if (req.method === 'DELETE') {
    // Suppression d'un trajet
    try {
      // Vérification du token obligatoire pour la suppression
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');

      const deleteResponse = await fetch(
        `${supabaseUrl}/rest/v1/trajets?id=eq.${id}&conducteur_id=eq.${decoded.userId}`, 
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!deleteResponse.ok) {
        throw new Error('Erreur lors de la suppression du trajet');
      }

      res.status(204).end();

    } catch (err) {
      console.error('Erreur suppression trajet:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }

  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
} 
