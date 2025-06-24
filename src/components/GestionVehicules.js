import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/cookies';
import './GestionVehicules.css';

/**
 * Gestion des véhicules
 * Interface permettant aux utilisateurs de gérer leurs véhicules
 * et aux employés de valider le caractère écologique
 */
const GestionVehicules = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        immatriculation: '',
        date_immatriculation: '',
        modele: '',
        couleur: '',
        marque: '',
        places: ''
    });
    const [message, setMessage] = useState('');
    const [vehicules, setVehicules] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setMessage('Véhicule ajouté avec succès');
                navigate('/saisir-voyage');
            } else {
                const data = await response.json();
                setMessage(data.message || 'Erreur lors de l\'ajout du véhicule');
            }
        } catch (err) {
            setMessage('Erreur serveur');
        }
    };

    /**
     * Charge la liste des véhicules de l'utilisateur
     */
    const loadVehicules = async () => {
        // ... code existant
    };

    /**
     * Valide le caractère écologique d'un véhicule (employés uniquement)
     */
    const validerVehicule = async (id) => {
        // ... code existant
    };

    return (
        <div className="gestion-vehicules">
            <h2>Ajouter un véhicule</h2>
            {message && <div className="message">{message}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Immatriculation</label>
                    <input
                        type="text"
                        value={formData.immatriculation}
                        onChange={(e) => setFormData({...formData, immatriculation: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Marque</label>
                    <input
                        type="text"
                        value={formData.marque}
                        onChange={(e) => setFormData({...formData, marque: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Modèle</label>
                    <input
                        type="text"
                        value={formData.modele}
                        onChange={(e) => setFormData({...formData, modele: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Couleur</label>
                    <input
                        type="text"
                        value={formData.couleur}
                        onChange={(e) => setFormData({...formData, couleur: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Nombre de places</label>
                    <input
                        type="number"
                        min="1"
                        max="9"
                        value={formData.places}
                        onChange={(e) => setFormData({...formData, places: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Date d'immatriculation</label>
                    <input
                        type="date"
                        value={formData.date_immatriculation}
                        onChange={(e) => setFormData({...formData, date_immatriculation: e.target.value})}
                        required
                    />
                </div>

                <button type="submit" className="submit-button">
                    Ajouter le véhicule
                </button>
            </form>
        </div>
    );
};

export default GestionVehicules; 
