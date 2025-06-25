const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction de validation du mot de passe côté serveur
const validatePasswordServer = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }
  
  // Vérification des motifs interdits
  const forbiddenPatterns = [/123456/, /password/i, /qwerty/i, /azerty/i];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(password)) {
      errors.push('Le mot de passe ne doit pas contenir de séquences communes');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

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

  if (req.method === 'PUT') {
    return await handleAvisAction(req, res);
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

    // Validation du mot de passe
    const passwordValidation = validatePasswordServer(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Le mot de passe ne respecte pas les critères de sécurité',
        errors: passwordValidation.errors
      });
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

async function handleAvisAction(req, res) {
  try {
    const { avisId, action } = req.body;

    if (!avisId || !action) {
      return res.status(400).json({ message: 'ID de l\'avis et action requis' });
    }

    if (!['valider', 'refuser'].includes(action)) {
      return res.status(400).json({ message: 'Action non valide (valider ou refuser)' });
    }

    const newStatut = action === 'valider' ? 'valide' : 'refuse';

    // Mise à jour du statut de l'avis
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/avis?id=eq.${avisId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          statut: newStatut
        })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Erreur lors de la mise à jour de l\'avis');
    }

    const updatedAvis = await updateResponse.json();

    // Si l'avis est validé, mettre à jour la note moyenne du conducteur
    if (action === 'valider' && updatedAvis.length > 0) {
      await updateConducteurRating(updatedAvis[0]);
    }

    res.json({
      message: `Avis ${action === 'valider' ? 'validé' : 'refusé'} avec succès`,
      avis: updatedAvis[0]
    });
  } catch (err) {
    console.error('❌ Erreur action avis:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
}

async function updateConducteurRating(avis) {
  try {
    // Récupérer la réservation pour trouver le conducteur
    const reservationResponse = await fetch(
      `${supabaseUrl}/rest/v1/reservations?id=eq.${avis.reservation_id}&select=*,trajets(conducteur_id)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reservations = await reservationResponse.json();
    if (reservations.length === 0) return;

    const conducteurId = reservations[0].trajets.conducteur_id;

    // Récupérer tous les avis validés pour ce conducteur
    const avisResponse = await fetch(
      `${supabaseUrl}/rest/v1/avis?statut=eq.valide&select=note,reservations!inner(trajets!inner(conducteur_id))&reservations.trajets.conducteur_id=eq.${conducteurId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const avisValidated = await avisResponse.json();
    
    if (avisValidated.length > 0) {
      // Calculer la note moyenne
      const totalNotes = avisValidated.reduce((sum, avis) => sum + avis.note, 0);
      const noteMoyenne = (totalNotes / avisValidated.length).toFixed(1);

      // Mettre à jour le conducteur
      await fetch(
        `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${conducteurId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            note: parseFloat(noteMoyenne),
            nombre_avis: avisValidated.length
          })
        }
      );
    }
  } catch (err) {
    console.error('❌ Erreur mise à jour note conducteur:', err);
  }
}

async function getEmployes(req, res) {
  try {
    // Vérifier si c'est une requête pour les avis
    const { type } = req.query;
    
    if (type === 'avis') {
      // Récupération des avis en attente de validation
      const avisResponse = await fetch(
        `${supabaseUrl}/rest/v1/avis?statut=eq.en_attente&select=*,reservations(trajet_id,passager_id,trajets(conducteur_id))`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!avisResponse.ok) {
        throw new Error('Erreur lors de la récupération des avis');
      }

      const avis = await avisResponse.json();
      
      // Enrichir les données avec les informations des utilisateurs
      const avisWithUserInfo = await Promise.all(
        avis.map(async (avisItem) => {
          // Récupérer les infos du passager
          const passagerResponse = await fetch(
            `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${avisItem.reservations.passager_id}`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Récupérer les infos du conducteur
          const conducteurResponse = await fetch(
            `${supabaseUrl}/rest/v1/utilisateurs?id=eq.${avisItem.reservations.trajets.conducteur_id}`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const passager = await passagerResponse.json();
          const conducteur = await conducteurResponse.json();

          return {
            ...avisItem,
            auteur_pseudo: passager[0]?.pseudo || 'Utilisateur inconnu',
            conducteur_pseudo: conducteur[0]?.pseudo || 'Conducteur inconnu'
          };
        })
      );

      return res.json(avisWithUserInfo);
    }

    // Récupération normale des employés
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
    
    console.log('🔍 Employés trouvés:', employes);
    
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
