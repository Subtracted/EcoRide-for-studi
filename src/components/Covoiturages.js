import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
                `${process.env.REACT_APP_API_URL}/api/trajets/search?${queryParams}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche des trajets');
            }

            const data = await response.json();
            setTrajets(data);
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

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTrajets(searchParams);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFiltreChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFiltres(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const filtrerTrajets = (trajets) => {
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
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ trajet_id: selectedTrajet.id })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Réservation effectuée avec succès !');
                // Rafraîchir les trajets
                const updatedResponse = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/trajets/search?` + 
                    new URLSearchParams({
                        depart: searchParams.get('depart'),
                        arrivee: searchParams.get('arrivee'),
                        date: searchParams.get('date'),
                        prix_max: searchParams.get('prix_max'),
                        est_ecologique: searchParams.get('est_ecologique')
                    })
                );
                const updatedData = await updatedResponse.json();
                setTrajets(updatedData);
            } else {
                setMessage(data.message || 'Erreur lors de la réservation');
            }
        } catch (err) {
            setMessage('Erreur de connexion au serveur');
        } finally {
            setShowConfirmation(false);
            setSelectedTrajet(null);
        }
    };

    return (
        <div className="covoiturages-container">
            <h2>Rechercher un trajet</h2>

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
            ) : trajetsFiltres.length === 0 ? (
                <div className="no-results">Aucun trajet trouvé</div>
            ) : (
                <div className="trajets-grid">
                    {trajetsFiltres.map(trajet => (
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
                                <p>
                                    <i className="fas fa-user"></i>
                                    {trajet.conducteur_pseudo}
                                </p>
                                <p>
                                    <i className="fas fa-euro-sign"></i>
                                    {trajet.prix} crédits
                                </p>
                            </div>
                            {trajet.commentaire && (
                                <div className="trajet-commentaire">
                                    <i className="fas fa-comment"></i> {trajet.commentaire}
                                </div>
                            )}
                            <button 
                                onClick={() => navigate(`/covoiturage/${trajet.id}`)}
                                className="details-button"
                            >
                                Voir les détails
                            </button>
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
                        <p>Prix : {selectedTrajet.prix}€</p>
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
