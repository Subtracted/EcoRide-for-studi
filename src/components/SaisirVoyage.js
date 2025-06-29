import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import './SaisirVoyage.css';

const SaisirVoyage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [vehicules, setVehicules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        depart: '',
        arrivee: '',
        date_depart: '',
        heure_depart: '',
        date_arrivee: '',
        heure_arrivee: '',
        prix: '',
        places_totales: '',
        vehicule_id: '',
        est_ecologique: false,
        commentaire: ''
    });
    const [message, setMessage] = useState('');
    const [prix, setPrix] = useState(10);
    const COMMISSION_PLATEFORME = 2;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        console.log('Utilisateur connecté:', user);

        const fetchVehicules = async () => {
            try {
                console.log('Récupération des véhicules...');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicules`, {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Erreur response:', errorText);
                    throw new Error('Erreur chargement véhicules');
                }
                
                const data = await response.json();
                console.log('Véhicules reçus:', data);
                setVehicules(data);
            } catch (err) {
                console.error('Erreur fetch véhicules:', err);
                setError('Impossible de charger vos véhicules');
            } finally {
                setLoading(false);
            }
        };

        fetchVehicules();
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            // Créer un nouvel objet avec toutes les données, y compris le prix
            const trajetData = {
                ...formData,
                prix: prix, // Ajout du prix depuis l'état
                date_depart: `${formData.date_depart}T${formData.heure_depart}:00`,
                date_arrivee: `${formData.date_arrivee}T${formData.heure_arrivee}:00`
            };

            console.log('Données envoyées:', trajetData);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(trajetData)
            });

            const data = await response.json();
            console.log('Réponse du serveur:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la création du trajet');
            }

            setMessage('Trajet créé avec succès !');
            // Réinitialiser le formulaire
            setFormData({
                depart: '',
                arrivee: '',
                date_depart: '',
                heure_depart: '',
                date_arrivee: '',
                heure_arrivee: '',
                places_totales: '',
                vehicule_id: '',
                est_ecologique: false,
                commentaire: ''
            });
            setPrix(10); // Réinitialiser le prix
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.message);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="saisir-voyage-container">
            <h2>Proposer un trajet</h2>
            
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="voyage-form">
                <div className="form-group">
                    <label>Ville de départ</label>
                    <input
                        type="text"
                        name="depart"
                        value={formData.depart}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Paris"
                    />
                </div>

                <div className="form-group">
                    <label>Ville d'arrivée</label>
                    <input
                        type="text"
                        name="arrivee"
                        value={formData.arrivee}
                        onChange={handleChange}
                        required
                        placeholder="Ex: Lyon"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Date de départ</label>
                        <input
                            type="date"
                            name="date_depart"
                            value={formData.date_depart}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label>Heure de départ</label>
                        <input
                            type="time"
                            name="heure_depart"
                            value={formData.heure_depart}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Date d'arrivée</label>
                        <input
                            type="date"
                            name="date_arrivee"
                            value={formData.date_arrivee}
                            onChange={handleChange}
                            required
                            min={formData.date_depart}
                        />
                    </div>

                    <div className="form-group">
                        <label>Heure d'arrivée</label>
                        <input
                            type="time"
                            name="heure_arrivee"
                            value={formData.heure_arrivee}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Prix du trajet</label>
                        <div className="prix-container">
                            <div className="prix-input">
                                <input
                                    type="number"
                                    min="5"
                                    max="50"
                                    value={prix}
                                    onChange={(e) => setPrix(Number(e.target.value))}
                                />
                                <span className="currency">crédits</span>
                            </div>
                            <div className="prix-details">
                                <div className="detail-item">
                                    <span>Prix pour les passagers :</span>
                                    <span className="montant">{prix + COMMISSION_PLATEFORME} crédits</span>
                                </div>
                                <div className="detail-item">
                                    <span>Commission plateforme :</span>
                                    <span className="montant">{COMMISSION_PLATEFORME} crédits</span>
                                </div>
                                <div className="detail-item total">
                                    <span>Vous recevrez :</span>
                                    <span className="montant">{prix} crédits</span>
                                </div>
                            </div>
                            <p className="prix-info">
                                Une commission de {COMMISSION_PLATEFORME} crédits est appliquée par la plateforme pour garantir 
                                le bon fonctionnement du service. Cette commission est ajoutée au prix que vous définissez 
                                et sera payée par le passager.
                            </p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nombre de places</label>
                        <input
                            type="number"
                            name="places_totales"
                            value={formData.places_totales}
                            onChange={handleChange}
                            required
                            min="1"
                            max="8"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Véhicule</label>
                    {loading ? (
                        <p>Chargement des véhicules...</p>
                    ) : vehicules.length === 0 ? (
                        <div>
                            <p>Aucun véhicule trouvé. Vous devez d'abord ajouter un véhicule.</p>
                            <button 
                                type="button" 
                                onClick={() => navigate('/mon-espace')}
                                className="add-vehicle-button"
                            >
                                Ajouter un véhicule
                            </button>
                        </div>
                    ) : (
                        <select
                            name="vehicule_id"
                            value={formData.vehicule_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Sélectionnez un véhicule</option>
                            {vehicules.map(vehicule => (
                                <option key={vehicule.id} value={vehicule.id}>
                                    {vehicule.marque} {vehicule.modele} ({vehicule.annee})
                                </option>
                            ))}
                        </select>
                    )}
                    {/* Debug info */}
                    <div style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                        Debug: {vehicules.length} véhicule(s) trouvé(s)
                    </div>
                </div>

                <div className="form-group checkbox">
                    <label>
                        <input
                            type="checkbox"
                            name="est_ecologique"
                            checked={formData.est_ecologique}
                            onChange={handleChange}
                        />
                        Trajet écologique (véhicule électrique ou hybride)
                    </label>
                </div>

                <div className="form-group">
                    <label>Commentaire (optionnel)</label>
                    <textarea
                        name="commentaire"
                        value={formData.commentaire}
                        onChange={handleChange}
                        placeholder="Informations complémentaires pour les passagers..."
                        rows="4"
                    />
                </div>

                <button type="submit" className="submit-button">
                    Créer le trajet
                </button>
            </form>
        </div>
    );
};

export default SaisirVoyage; 
