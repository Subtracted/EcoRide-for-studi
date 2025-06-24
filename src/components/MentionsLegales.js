import React from 'react';
import './MentionsLegales.css';

const MentionsLegales = () => {
  return (
    <div className="mentions-legales">
      <div className="container">
        <h1>Mentions Légales</h1>
        
        <section className="legal-section">
          <h2>1. Informations générales</h2>
          <div className="legal-content">
            <h3>Éditeur du site</h3>
            <p><strong>EcoRide</strong></p>
            <p>Plateforme de covoiturage écologique</p>
            <p>Projet étudiant - École d'informatique</p>
            <p>Email : contact@ecoride-platform.com</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>2. Hébergement</h2>
          <div className="legal-content">
            <p><strong>Vercel Inc.</strong></p>
            <p>340 S Lemon Ave #4133</p>
            <p>Walnut, CA 91789, États-Unis</p>
            <p>Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
          </div>
        </section>

        <section className="legal-section">
          <h2>3. Base de données</h2>
          <div className="legal-content">
            <p><strong>Supabase Inc.</strong></p>
            <p>Platform for building applications</p>
            <p>Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a></p>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Propriété intellectuelle</h2>
          <div className="legal-content">
            <p>L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.</p>
            <p>Ce projet a été développé dans un cadre pédagogique et utilise diverses technologies open source.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Limitation de responsabilité</h2>
          <div className="legal-content">
            <p>EcoRide ne peut être tenue responsable des dommages directs et indirects causés au matériel de l'utilisateur, lors de l'accès au site, et résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications indiquées, soit de l'apparition d'un bug ou d'une incompatibilité.</p>
            <p>Ce projet étant développé dans un cadre pédagogique, il est fourni "tel quel" sans garantie d'aucune sorte.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Gestion des données personnelles</h2>
          <div className="legal-content">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
            <p>Pour exercer ces droits, vous pouvez nous contacter à l'adresse : privacy@ecoride-platform.com</p>
            <p>Pour plus d'informations, consultez notre <a href="/politique-confidentialite">Politique de Confidentialité</a>.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>7. Cookies</h2>
          <div className="legal-content">
            <p>Ce site utilise des cookies pour améliorer l'expérience utilisateur et assurer le bon fonctionnement de la plateforme.</p>
            <p>Pour plus d'informations sur notre utilisation des cookies, consultez notre <a href="/politique-cookies">Politique de Cookies</a>.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Droit applicable</h2>
          <div className="legal-content">
            <p>Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>9. Contact</h2>
          <div className="legal-content">
            <p>Pour toute question concernant ces mentions légales, vous pouvez nous contacter :</p>
            <ul>
              <li>Email : legal@ecoride-platform.com</li>
              <li>Via notre <a href="/contact">page de contact</a></li>
            </ul>
          </div>
        </section>

        <div className="update-date">
          <p><em>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</em></p>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales; 