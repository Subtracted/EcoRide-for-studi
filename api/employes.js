const bcrypt = require('bcryptjs');
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

  // Vérification de l'authentification admin
  const authResult = await verifyAdminAuth(req);
  if (!authResult.success) {
    return res.status(authResult.status).json({ message: authResult.message });
  }

  if (req.method === 'POST') {
    return await createEmploye(req, res);
  }

  if (req.method === 'GET') {
    return await getEmployes(req, res);
  }

  if (req.method === 'PATCH') {
    return await updateEmploye(req, res);
  }

  if (req.method === 'DELETE') {
    return await deleteEmploye(req, res);
  }

  return res.status(405).json({ message: 'Méthode non autorisée' });
}

async function verifyAdminAuth(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, status: 401, message: 'Token manquant' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
    
    if (decoded.role !== 'admin') {
      return { success: false, status: 403, message: 'Accès interdit - Admin requis' };
    }

    return { success: true, userId: decoded.userId };
  } catch (err) {
    return { success: false, status: 401, message: 'Token invalide' };
  }
}

async function createEmploye(req, res) {
  try {
    const { nom, prenom, email, password, role } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'email existe déjà
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?email=eq.${email}`,
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
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hash du mot de passe
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Créer l'employé
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
          pseudo: `${prenom.toLowerCase()}.${nom.toLowerCase()}`,
          email: email,
          mot_de_passe: hashedPassword,
          nom: nom,
          prenom: prenom,
          role: 'employe',
          credits: 50,
          statut: 'actif',
          type_utilisateur: 'employe'
        })
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Erreur création employé:', errorText);
      return res.status(500).json({ message: 'Erreur lors de la création de l\'employé' });
    }

    const newEmploye = await createResponse.json();
    
    res.json({
      message: '✅ Employé créé avec succès',
      employe: {
        id: newEmploye[0].id,
        email: newEmploye[0].email,
        nom: newEmploye[0].nom,
        prenom: newEmploye[0].prenom,
        pseudo: newEmploye[0].pseudo,
        role: newEmploye[0].role,
        statut: newEmploye[0].statut
      }
    });
  } catch (err) {
    console.error('❌ Erreur création employé:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
}

async function getEmployes(req, res) {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?role=eq.employe`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des employés');
    }

    const employes = await response.json();
    
    res.json({
      employes: employes.map(emp => ({
        id: emp.id,
        email: emp.email,
        nom: emp.nom,
        prenom: emp.prenom,
        pseudo: emp.pseudo,
        role: emp.role,
        statut: emp.statut,
        credits: emp.credits,
        date_creation: emp.date_creation
      }))
    });
  } catch (err) {
    console.error('❌ Erreur récupération employés:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
}

async function updateEmploye(req, res) {
  try {
    const { id, statut } = req.body;

    if (!id || !statut) {
      return res.status(400).json({ message: 'ID et statut requis' });
    }

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ statut })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Erreur lors de la mise à jour de l\'employé');
    }

    const updatedEmploye = await updateResponse.json();
    
    res.json({
      message: '✅ Employé mis à jour avec succès',
      employe: updatedEmploye[0]
    });
  } catch (err) {
    console.error('❌ Erreur mise à jour employé:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
}

async function deleteEmploye(req, res) {
  // Optionnel : Fonction pour supprimer un employé
  res.status(501).json({ message: 'Fonction non implémentée' });
} 