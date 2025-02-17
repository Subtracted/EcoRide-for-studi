import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';

/* 
* Composant page d'accueil
* Permet de :
* - Rechercher un trajet
* - Voir les avantages d'EcoRide
* - Accéder aux différentes fonctionnalités
*/
const HomePage = () => {
    // État pour le formulaire de recherche
    const [recherche, setRecherche] = useState({
        depart: '',
        arrivee: '',
        date: ''
    });
    const navigate = useNavigate();

    // Mise à jour du formulaire
    const handleChange = (e) => {
        setRecherche({
            ...recherche,
            [e.target.name]: e.target.value
        });
    };

    // Soumission de la recherche
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Construction des paramètres de recherche
        const params = new URLSearchParams();
        if (recherche.depart) params.append('depart', recherche.depart);
        if (recherche.arrivee) params.append('arrivee', recherche.arrivee);
        if (recherche.date) params.append('date', recherche.date);

        // Redirection vers la page des covoiturages avec les paramètres
        navigate(`/covoiturages?${params.toString()}`);
    };

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Voyagez autrement avec EcoRide</h1>
                    <p>
                        Rejoignez notre communauté de covoiturage écologique 
                        et économique. Partagez vos trajets, réduisez votre 
                        empreinte carbone et faites des économies !
                    </p>
                    
                    <div className="search-section">
                        <form onSubmit={handleSubmit} className="search-form">
                            <input
                                type="text"
                                name="depart"
                                value={recherche.depart}
                                onChange={handleChange}
                                placeholder="Ville de départ"
                                required
                            />
                            <input
                                type="text"
                                name="arrivee"
                                value={recherche.arrivee}
                                onChange={handleChange}
                                placeholder="Ville d'arrivée"
                                required
                            />
                            <input
                                type="date"
                                name="date"
                                value={recherche.date}
                                onChange={handleChange}
                                required
                            />
                            <button type="submit" className="search-button">
                                Rechercher
                            </button>
                        </form>
                    </div>
                    
                    {/* Section présentation de l'entreprise */}
                    <div className="company-presentation">
                        <h2>Notre Mission</h2>
                        <p>
                            EcoRide est une startup française engagée dans la réduction 
                            de l'impact environnemental des déplacements. Notre plateforme 
                            met en relation des conducteurs et des passagers soucieux de 
                            l'environnement, créant ainsi une communauté responsable et 
                            solidaire.
                        </p>
                        {/* Images temporairement commentées - à intégrer plus tard
                        <div className="presentation-images">
                            <img src="/images/eco-transport.jpg" alt="Transport écologique" />
                            <img src="/images/community.jpg" alt="Communauté EcoRide" />
                        </div>
                        */}
                    </div>
                </div>
            </section>

            {/* Section des avantages écologiques */}
            <section className="eco-section">
                <h2>Notre Objectif</h2>
                <div className="eco-grid">
                    <div className="eco-card">
                        {/* Icône à ajouter */}
                        <h3>Réduisez votre empreinte carbone</h3>
                        <p>Partagez vos trajets et contribuez à la réduction des émissions de CO2</p>
                    </div>
                    <div className="eco-card">
                        {/* Icône à ajouter */}
                        <h3>Rejoignez une communauté engagée</h3>
                        <p>Rencontrez des personnes partageant les mêmes valeurs écologiques</p>
                    </div>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-contact">
                        <p>Email: <a href="mailto:contact@ecoride.fr">contact@ecoride.fr</a></p>
                    </div>
                    <div className="footer-links">
                        <Link to="/mentions-legales">Mentions légales</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage; 