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

  const { action } = req.query;

  if (!action) {
    return res.status(400).json({ message: 'Action requise' });
  }

  if (req.method === 'POST') {
    try {
      // Vérification du token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');

      if (action === 'acheter') {
        const { montant } = req.body;
        
        if (!montant || montant <= 0) {
          return res.status(400).json({ message: 'Montant invalide' });
        }

        // D'abord récupérer les crédits actuels
        const currentUserResponse = await fetch(
          `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${decoded.userId}`, 
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!currentUserResponse.ok) {
          throw new Error('Erreur lors de la récupération des données utilisateur');
        }

        const currentUsers = await currentUserResponse.json();
        
        if (currentUsers.length === 0) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const currentCredits = currentUsers[0].credits || 0;
        const nouveauxCredits = currentCredits + montant;

        // Mise à jour des crédits utilisateur
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${decoded.userId}`, 
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              credits: nouveauxCredits
            })
          }
        );

        if (!updateResponse.ok) {
          const errorData = await updateResponse.text();
          console.error('Erreur mise à jour crédits:', errorData);
          throw new Error('Erreur lors de la mise à jour des crédits');
        }

        const updatedUser = await updateResponse.json();
        
        if (updatedUser.length === 0) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        return res.json({ 
          message: 'Crédits ajoutés avec succès',
          nouveaux_credits: updatedUser[0].credits 
        });

      } else {
        return res.status(400).json({ message: 'Action non reconnue' });
      }

    } catch (err) {
      console.error('Erreur API crédits:', err);
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      res.status(500).json({ message: 'Erreur serveur' });
    }

  } else {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }
} 