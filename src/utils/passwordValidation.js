// Contraintes de validation des mots de passe
export const PASSWORD_CONSTRAINTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [/123456/, /password/i, /qwerty/i, /azerty/i]
};

/**
 * Valide un mot de passe selon les contraintes définies
 * @param {string} password - Le mot de passe à valider
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
export const validatePassword = (password) => {
  const errors = [];

  // Vérification de la longueur minimale
  if (!password || password.length < PASSWORD_CONSTRAINTS.minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_CONSTRAINTS.minLength} caractères`);
  }

  // Vérification de la présence de majuscules
  if (PASSWORD_CONSTRAINTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  // Vérification de la présence de minuscules
  if (PASSWORD_CONSTRAINTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }

  // Vérification de la présence de chiffres
  if (PASSWORD_CONSTRAINTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  // Vérification de la présence de caractères spéciaux
  if (PASSWORD_CONSTRAINTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Vérification des motifs interdits
  for (const pattern of PASSWORD_CONSTRAINTS.forbiddenPatterns) {
    if (pattern.test(password)) {
      errors.push('Le mot de passe ne doit pas contenir de séquences communes (123456, password, qwerty, etc.)');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Confirme que deux mots de passe sont identiques
 * @param {string} password - Le mot de passe principal
 * @param {string} confirmPassword - La confirmation du mot de passe
 * @returns {Object} - {isValid: boolean, error: string|null}
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Les mots de passe ne correspondent pas'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Évalue la force d'un mot de passe
 * @param {string} password - Le mot de passe à évaluer
 * @returns {Object} - {strength: string, score: number, suggestions: string[]}
 */
export const evaluatePasswordStrength = (password) => {
  let score = 0;
  const suggestions = [];

  if (!password) {
    return { strength: 'Très faible', score: 0, suggestions: ['Veuillez saisir un mot de passe'] };
  }

  // Longueur
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Complexité des caractères
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;

  // Bonus pour la diversité
  if (password.length > 0) {
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.6) score += 1;
  }

  // Suggestions d'amélioration
  if (password.length < 8) suggestions.push('Utilisez au moins 8 caractères');
  if (!/[a-z]/.test(password)) suggestions.push('Ajoutez des lettres minuscules');
  if (!/[A-Z]/.test(password)) suggestions.push('Ajoutez des lettres majuscules');
  if (!/\d/.test(password)) suggestions.push('Ajoutez des chiffres');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) suggestions.push('Ajoutez des caractères spéciaux');

  // Détermination de la force
  let strength;
  if (score <= 2) strength = 'Très faible';
  else if (score <= 4) strength = 'Faible';
  else if (score <= 6) strength = 'Moyen';
  else if (score <= 7) strength = 'Fort';
  else strength = 'Très fort';

  return { strength, score, suggestions };
}; 