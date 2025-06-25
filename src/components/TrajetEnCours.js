import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import AvisForm from './AvisForm';
import './TrajetEnCours.css';

const TrajetEnCours = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trajet, setTrajet] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAvisForm, setShowAvisForm] = useState(false);
    const [userReservation, setUserReservation] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getAuthToken();
                
                // Récupérer les informations du trajet
                const trajetResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!trajetResponse.ok) {
                    throw new Error('Trajet non trouvé');
                }

                const trajetData = await trajetResponse.json();
                setTrajet(trajetData);

                // Si l'utilisateur est le conducteur, récupérer les réservations
                if (user && trajetData.conducteur_id === user.id) {
                    const reservationsResponse = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/user?type=reservations`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (reservationsResponse.ok) {
                        const reservationsData = await reservationsResponse.json();
                        const trajetReservations = reservationsData.filter(
                            res => res.trajet_id === parseInt(id)
                        );
                        setReservations(trajetReservations);
                    }
                } else {
                    // Si l'utilisateur est passager, récupérer sa réservation
                    const userReservationsResponse = await fetch(
                        `${process.env.REACT_APP_API_URL}/api/user?type=reservations`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (userReservationsResponse.ok) {
                        const userReservationsData = await userReservationsResponse.json();
                        const currentReservation = userReservationsData.find(
                            res => res.trajet_id === parseInt(id)
                        );
                        setUserReservation(currentReservation);
                    }
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id && user) {
            fetchData();
        }
    }, [id, user]);

    useEffect(() => {
        if (!user) {
            navigate('/login', { 
                state: { 
                    from: `/trajet/${id}`,
                    message: 'Veuillez vous connecter pour accéder à cette page' 
                }
            });
        }
    }, [user, id, navigate]);

    const handleTrajetAction = async (action) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            setTrajet(prev => ({ ...prev, statut: action === 'demarrer' ? 'en_cours' : 'termine' }));
            
            if (action === 'terminer') {
                alert('Trajet terminé ! Les passagers vont recevoir une notification pour laisser un avis.');
            }

        } catch (err) {
            console.error('Erreur action trajet:', err);
            setError(err.message);
        }
    };

    const handleAvisSubmitted = () => {
        setShowAvisForm(false);
        alert('Avis envoyé avec succès ! Il sera visible après validation.');
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!trajet) return <div className="not-found">Trajet non trouvé</div>;

    const isConducteur = user && trajet.conducteur_id === user.id;
    const isPassager = userReservation !== null;
    const trajetTermine = trajet.statut === 'termine';
    const trajetEnCours = trajet.statut === 'en_cours';

    return (
        <div className="trajet-container">
            <div className="trajet-card">
                <h2>{trajet.depart} → {trajet.arrivee}</h2>
                
                <div className="trajet-info">
                    <div className="info-section">
                        <h3>Informations sur le trajet</h3>
                        <p><i className="fas fa-calendar"></i> {new Date(trajet.date_depart).toLocaleDateString()}</p>
                        <p><i className="fas fa-clock"></i> {new Date(trajet.date_depart).toLocaleTimeString()}</p>
                        <p><i className="fas fa-users"></i> {trajet.places_restantes} places disponibles</p>
                        <p><i className="fas fa-euro-sign"></i> {trajet.prix} crédits</p>
                        {trajet.statut && (
                            <p className={`statut ${trajet.statut}`}>
                                <i className="fas fa-info-circle"></i> 
                                Statut: {trajet.statut === 'en_cours' ? 'En cours' : 
                                        trajet.statut === 'termine' ? 'Terminé' : 'En attente'}
                            </p>
                        )}
                    </div>

                    <div className="info-section">
                        <h3>Conducteur</h3>
                        <p><i className="fas fa-user"></i> {trajet.conducteur_pseudo}</p>
                        {trajet.note && (
                            <p><i className="fas fa-star"></i> Note: {trajet.note}/5 ({trajet.nombre_avis} avis)</p>
                        )}
                    </div>

                    {isConducteur && reservations.length > 0 && (
                        <div className="info-section">
                            <h3>Passagers inscrits</h3>
                            {reservations.map((reservation) => (
                                <div key={reservation.id} className="passager-item">
                                    <p><i className="fas fa-user"></i> {reservation.passager_pseudo}</p>
                                    <p><i className="fas fa-users"></i> {reservation.nombre_places} place(s)</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {trajet.commentaire && (
                        <div className="info-section">
                            <h3>Commentaire</h3>
                            <p>{trajet.commentaire}</p>
                        </div>
                    )}
                </div>

                <div className="actions">
                    {/* Actions pour le conducteur */}
                    {isConducteur && !trajetTermine && (
                        <>
                            {!trajetEnCours && (
                                <button 
                                    onClick={() => handleTrajetAction('demarrer')} 
                                    className="action-button start-button"
                                >
                                    <i className="fas fa-play"></i> Démarrer le trajet
                                </button>
                            )}
                            
                            {trajetEnCours && (
                                <button 
                                    onClick={() => handleTrajetAction('terminer')} 
                                    className="action-button end-button"
                                >
                                    <i className="fas fa-flag-checkered"></i> Arrivée à destination
                                </button>
                            )}
                        </>
                    )}

                    {/* Actions pour le passager */}
                    {isPassager && trajetTermine && !showAvisForm && (
                        <button 
                            onClick={() => setShowAvisForm(true)} 
                            className="action-button avis-button"
                        >
                            <i className="fas fa-star"></i> Laisser un avis
                        </button>
                    )}

                    <button onClick={() => navigate(-1)} className="back-button">
                        <i className="fas fa-arrow-left"></i> Retour
                    </button>
                </div>

                {/* Formulaire d'avis */}
                {showAvisForm && isPassager && userReservation && (
                    <div className="avis-section">
                        <AvisForm
                            reservationId={userReservation.id}
                            onSubmit={handleAvisSubmitted}
                            onCancel={() => setShowAvisForm(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrajetEnCours; 
