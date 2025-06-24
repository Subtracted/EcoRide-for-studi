/**
 Utilitaires pour la gestion sécurisée des cookies
 */

// Configuration par défaut des cookies
const COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production', // Secure uniquement en production (HTTPS)
  sameSite: 'strict', // Protection CSRF
  path: '/'
};

/**
 * Définit un cookie avec les options de sécurité
 * @param {string} name - Nom du cookie
 * @param {string} value - Valeur du cookie
 * @param {Object} options - Options supplémentaires
 */
export const setCookie = (name, value, options = {}) => {
  try {
    const config = { ...COOKIE_CONFIG, ...options };
    
    let cookieString = `${name}=${encodeURIComponent(value)}`;
    
    // Ajouter la durée d'expiration
    if (config.expires) {
      cookieString += `; expires=${config.expires.toUTCString()}`;
    } else if (config.maxAge) {
      cookieString += `; max-age=${config.maxAge}`;
    }
    
    // Ajouter le path
    if (config.path) {
      cookieString += `; path=${config.path}`;
    }
    
    // Ajouter le domaine
    if (config.domain) {
      cookieString += `; domain=${config.domain}`;
    }
    
    // Ajouter les flags de sécurité
    if (config.secure) {
      cookieString += '; secure';
    }
    
    if (config.httpOnly) {
      cookieString += '; httponly';
    }
    
    if (config.sameSite) {
      cookieString += `; samesite=${config.sameSite}`;
    }
    
    document.cookie = cookieString;
    
    console.log(`Cookie "${name}" défini avec succès`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la définition du cookie "${name}":`, error);
    return false;
  }
};

/**
 * Récupère la valeur d'un cookie
 * @param {string} name - Nom du cookie
 * @returns {string|null} - Valeur du cookie ou null si inexistant
 */
export const getCookie = (name) => {
  try {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        const value = cookie.substring(nameEQ.length);
        return decodeURIComponent(value);
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Erreur lors de la lecture du cookie "${name}":`, error);
    return null;
  }
};

/**
 * Supprime un cookie
 * @param {string} name - Nom du cookie à supprimer
 * @param {Object} options - Options (path, domain)
 */
export const deleteCookie = (name, options = {}) => {
  try {
    const config = { ...COOKIE_CONFIG, ...options };
    
    // Définir le cookie avec une date d'expiration passée
    setCookie(name, '', {
      ...config,
      expires: new Date(0)
    });
    
    console.log(`Cookie "${name}" supprimé avec succès`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du cookie "${name}":`, error);
    return false;
  }
};

/**
 * Vérifie si un cookie existe
 * @param {string} name - Nom du cookie
 * @returns {boolean} - true si le cookie existe
 */
export const hasCookie = (name) => {
  return getCookie(name) !== null;
};

/**
 * Définit le token d'authentification dans un cookie sécurisé
 * @param {string} token - Token JWT
 * @param {boolean} remember - Se souvenir de moi (plus longue durée)
 */
export const setAuthToken = (token, remember = false) => {
  const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 jours ou 24h
  
  return setCookie('auth_token', token, {
    maxAge, // en secondes
    secure: true, // HTTPS uniquement en production
    sameSite: 'strict', // Protection CSRF
    httpOnly: false // Accessible via JS (nécessaire pour React)
  });
};

/**
 * Récupère le token d'authentification
 * @returns {string|null} - Token JWT ou null
 */
export const getAuthToken = () => {
  return getCookie('auth_token');
};

/**
 * Supprime le token d'authentification
 */
export const clearAuthToken = () => {
  return deleteCookie('auth_token');
};

/**
 * Gestion des préférences utilisateur
 */
export const setUserPreference = (key, value) => {
  return setCookie(`pref_${key}`, JSON.stringify(value), {
    maxAge: 365 * 24 * 60 * 60 // 1 an
  });
};

export const getUserPreference = (key, defaultValue = null) => {
  const value = getCookie(`pref_${key}`);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Erreur parsing préférence "${key}":`, error);
      return defaultValue;
    }
  }
  return defaultValue;
};

/**
 * Gestion du consentement aux cookies
 */
export const setCookieConsent = (consent) => {
  return setCookie('cookie_consent', JSON.stringify(consent), {
    maxAge: 365 * 24 * 60 * 60 // 1 an
  });
};

export const getCookieConsent = () => {
  const consent = getCookie('cookie_consent');
  if (consent) {
    try {
      return JSON.parse(consent);
    } catch (error) {
      console.error('Erreur parsing consentement cookies:', error);
      return null;
    }
  }
  return null;
};

/**
 * Vérifie si le consentement a été donné
 */
export const hasConsentedToCookies = () => {
  const consent = getCookieConsent();
  return consent && consent.necessary === true;
};

/**
 * Nettoie tous les cookies de l'application
 */
export const clearAllAppCookies = () => {
  const cookiesToClear = ['auth_token', 'cookie_consent'];
  
  // Récupérer tous les cookies de préférences
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('pref_')) {
      cookiesToClear.push(name);
    }
  });
  
  cookiesToClear.forEach(name => deleteCookie(name));
  
  console.log('Tous les cookies de l\'application ont été supprimés');
}; 