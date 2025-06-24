import React from 'react';
import './MentionsLegales.css'; // Réutilisation du même style

const PolitiqueCookies = () => {
  return (
    <div className="mentions-legales">
      <div className="container">
        <h1>Politique de Cookies</h1>
        
        <section className="legal-section">
          <h2>1. Qu'est-ce qu'un cookie ?</h2>
          <div className="legal-content">
            <p>Un cookie est un petit fichier texte stocké sur votre ordinateur, tablette ou téléphone mobile lorsque vous visitez un site web. Les cookies nous permettent de reconnaître votre appareil et de stocker certaines informations sur vos préférences ou actions passées.</p>
            <p>EcoRide utilise des cookies pour améliorer votre expérience utilisateur et assurer le bon fonctionnement de la plateforme.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>2. Types de cookies utilisés</h2>
          <div className="legal-content">
            <h3>2.1 Cookies strictement nécessaires</h3>
            <p>Ces cookies sont essentiels au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.</p>
            <ul>
              <li><strong>Cookies de session :</strong> Maintiennent votre connexion pendant la navigation</li>
              <li><strong>Cookies d'authentification :</strong> Stockent votre token de connexion de manière sécurisée</li>
              <li><strong>Cookies de sécurité :</strong> Protection contre les attaques CSRF</li>
              <li><strong>Cookies de préférences :</strong> Mémorisent vos choix de langue et d'interface</li>
            </ul>
            
            <h3>2.2 Cookies de performance</h3>
            <p>Ces cookies nous aident à comprendre comment vous utilisez notre plateforme.</p>
            <ul>
              <li><strong>Cookies analytiques :</strong> Mesure de fréquentation et d'usage</li>
              <li><strong>Cookies de performance :</strong> Optimisation de la vitesse de chargement</li>
              <li><strong>Cookies d'erreur :</strong> Détection et résolution des problèmes techniques</li>
            </ul>
            
            <h3>2.3 Cookies fonctionnels</h3>
            <p>Ces cookies améliorent l'expérience utilisateur mais ne sont pas essentiels.</p>
            <ul>
              <li><strong>Cookies de géolocalisation :</strong> Recherche de trajets à proximité</li>
              <li><strong>Cookies de personnalisation :</strong> Adaptation de l'interface</li>
              <li><strong>Cookies de recommandation :</strong> Suggestion de trajets pertinents</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>3. Cookies tiers</h2>
          <div className="legal-content">
            <p>EcoRide peut utiliser des services tiers qui déposent leurs propres cookies :</p>
            
            <h3>3.1 Services d'hébergement</h3>
            <ul>
              <li><strong>Vercel :</strong> Cookies de performance et de sécurité pour l'hébergement</li>
              <li><strong>Supabase :</strong> Cookies de session pour la base de données</li>
            </ul>
            
            <h3>3.2 Services analytiques (si activés)</h3>
            <ul>
              <li><strong>Google Analytics :</strong> Analyse de l'audience (anonymisé)</li>
              <li><strong>Outils de monitoring :</strong> Surveillance de la performance</li>
            </ul>
            
            <p><em>Note : Cette plateforme étant un projet pédagogique, l'utilisation de services tiers est limitée aux besoins techniques essentiels.</em></p>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Durée de conservation</h2>
          <div className="legal-content">
            <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '1rem'}}>
              <thead>
                <tr style={{backgroundColor: '#f5f5f5'}}>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Type de cookie</th>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Durée de conservation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>Cookies de session</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>Supprimés à la fermeture du navigateur</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>Token d'authentification</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>24 heures (ou déconnexion)</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>Préférences utilisateur</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>1 an</td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>Cookies analytiques</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>2 ans maximum</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Gestion de vos préférences</h2>
          <div className="legal-content">
            <h3>5.1 Paramètres du navigateur</h3>
            <p>Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur :</p>
            <ul>
              <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
              <li><strong>Firefox :</strong> Paramètres → Vie privée et sécurité → Cookies</li>
              <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
              <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site</li>
            </ul>
            
            <h3>5.2 Conséquences de la désactivation</h3>
            <p><strong>⚠️ Attention :</strong> La désactivation de certains cookies peut affecter le fonctionnement de la plateforme :</p>
            <ul>
              <li>Impossibilité de rester connecté</li>
              <li>Perte des préférences personnalisées</li>
              <li>Fonctionnalités limitées ou indisponibles</li>
              <li>Expérience utilisateur dégradée</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Cookies et données personnelles</h2>
          <div className="legal-content">
            <p>Certains cookies peuvent contenir des données personnelles :</p>
            <ul>
              <li><strong>Identifiants de session :</strong> Liés à votre compte utilisateur</li>
              <li><strong>Préférences :</strong> Choix personnalisés de navigation</li>
              <li><strong>Historique :</strong> Pages visitées et actions effectuées</li>
            </ul>
            <p>Ces données sont traitées conformément à notre <a href="/politique-confidentialite">Politique de Confidentialité</a> et au RGPD.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>7. Sécurité des cookies</h2>
          <div className="legal-content">
            <p>Nous mettons en place des mesures de sécurité pour protéger les cookies :</p>
            <ul>
              <li><strong>Cookies sécurisés :</strong> Transmission uniquement via HTTPS</li>
              <li><strong>HttpOnly :</strong> Protection contre les scripts malveillants</li>
              <li><strong>SameSite :</strong> Protection contre les attaques CSRF</li>
              <li><strong>Chiffrement :</strong> Données sensibles cryptées</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Cookies et services externes</h2>
          <div className="legal-content">
            <p>Les services externes utilisés par EcoRide peuvent déposer leurs propres cookies :</p>
            
            <h3>8.1 Vercel (Hébergement)</h3>
            <p>Cookies techniques pour l'hébergement et la performance :</p>
            <ul>
              <li>Optimisation du CDN</li>
              <li>Détection géographique</li>
              <li>Monitoring de performance</li>
            </ul>
            
            <h3>8.2 Supabase (Base de données)</h3>
            <p>Cookies liés à l'authentification et aux sessions :</p>
            <ul>
              <li>Tokens de session sécurisés</li>
              <li>Gestion des connexions</li>
            </ul>
            
            <p>Pour plus d'informations sur ces cookies tiers, consultez les politiques de confidentialité respectives de ces services.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>9. Vos droits concernant les cookies</h2>
          <div className="legal-content">
            <p>Conformément à la réglementation, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'information :</strong> Être informé de l'utilisation des cookies</li>
              <li><strong>Droit de refus :</strong> Refuser les cookies non essentiels</li>
              <li><strong>Droit de retrait :</strong> Retirer votre consentement à tout moment</li>
              <li><strong>Droit d'accès :</strong> Connaître les cookies stockés</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>10. Contact</h2>
          <div className="legal-content">
            <p>Pour toute question concernant notre utilisation des cookies :</p>
            <ul>
              <li><strong>Email :</strong> cookies@ecoride-platform.com</li>
              <li><strong>Ou via notre :</strong> <a href="/contact">page de contact</a></li>
            </ul>
            
            <p>Pour exercer vos droits concernant vos données personnelles, consultez notre <a href="/politique-confidentialite">Politique de Confidentialité</a>.</p>
          </div>
        </section>

        <div className="update-date">
          <p><em>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</em></p>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueCookies; 