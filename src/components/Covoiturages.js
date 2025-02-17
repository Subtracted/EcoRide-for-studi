import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Covoiturages.css';

const Covoiturages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [trajets, setTrajets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [filtres, setFiltres] = useState({
        estEcologique: false,
        prixMax: '',
        dureeMax: '',
        noteMin: ''
    });
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedTrajet, setSelectedTrajet] = useState(null);

    // Récupérer les paramètres de recherche
    const depart = searchParams.get('depart');
    const arrivee = searchParams.get('arrivee');
    const date = searchParams.get('date');

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

    useEffect(() => {
        const fetchTrajets = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/trajets/search?` + 
                    new URLSearchParams({
                        depart,
                        arrivee,
                        date
                    })
                );
                
                if (!response.ok) throw new Error('Erreur lors de la recherche');
                
                const data = await response.json();
                setTrajets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (depart && arrivee && date) {
            fetchTrajets();
        }
    }, [depart, arrivee, date]);

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
                        depart,
                        arrivee,
                        date
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
            <section className="filtres-section">
                <h2>Filtres</h2>
                <div className="filtres-form">
                    <label className="filtre-checkbox">
                        <input
                            type="checkbox"
                            name="estEcologique"
                            checked={filtres.estEcologique}
                            onChange={handleFiltreChange}
                        />
                        Voyages écologiques uniquement
                    </label>

                    <div className="filtre-group">
                        <label>Prix maximum (€)</label>
                        <input
                            type="number"
                            name="prixMax"
                            value={filtres.prixMax}
                            onChange={handleFiltreChange}
                            min="0"
                        />
                    </div>

                    <div className="filtre-group">
                        <label>Durée maximum (heures)</label>
                        <input
                            type="number"
                            name="dureeMax"
                            value={filtres.dureeMax}
                            onChange={handleFiltreChange}
                            min="0"
                        />
                    </div>

                    <div className="filtre-group">
                        <label>Note minimum du conducteur</label>
                        <input
                            type="number"
                            name="noteMin"
                            value={filtres.noteMin}
                            onChange={handleFiltreChange}
                            min="0"
                            max="5"
                            step="0.5"
                        />
                    </div>
                </div>
            </section>

            <section className="resultats-section">
                {loading ? (
                    <div className="loading">Recherche des trajets...</div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : trajetsFiltres.length === 0 ? (
                    <div className="no-results">
                        <p>Aucun trajet disponible pour votre recherche.</p>
                        {trajets.length > 0 && (
                            <p>Essayez de modifier vos filtres ou choisissez une autre date.</p>
                        )}
                    </div>
                ) : (
                    <div className="trajets-grid">
                        {trajetsFiltres.map(trajet => (
                            <div key={trajet.id} className="trajet-card">
                                <div className="conducteur-info">
                                    <img 
                                        src={trajet.photo_conducteur || '/images/default-avatar.png'} 
                                        alt={trajet.pseudo_conducteur}
                                        className="conducteur-photo"
                                    />
                                    <div>
                                        <h3>{trajet.pseudo_conducteur}</h3>
                                        <div className="note">
                                            ★ {trajet.note_conducteur ? trajet.note_conducteur.toFixed(1) : 'Nouveau'}
                                        </div>
                                    </div>
                                </div>

                                <div className="trajet-details">
                                    <p className="trajet-villes">
                                        {trajet.depart} → {trajet.arrivee}
                                    </p>
                                    <p className="trajet-horaires">
                                        {new Date(trajet.date_depart).toLocaleString()} →
                                        {new Date(trajet.date_arrivee).toLocaleString()}
                                    </p>
                                    <p className="places">
                                        Places disponibles : {trajet.places_restantes}
                                    </p>
                                    <p className="prix">{trajet.prix}€</p>
                                    {trajet.est_ecologique && (
                                        <span className="badge-eco">Écologique</span>
                                    )}
                                </div>

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
            </section>

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
