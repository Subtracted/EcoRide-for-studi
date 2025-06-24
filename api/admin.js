const bcrypt = require('bcryptjs');

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

  if (req.method === 'POST') {
    return await createOrUpdateAdmin(req, res);
  }

  if (req.method === 'GET') {
    return await getAdminInfo(req, res);
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

async function createOrUpdateAdmin(req, res) {
  try {
    // Hash du mot de passe admin123
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    
    console.log('🔧 Création/mise à jour admin avec hash pour admin123');

    // Vérifier si l'admin existe déjà
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?email=eq.admin@ecoride.com`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const existingUsers = await checkResponse.json();
    
    if (existingUsers.length > 0) {
      // Mettre à jour l'utilisateur existant
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/utilisateurs?email=eq.admin@ecoride.com`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            mot_de_passe: hashedPassword,
            role: 'admin',
            statut: 'actif'
          })
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ Erreur mise à jour admin:', errorText);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'admin' });
      }

      const updatedUser = await updateResponse.json();
      return res.json({ 
        message: '✅ Utilisateur admin mis à jour avec succès - Mot de passe: admin123',
        action: 'updated',
        admin: {
          id: updatedUser[0].id,
          email: updatedUser[0].email,
          role: updatedUser[0].role,
          pseudo: updatedUser[0].pseudo
        }
      });
    } else {
      // Créer un nouvel utilisateur admin
      const createResponse = await fetch(
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
            pseudo: 'admin',
            email: 'admin@ecoride.com',
            mot_de_passe: hashedPassword,
            nom: 'Admin',
            prenom: 'EcoRide',
            role: 'admin',
            credits: 100,
            statut: 'actif',
            type_utilisateur: 'admin'
          })
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('❌ Erreur création admin:', errorText);
        return res.status(500).json({ message: 'Erreur lors de la création de l\'admin' });
      }

      const newUser = await createResponse.json();
      return res.json({ 
        message: '✅ Utilisateur admin créé avec succès - Mot de passe: admin123',
        action: 'created',
        admin: {
          id: newUser[0].id,
          email: newUser[0].email,
          role: newUser[0].role,
          pseudo: newUser[0].pseudo
        }
      });
    }
  } catch (err) {
    console.error('❌ Erreur création/mise à jour admin:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
}

async function getAdminInfo(req, res) {
  try {
    // Récupérer les infos de l'admin
    const response = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?email=eq.admin@ecoride.com`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const users = await response.json();
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur admin non trouvé' });
    }

    const admin = users[0];
    return res.json({
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        pseudo: admin.pseudo,
        statut: admin.statut,
        credits: admin.credits
      }
    });
  } catch (err) {
    console.error('❌ Erreur récupération admin:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
} 