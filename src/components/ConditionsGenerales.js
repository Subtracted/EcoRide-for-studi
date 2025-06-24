import React from 'react';
import './MentionsLegales.css'; // Réutilisation du même style

const ConditionsGenerales = () => {
  return (
    <div className="mentions-legales">
      <div className="container">
        <h1>Conditions Générales d'Utilisation</h1>
        
        <section className="legal-section">
          <h2>1. Objet et champ d'application</h2>
          <div className="legal-content">
            <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme EcoRide, service de mise en relation pour le covoiturage écologique.</p>
            <p>L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU par l'utilisateur.</p>
            <p><strong>Projet pédagogique :</strong> EcoRide est développé dans un cadre éducatif et ne constitue pas un service commercial.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>2. Définitions</h2>
          <div className="legal-content">
            <ul>
              <li><strong>Plateforme :</strong> Le site web EcoRide accessible via l'URL fournie</li>
              <li><strong>Utilisateur :</strong> Toute personne physique utilisant la plateforme</li>
              <li><strong>Conducteur :</strong> Utilisateur proposant un trajet en covoiturage</li>
              <li><strong>Passager :</strong> Utilisateur recherchant une place dans un véhicule</li>
              <li><strong>Trajet :</strong> Voyage proposé par un conducteur</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>3. Inscription et compte utilisateur</h2>
          <div className="legal-content">
            <h3>3.1 Création de compte</h3>
            <p>L'inscription est gratuite et nécessite de fournir des informations exactes et à jour.</p>
            <p>Chaque utilisateur ne peut créer qu'un seul compte.</p>
            
            <h3>3.2 Responsabilité du compte</h3>
            <p>L'utilisateur est responsable de la confidentialité de ses identifiants et de toutes les activités effectuées sous son compte.</p>
            <p>Il s'engage à informer immédiatement EcoRide de toute utilisation non autorisée de son compte.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>4. Utilisation de la plateforme</h2>
          <div className="legal-content">
            <h3>4.1 Pour les conducteurs</h3>
            <ul>
              <li>Être titulaire d'un permis de conduire valide</li>
              <li>Posséder une assurance automobile en cours de validité</li>
              <li>Fournir des informations exactes sur le véhicule et le trajet</li>
              <li>Respecter les horaires annoncés</li>
            </ul>
            
            <h3>4.2 Pour les passagers</h3>
            <ul>
              <li>Respecter les règles de convivialité</li>
              <li>Être ponctuel aux rendez-vous</li>
              <li>Respecter le véhicule et les autres passagers</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>5. Système de crédits</h2>
          <div className="legal-content">
            <p>EcoRide utilise un système de crédits virtuels pour faciliter les échanges :</p>
            <ul>
              <li>Chaque nouvel utilisateur reçoit 20 crédits de bienvenue</li>
              <li>Les crédits servent à réserver des places de covoiturage</li>
              <li>Les conducteurs reçoivent des crédits pour chaque trajet effectué</li>
              <li>Les crédits n'ont aucune valeur monétaire réelle</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>6. Responsabilités et obligations</h2>
          <div className="legal-content">
            <h3>6.1 Responsabilité d'EcoRide</h3>
            <p>EcoRide agit uniquement comme intermédiaire de mise en relation. La plateforme ne saurait être tenue responsable :</p>
            <ul>
              <li>Des incidents survenant pendant les trajets</li>
              <li>Des annulations de dernière minute</li>
              <li>Des désaccords entre utilisateurs</li>
              <li>Des problèmes techniques ponctuels</li>
            </ul>
            
            <h3>6.2 Responsabilité des utilisateurs</h3>
            <p>Les utilisateurs sont entièrement responsables de leurs actes et de leurs interactions avec les autres membres de la communauté.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>7. Comportement et sanctions</h2>
          <div className="legal-content">
            <h3>7.1 Comportements interdits</h3>
            <ul>
              <li>Utilisation frauduleuse de la plateforme</li>
              <li>Création de faux comptes</li>
              <li>Harcèlement ou comportement inapproprié</li>
              <li>Non-respect des règles de covoiturage</li>
            </ul>
            
            <h3>7.2 Sanctions</h3>
            <p>En cas de non-respect des présentes CGU, EcoRide se réserve le droit de :</p>
            <ul>
              <li>Suspendre temporairement le compte</li>
              <li>Supprimer définitivement le compte</li>
              <li>Signaler aux autorités compétentes si nécessaire</li>
            </ul>
          </div>
        </section>

        <section className="legal-section">
          <h2>8. Protection des données</h2>
          <div className="legal-content">
            <p>EcoRide s'engage à protéger les données personnelles conformément au RGPD.</p>
            <p>Pour plus d'informations, consultez notre <a href="/politique-confidentialite">Politique de Confidentialité</a>.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>9. Modifications des CGU</h2>
          <div className="legal-content">
            <p>EcoRide se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications par email ou via la plateforme.</p>
            <p>La poursuite de l'utilisation après modification vaut acceptation des nouvelles conditions.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>10. Droit applicable et juridiction</h2>
          <div className="legal-content">
            <p>Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de France.</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>11. Contact</h2>
          <div className="legal-content">
            <p>Pour toute question relative aux présentes CGU :</p>
            <ul>
              <li>Email : support@ecoride-platform.com</li>
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

export default ConditionsGenerales; 