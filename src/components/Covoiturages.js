import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import './Covoiturages.css';

const Covoiturages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [trajets, setTrajets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [filtres, setFiltres] = useState({
        estEcologique: false,
        prixMax: '',
        dureeMax: '',
        noteMin: ''
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedTrajet, setSelectedTrajet] = useState(null);

    const fetchTrajets = async (params = {}) => {
        try {
            setLoading(true);
            
            // Construire l'URL avec les paramètres de recherche
            const queryParams = new URLSearchParams();
            if (params.depart) queryParams.append('depart', params.depart);
            if (params.arrivee) queryParams.append('arrivee', params.arrivee);
            if (params.date) queryParams.append('date', params.date);
            if (params.prix_max) queryParams.append('prix_max', params.prix_max);
            if (params.est_ecologique) queryParams.append('est_ecologique', 'true');

            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/trajets?${queryParams}`,
                {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche des trajets');
            }

            const data = await response.json();
            console.log('Données reçues de l\'API:', data);
            // S'assurer que data est un tableau
            setTrajets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les trajets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrajets();
    }, []);

    // Auto-clear des messages
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, error]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        searchParams.forEach((value, key) => {
            if (value && value !== 'false') {
                params[key] = value;
            }
        });
        fetchTrajets(params);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newSearchParams = new URLSearchParams(searchParams);
        if (type === 'checkbox') {
            if (checked) {
                newSearchParams.set(name, 'true');
            } else {
                newSearchParams.delete(name);
            }
        } else {
            if (value) {
                newSearchParams.set(name, value);
            } else {
                newSearchParams.delete(name);
            }
        }
        setSearchParams(newSearchParams);
    };

    const handleFiltreChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFiltres(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filtrerTrajets = (trajets) => {
        // Vérifier que trajets est bien un tableau
        if (!Array.isArray(trajets)) {
            console.error('filtrerTrajets: trajets n\'est pas un tableau:', trajets);
            return [];
        }
        
        return trajets.filter(trajet => {
            if (filtres.estEcologique && !trajet.est_ecologique) return false;
            if (filtres.prixMax && trajet.prix > parseInt(filtres.prixMax)) return false;
            if (filtres.dureeMax) {
                const duree = (new Date(trajet.date_arrivee) - new Date(trajet.date_depart)) / 3600000; // en heures
                if (duree > parseInt(filtres.dureeMax)) return false;
            }
            if (filtres.noteMin && trajet.note_conducteur < parseInt(filtres.noteMin)) return false;
            return true;
        });
    };

    const trajetsFiltres = filtrerTrajets(trajets);

    const handleReservation = async (trajet) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedTrajet(trajet);
        setShowConfirmation(true);
    };

    const confirmReservation = async () => {
        if (!selectedTrajet) {
            setError('Aucun trajet sélectionné');
            setShowConfirmation(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ trajet_id: selectedTrajet.id })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Réservation effectuée avec succès !');
                // Rafraîchir les trajets
                const params = {};
                if (searchParams.get('depart')) params.depart = searchParams.get('depart');
                if (searchParams.get('arrivee')) params.arrivee = searchParams.get('arrivee');
                if (searchParams.get('date')) params.date = searchParams.get('date');
                if (searchParams.get('prix_max')) params.prix_max = searchParams.get('prix_max');
                if (searchParams.get('est_ecologique')) params.est_ecologique = searchParams.get('est_ecologique');
                
                const updatedResponse = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/trajets?` + new URLSearchParams(params)
                );
                const updatedData = await updatedResponse.json();
                setTrajets(Array.isArray(updatedData) ? updatedData : []);
            } else {
                setError(data.message || 'Erreur lors de la réservation');
            }
        } catch (err) {
            console.error('Erreur lors de la réservation:', err);
            setError('Erreur de connexion au serveur');
        } finally {
            setShowConfirmation(false);
            setSelectedTrajet(null);
        }
    };

    return (
        <div className="covoiturages-container">
            <h2>Rechercher un trajet</h2>

            {message && <div className="message success">{message}</div>}
            {error && <div className="message error">{error}</div>}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Départ</label>
                        <input
                            type="text"
                            name="depart"
                            value={searchParams.get('depart') || ''}
                            onChange={handleInputChange}
                            placeholder="Ville de départ"
                        />
                    </div>

                    <div className="form-group">
                        <label>Arrivée</label>
                        <input
                            type="text"
                            name="arrivee"
                            value={searchParams.get('arrivee') || ''}
                            onChange={handleInputChange}
                            placeholder="Ville d'arrivée"
                        />
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={searchParams.get('date') || ''}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label>Prix maximum</label>
                        <input
                            type="number"
                            name="prix_max"
                            value={searchParams.get('prix_max') || ''}
                            onChange={handleInputChange}
                            min="0"
                            placeholder="Prix max en crédits"
                        />
                    </div>

                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="est_ecologique"
                                checked={searchParams.get('est_ecologique') === 'true'}
                                onChange={handleInputChange}
                            />
                            Trajets écologiques uniquement
                        </label>
                    </div>
                </div>

                <button type="submit" className="search-button">
                    Rechercher
                </button>
            </form>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : !Array.isArray(trajetsFiltres) || trajetsFiltres.length === 0 ? (
                <div className="no-results">Aucun trajet trouvé</div>
            ) : (
                <div className="trajets-grid">
                    {trajetsFiltres.filter(trajet => trajet && trajet.id).map(trajet => (
                        <div key={trajet.id} className="trajet-card">
                            <div className="trajet-header">
                                <h4>{trajet.depart} → {trajet.arrivee}</h4>
                                <span className={`status ${trajet.places_restantes === 0 ? 'complet' : ''}`}>
                                    {trajet.places_restantes === 0 ? 'Complet' : `${trajet.places_restantes} places`}
                                </span>
                            </div>
                            <div className="trajet-details">
                                <p>
                                    <i className="fas fa-calendar"></i>
                                    {new Date(trajet.date_depart).toLocaleDateString('fr-FR')}
                                </p>
                                <p>
                                    <i className="fas fa-clock"></i>
                                    {new Date(trajet.date_depart).toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <div className="conducteur-info">
                                    <div className="conducteur-details">
                                        <p>
                                            <i className="fas fa-user"></i>
                                            {trajet.conducteur_pseudo}
                                        </p>
                                        {trajet.conducteur_note > 0 && (
                                            <p className="conducteur-note">
                                                <i className="fas fa-star"></i>
                                                {trajet.conducteur_note}/5
                                                {trajet.conducteur_nombre_avis > 0 && (
                                                    <span className="nb-avis">({trajet.conducteur_nombre_avis} avis)</span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                    {trajet.conducteur_photo && (
                                        <img 
                                            src={trajet.conducteur_photo} 
                                            alt={trajet.conducteur_pseudo}
                                            className="conducteur-avatar"
                                        />
                                    )}
                                </div>
                                <p>
                                    <i className="fas fa-euro-sign"></i>
                                    {trajet.prix} crédits
                                </p>
                                {trajet.est_ecologique && (
                                    <p className="ecologique">
                                        <i className="fas fa-leaf"></i>
                                        Voyage écologique
                                    </p>
                                )}
                            </div>
                            {trajet.commentaire && (
                                <div className="trajet-commentaire">
                                    <i className="fas fa-comment"></i> {trajet.commentaire}
                                </div>
                            )}
                            <div className="trajet-actions">
                                <button 
                                    onClick={() => navigate(`/covoiturage/${trajet.id}`)}
                                    className="details-button"
                                >
                                    Voir les détails
                                </button>
                                {user && trajet.places_restantes > 0 && trajet.conducteur_id !== user.id && (
                                    <button 
                                        onClick={() => handleReservation(trajet)}
                                        className="reserve-button"
                                    >
                                        Réserver
                                    </button>
                                )}
                                {!user && trajet.places_restantes > 0 && (
                                    <button 
                                        onClick={() => navigate('/login')}
                                        className="login-button"
                                    >
                                        Se connecter pour réserver
                                    </button>
                                )}
                                {trajet.places_restantes === 0 && (
                                    <button className="complet-button" disabled>
                                        Complet
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showConfirmation && (
                <div className="confirmation-modal">
                    <div className="confirmation-content">
                        <h3>Confirmer la réservation</h3>
                        <p>Trajet : {selectedTrajet.depart} → {selectedTrajet.arrivee}</p>
                        <p>Date : {new Date(selectedTrajet.date_depart).toLocaleString()}</p>
                        <p>Prix : {selectedTrajet.prix} crédits</p>
                        <p>Voulez-vous vraiment réserver ce trajet ?</p>
                        <div className="confirmation-buttons">
                            <button onClick={confirmReservation} className="confirm-button">
                                Confirmer
                            </button>
                            <button 
                                onClick={() => setShowConfirmation(false)} 
                                className="cancel-button"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Covoiturages;
