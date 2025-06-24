const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://gjsaovtcamcahdfks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdqc2FvdnRjYW1jYWhkZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTgzMDYsImV4cCI6MjA0OTU5NDMwNn0.rSO2vLnQs6VJQPEe2kJLDSjjFFsrApJ5kZl4FGYLd1I';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    // Vérification du token JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token d\'authentification requis' });
    }

    const token = authHeader.substring(7);
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'e66d2fa269a4be0d77b83d474ca7e');
    } catch (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Vérification des champs requis
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        details: {
          currentPassword: !currentPassword ? 'Mot de passe actuel requis' : null,
          newPassword: !newPassword ? 'Nouveau mot de passe requis' : null,
          confirmPassword: !confirmPassword ? 'Confirmation du mot de passe requise' : null
        }
      });
    }

    // Vérification que les nouveaux mots de passe correspondent
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Les nouveaux mots de passe ne correspondent pas' 
      });
    }

    // Validation du nouveau mot de passe
    const passwordValidation = validatePasswordServer(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe ne respecte pas les critères de sécurité',
        errors: passwordValidation.errors
      });
    }

    // Récupération de l'utilisateur
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
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    // Vérification du mot de passe actuel
    const validCurrentPassword = await bcrypt.compare(currentPassword, user.mot_de_passe);
    
    if (!validCurrentPassword) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }

    // Vérification que le nouveau mot de passe est différent de l'ancien
    const samePassword = await bcrypt.compare(newPassword, user.mot_de_passe);
    if (samePassword) {
      return res.status(400).json({ 
        message: 'Le nouveau mot de passe doit être différent de l\'ancien' 
      });
    }

    // Hashage du nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Mise à jour du mot de passe
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
          mot_de_passe: hashedNewPassword,
          date_modification: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      console.error('Erreur Supabase mise à jour mot de passe:', errorData);
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }

    const updatedUser = await updateResponse.json();
    console.log('Mot de passe mis à jour pour l\'utilisateur:', updatedUser[0].id);

    res.status(200).json({
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (err) {
    console.error('Erreur changement mot de passe:', err);
    res.status(500).json({ 
      message: 'Erreur lors du changement de mot de passe',
      details: err.message
    });
  }
} 