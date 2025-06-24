import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="global-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>EcoRide</h4>
          <p>Plateforme de covoiturage écologique</p>
          <p>Projet pédagogique - 2024</p>
        </div>
        
        <div className="footer-section">
          <h4>Navigation</h4>
          <div className="footer-nav">
            <Link to="/">Accueil</Link>
            <Link to="/covoiturages">Trajets</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Informations légales</h4>
          <div className="footer-legal">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/conditions-generales">CGU</Link>
            <Link to="/politique-confidentialite">Confidentialité</Link>
            <Link to="/politique-cookies">Cookies</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:contact@ecoride-platform.com">contact@ecoride-platform.com</a></p>
          <p>Support: <a href="mailto:support@ecoride-platform.com">support@ecoride-platform.com</a></p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 EcoRide - Tous droits réservés - Projet pédagogique</p>
          <div className="footer-tech">
            <small>Développé avec React • Hébergé sur Vercel • Base de données Supabase</small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 