import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setCookieConsent, getCookieConsent, hasConsentedToCookies } from '../utils/cookies';
import './CookieConsent.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    necessary: false,
    functional: false,
    analytics: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const existingConsent = getCookieConsent();
    if (!existingConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      timestamp: new Date().toISOString()
    };
    
    setCookieConsent(fullConsent);
    setShowBanner(false);
    
    console.log('Tous les cookies acceptés');
  };

  const handleAcceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      timestamp: new Date().toISOString()
    };
    
    setCookieConsent(necessaryOnly);
    setShowBanner(false);
    
    console.log('Cookies nécessaires uniquement acceptés');
  };

  const handleCustomConsent = () => {
    const customConsent = {
      ...consent,
      necessary: true, // Toujours obligatoire
      timestamp: new Date().toISOString()
    };
    
    setCookieConsent(customConsent);
    setShowBanner(false);
    setShowDetails(false);
    
    console.log('Consentement personnalisé enregistré:', customConsent);
  };

  const handleConsentChange = (type, value) => {
    setConsent(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-content">
          {!showDetails ? (
            // Vue simple
            <>
              <div className="cookie-header">
                <h3>🍪 Utilisation des cookies</h3>
                <p>
                  EcoRide utilise des cookies pour améliorer votre expérience et assurer le bon fonctionnement de la plateforme. 
                  En continuant à naviguer, vous acceptez notre utilisation des cookies.
                </p>
              </div>
              
              <div className="cookie-actions">
                <button 
                  className="cookie-btn cookie-btn-secondary"
                  onClick={() => setShowDetails(true)}
                >
                  Personnaliser
                </button>
                <button 
                  className="cookie-btn cookie-btn-minimal"
                  onClick={handleAcceptNecessary}
                >
                  Nécessaires uniquement
                </button>
                <button 
                  className="cookie-btn cookie-btn-primary"
                  onClick={handleAcceptAll}
                >
                  Tout accepter
                </button>
              </div>
              
              <div className="cookie-links">
                <Link to="/politique-cookies" className="cookie-link">
                  Politique de cookies
                </Link>
                <Link to="/politique-confidentialite" className="cookie-link">
                  Confidentialité
                </Link>
              </div>
            </>
          ) : (
            // Vue détaillée
            <>
              <div className="cookie-header">
                <h3>Personnaliser les cookies</h3>
                <p>Choisissez les types de cookies que vous souhaitez autoriser :</p>
              </div>
              
              <div className="cookie-options">
                <div className="cookie-option">
                  <div className="cookie-option-header">
                    <label className="cookie-switch">
                      <input 
                        type="checkbox" 
                        checked={true} 
                        disabled 
                      />
                      <span className="cookie-slider disabled"></span>
                    </label>
                    <div className="cookie-option-info">
                      <h4>Cookies nécessaires</h4>
                      <p>Essentiels au fonctionnement du site (connexion, sécurité)</p>
                    </div>
                  </div>
                </div>
                
                <div className="cookie-option">
                  <div className="cookie-option-header">
                    <label className="cookie-switch">
                      <input 
                        type="checkbox" 
                        checked={consent.functional}
                        onChange={(e) => handleConsentChange('functional', e.target.checked)}
                      />
                      <span className="cookie-slider"></span>
                    </label>
                    <div className="cookie-option-info">
                      <h4>Cookies fonctionnels</h4>
                      <p>Amélioration de l'expérience (préférences, géolocalisation)</p>
                    </div>
                  </div>
                </div>
                
                <div className="cookie-option">
                  <div className="cookie-option-header">
                    <label className="cookie-switch">
                      <input 
                        type="checkbox" 
                        checked={consent.analytics}
                        onChange={(e) => handleConsentChange('analytics', e.target.checked)}
                      />
                      <span className="cookie-slider"></span>
                    </label>
                    <div className="cookie-option-info">
                      <h4>Cookies analytiques</h4>
                      <p>Statistiques d'utilisation pour améliorer nos services</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cookie-actions">
                <button 
                  className="cookie-btn cookie-btn-secondary"
                  onClick={() => setShowDetails(false)}
                >
                  Retour
                </button>
                <button 
                  className="cookie-btn cookie-btn-primary"
                  onClick={handleCustomConsent}
                >
                  Enregistrer mes choix
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 