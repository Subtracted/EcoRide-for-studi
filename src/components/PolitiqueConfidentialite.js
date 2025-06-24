import React from 'react';
import './MentionsLegales.css'; // Réutilisation du même style

const PolitiqueConfidentialite = () => {
  return (
    <div className="mentions-legales">
      <div className="container">
        <h1>Politique de Confidentialité</h1>
        
        <section className="legal-section">
          <h2>1. Introduction</h2>
          <div className="legal-content">
            <p>EcoRide s'engage à protéger et respecter votre vie privée. Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.</p>
            <p>Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi française sur la protection des données.</p>
            <p><strong>Responsable du traitement :</strong> EcoRide - Projet pédagogique</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>2. Données collectées</h2>
          <div className="legal-content">
            <h3>2.1 Données d'inscription</h3>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Pseudonyme</li>
              <li>Mot de passe (crypté)</li>
            </ul>
            
            <h3>2.2 Données de profil</h3>
            <ul>
              <li>Photo de profil (optionnelle)</li>
              <li>Préférences de voyage</li>
              <li>Évaluations et avis</li>
              <li>Historique des trajets</li>
            </ul>
            
            <h3>2.3 Données véhicules</h3>
            <ul>
              <li>Marque et modèle</li>
              <li>Année et couleur</li>
              <li>Nombre de places</li>
              <li>Caractéristiques écologiques</li>
            </ul>
            
            <h3>2.4 Données techniques</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Cookies et technologies similaires</li>
              <li>Logs de connexion</li>
              <li>Données de navigation</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>3. Finalités du traitement</h2>
          <div className="legal-content">
            <p>Nous utilisons vos données pour :</p>
            <ul>
              <li><strong>Fourniture du service :</strong> Faciliter la mise en relation pour le covoiturage</li>
              <li><strong>Gestion des comptes :</strong> Création, authentification et gestion des profils</li>
              <li><strong>Communication :</strong> Envoi d'informations sur les trajets et la plateforme</li>
              <li><strong>Amélioration :</strong> Analyse et optimisation de nos services</li>
              <li><strong>Sécurité :</strong> Prévention des fraudes et protection des utilisateurs</li>
              <li><strong>Conformité légale :</strong> Respect des obligations réglementaires</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Base légale du traitement</h2>
          <div className="legal-content">
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li><strong>Exécution du contrat :</strong> Pour la fourniture des services de covoiturage</li>
              <li><strong>Consentement :</strong> Pour les communications marketing et cookies non essentiels</li>
              <li><strong>Intérêt légitime :</strong> Pour l'amélioration des services et la sécurité</li>
              <li><strong>Obligation légale :</strong> Pour la conservation de certaines données</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Partage des données</h2>
          <div className="legal-content">
            <h3>5.1 Avec les autres utilisateurs</h3>
            <p>Dans le cadre du covoiturage, certaines informations sont partagées :</p>
            <ul>
              <li>Nom, prénom et pseudonyme</li>
              <li>Photo de profil</li>
              <li>Note et avis</li>
              <li>Numéro de téléphone (pour la coordination du trajet)</li>
            </ul>
            
            <h3>5.2 Avec des tiers</h3>
            <p>Nous ne vendons jamais vos données. Nous pouvons les partager avec :</p>
            <ul>
              <li><strong>Prestataires techniques :</strong> Vercel (hébergement), Supabase (base de données)</li>
              <li><strong>Autorités :</strong> Si requis par la loi</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Conservation des données</h2>
          <div className="legal-content">
            <p>Nous conservons vos données :</p>
            <ul>
              <li><strong>Compte actif :</strong> Pendant toute la durée d'utilisation de la plateforme</li>
              <li><strong>Après suppression :</strong> 30 jours pour permettre une récupération</li>
              <li><strong>Données de sécurité :</strong> 1 an pour prévenir les fraudes</li>
              <li><strong>Obligations légales :</strong> Selon les exigences réglementaires</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>7. Sécurité des données</h2>
          <div className="legal-content">
            <p>Nous mettons en œuvre des mesures de sécurité appropriées :</p>
            <ul>
              <li>Chiffrement des mots de passe (bcrypt)</li>
              <li>Connexions sécurisées (HTTPS)</li>
              <li>Accès restreint aux données</li>
              <li>Surveillance et logging des accès</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Vos droits</h2>
          <div className="legal-content">
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            
            <h3>8.1 Droit d'accès</h3>
            <p>Vous pouvez demander une copie de toutes les données que nous détenons sur vous.</p>
            
            <h3>8.2 Droit de rectification</h3>
            <p>Vous pouvez corriger les données inexactes ou incomplètes.</p>
            
            <h3>8.3 Droit d'effacement</h3>
            <p>Vous pouvez demander la suppression de vos données dans certaines conditions.</p>
            
            <h3>8.4 Droit de portabilité</h3>
            <p>Vous pouvez récupérer vos données dans un format structuré et lisible.</p>
            
            <h3>8.5 Droit d'opposition</h3>
            <p>Vous pouvez vous opposer au traitement de vos données pour des raisons légitimes.</p>
            
            <h3>8.6 Droit de limitation</h3>
            <p>Vous pouvez demander la limitation du traitement de vos données.</p>
            
            <p><strong>Pour exercer ces droits :</strong> Contactez-nous à privacy@ecoride-platform.com</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>9. Cookies et technologies similaires</h2>
          <div className="legal-content">
            <p>EcoRide utilise des cookies pour :</p>
            <ul>
              <li><strong>Cookies essentiels :</strong> Fonctionnement de la plateforme (session, authentification)</li>
              <li><strong>Cookies de performance :</strong> Amélioration de l'expérience utilisateur</li>
              <li><strong>Cookies analytiques :</strong> Mesure d'audience et optimisation</li>
            </ul>
            <p>Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.</p>
            <p>Pour plus d'informations, consultez notre <a href="/politique-cookies">Politique de Cookies</a>.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>10. Transferts internationaux</h2>
          <div className="legal-content">
            <p>Certains de nos prestataires peuvent être situés en dehors de l'Union Européenne :</p>
            <ul>
              <li><strong>Vercel :</strong> États-Unis (protections adequates en place)</li>
              <li><strong>Supabase :</strong> Selon la région de déploiement choisie</li>
            </ul>
            <p>Nous nous assurons que ces transferts respectent les exigences du RGPD.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>11. Mineurs</h2>
          <div className="legal-content">
            <p>EcoRide est destiné aux personnes âgées de 18 ans et plus. Nous ne collectons pas sciemment de données personnelles d'enfants de moins de 16 ans sans le consentement parental.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>12. Modifications de la politique</h2>
          <div className="legal-content">
            <p>Nous pouvons modifier cette politique de confidentialité. Les utilisateurs seront informés des changements significatifs par email ou via la plateforme.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>13. Contact et réclamations</h2>
          <div className="legal-content">
            <p>Pour toute question sur cette politique ou pour exercer vos droits :</p>
            <ul>
              <li><strong>Email :</strong> privacy@ecoride-platform.com</li>
              <li><strong>Via notre :</strong> <a href="/contact">page de contact</a></li>
            </ul>
            
            <h3>Autorité de contrôle</h3>
            <p>Vous avez le droit de déposer une réclamation auprès de la CNIL :</p>
            <p><strong>CNIL</strong><br/>
            3 Place de Fontenoy - TSA 80715<br/>
            75334 PARIS CEDEX 07<br/>
            Tél : 01 53 73 22 22<br/>
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
          </div>
        </section>

        <div className="update-date">
          <p><em>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</em></p>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite; 