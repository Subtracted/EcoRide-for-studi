import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import './CreerTrajet.css';

const CreerTrajet = () => {
    const { user } = useAuth();
    const history = useHistory();
    const [formData, setFormData] = useState({
        depart: '',
        arrivee: '',
        date_depart: '',
        heure_depart: '',
        date_arrivee: '',
        heure_arrivee: '',
        prix: '',
        places_totales: '',
        modele_voiture: '',
        est_ecologique: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Combiner date et heure
            const date_depart = new Date(`${formData.date_depart}T${formData.heure_depart}`);
            const date_arrivee = new Date(`${formData.date_arrivee}T${formData.heure_arrivee}`);

            // Vérifications
            if (date_depart >= date_arrivee) {
                setError("La date d'arrivée doit être après la date de départ");
                return;
            }

            if (parseFloat(formData.prix) <= 0) {
                setError("Le prix doit être supérieur à 0");
                return;
            }

            // Ajouter 2 crédits pour la plateforme
            const prixTotal = parseFloat(formData.prix) + 2;

            const trajetData = {
                conducteur_id: user.id,
                depart: formData.depart,
                arrivee: formData.arrivee,
                date_depart: date_depart.toISOString(),
                date_arrivee: date_arrivee.toISOString(),
                prix: prixTotal,
                prix_base: parseFloat(formData.prix),
                frais_plateforme: 2,
                places_totales: parseInt(formData.places_totales),
                places_restantes: parseInt(formData.places_totales),
                modele_voiture: formData.modele_voiture,
                est_ecologique: formData.est_ecologique
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(trajetData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erreur lors de la création du trajet');
            }

            const data = await response.json();
            setSuccess('Trajet créé avec succès !');
            
            // Redirection après 2 secondes
            setTimeout(() => {
                history.push(`/covoiturage/${data.id}`);
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="creer-trajet-container">
            <h2>Proposer un trajet</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="trajet-form">
                <div className="form-group">
                    <label htmlFor="depart">Ville de départ</label>
                    <input
                        type="text"
                        id="depart"
                        name="depart"
                        value={formData.depart}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="arrivee">Ville d'arrivée</label>
                    <input
                        type="text"
                        id="arrivee"
                        name="arrivee"
                        value={formData.arrivee}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date_depart">Date de départ</label>
                        <input
                            type="date"
                            id="date_depart"
                            name="date_depart"
                            value={formData.date_depart}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="heure_depart">Heure de départ</label>
                        <input
                            type="time"
                            id="heure_depart"
                            name="heure_depart"
                            value={formData.heure_depart}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date_arrivee">Date d'arrivée</label>
                        <input
                            type="date"
                            id="date_arrivee"
                            name="date_arrivee"
                            value={formData.date_arrivee}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="heure_arrivee">Heure d'arrivée</label>
                        <input
                            type="time"
                            id="heure_arrivee"
                            name="heure_arrivee"
                            value={formData.heure_arrivee}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="prix">Prix par passager (€)</label>
                        <input
                            type="number"
                            id="prix"
                            name="prix"
                            min="0"
                            step="0.01"
                            value={formData.prix}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="places_totales">Nombre de places</label>
                        <input
                            type="number"
                            id="places_totales"
                            name="places_totales"
                            min="1"
                            max="8"
                            value={formData.places_totales}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="modele_voiture">Modèle du véhicule</label>
                    <input
                        type="text"
                        id="modele_voiture"
                        name="modele_voiture"
                        value={formData.modele_voiture}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="est_ecologique"
                            checked={formData.est_ecologique}
                            onChange={handleChange}
                        />
                        Véhicule écologique
                    </label>
                </div>

                <button type="submit" className="submit-button">
                    Créer le trajet
                </button>
            </form>
        </div>
    );
};

export default CreerTrajet; 
