import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import AvisForm from './AvisForm';
import './CovoiturageDetail.css';

const CovoiturageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trajet, setTrajet] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAvisForm, setShowAvisForm] = useState(false);
    const [userReservation, setUserReservation] = useState(null);
    const [message, setMessage] = useState('');

    // Déterminer le mode d'affichage
    const isConducteur = user && trajet && user.id === trajet.conducteur_id;
    const isGestionMode = window.location.pathname.includes('/trajet-en-cours/');

    useEffect(() => {
        fetchTrajetDetails();
        fetchAvis();
    }, [id]);

    useEffect(() => {
        if (user && trajet) {
            fetchUserReservation();
        }
    }, [user, trajet]);

    const fetchTrajetDetails = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${id}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Trajet non trouvé');
            }

            const data = await response.json();
            setTrajet(data);

            // Si c'est le conducteur en mode gestion, récupérer les réservations
            if (user && data.conducteur_id === user.id && isGestionMode) {
                fetchReservations();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations?trajet_id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReservations(data);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des réservations:', err);
        }
    };

    const fetchUserReservation = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user?type=reservations`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (response.ok) {
                const reservations = await response.json();
                const reservation = reservations.find(r => r.trajet_id === parseInt(id));
                setUserReservation(reservation);

                console.log('Réservation trouvée:', reservation);
                console.log('Trajet actuel:', trajet);
                console.log('Statut trajet:', reservation?.statut);
                console.log('Is trajet terminé:', reservation?.statut === 'termine');

                // Vérifier si le trajet est terminé et si le passager peut laisser un avis
                if (reservation && reservation.statut === 'termine') {
                    // Vérifier s'il existe déjà un avis pour cette réservation
                    checkExistingAvis(reservation.id);
                }
            }
        } catch (err) {
            console.error('Erreur lors de la récupération de la réservation:', err);
        }
    };

    const fetchAvis = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user?type=avis&conducteurId=${id}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAvis(data);
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des avis:', err);
        }
    };

    const checkExistingAvis = async (reservationId) => {
        try {
            console.log('Vérification avis pour réservation:', reservationId);
            
            // Pour l'instant, on affiche toujours le formulaire si le trajet est terminé
            // L'utilisateur verra une erreur s'il essaie de soumettre un avis en double
            setShowAvisForm(true);
            console.log('Affichage du formulaire d\'avis');
        } catch (err) {
            console.error('Erreur lors de la vérification de l\'avis:', err);
            // En cas d'erreur, afficher quand même le formulaire
            setShowAvisForm(true);
        }
    };

    const isTrajetDemarre = (trajet) => {
        return trajet?.commentaire?.includes('[DEMARRE]');
    };

    const isTrajetTermine = (trajet) => {
        return trajet?.commentaire?.includes('[TERMINE]');
    };

    const handleActionTrajet = async (action) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ action })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'action');
            }

            const result = await response.json();
            setMessage(result.message);
            fetchTrajetDetails(); // Rafraîchir les données
            
            // Si le trajet est terminé, notifier les passagers
            if (action === 'terminer') {
                setMessage('Trajet terminé ! Les passagers peuvent maintenant laisser un avis.');
            }
        } catch (err) {
            setError('Erreur lors de l\'action: ' + err.message);
        }
    };

    const handleReservation = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ trajet_id: id })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('Réservation effectuée avec succès !');
                fetchTrajetDetails();
                fetchUserReservation();
            } else {
                setError(data.message || 'Erreur lors de la réservation');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        }
    };

    const handleAnnulerReservation = async () => {
        if (!userReservation) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ reservation_id: userReservation.id })
            });

            if (response.ok) {
                setMessage('Réservation annulée avec succès !');
                setUserReservation(null);
                fetchTrajetDetails();
            } else {
                setError('Erreur lors de l\'annulation');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        }
    };

    const handleAvisSubmit = async (avisData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    action: 'create_avis',
                    reservationId: userReservation.id,
                    ...avisData
                })
            });

            if (response.ok) {
                setMessage('Avis envoyé avec succès ! Il sera examiné par notre équipe.');
                setShowAvisForm(false);
                fetchUserReservation();
            } else {
                setError('Erreur lors de l\'envoi de l\'avis');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!trajet) return <div className="error">Trajet non trouvé</div>;

    return (
        <div className="covoiturage-detail">
            <div className="detail-header">
                <h2>{trajet.depart} → {trajet.arrivee}</h2>
                {isGestionMode && isConducteur && (
                    <div className="gestion-badge">Mode Gestion Conducteur</div>
                )}
            </div>

            {message && <div className="success-message">{message}</div>}

            <div className="detail-content">
                <div className="trajet-info-section">
                    <h3>Informations sur le trajet</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Date:</span>
                            <span className="value">
                                {new Date(trajet.date_depart).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Heure:</span>
                            <span className="value">
                                {new Date(trajet.date_depart).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="label">Prix:</span>
                            <span className="value">{trajet.prix} crédits</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Places disponibles:</span>
                            <span className="value">{trajet.places_restantes}</span>
                        </div>
                        {trajet.est_ecologique && (
                            <div className="info-item">
                                <span className="label">Voyage écologique:</span>
                                <span className="value eco">🌱 Oui</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="conducteur-section">
                    <h3>Conducteur</h3>
                    <div className="conducteur-card">
                        <div className="conducteur-info">
                            <h4>{trajet.conducteur_pseudo}</h4>
                            {trajet.conducteur_note > 0 && (
                                <div className="note">
                                    <span className="etoiles">
                                        {'★'.repeat(Math.floor(trajet.conducteur_note))}
                                        {'☆'.repeat(5 - Math.floor(trajet.conducteur_note))}
                                    </span>
                                    <span className="note-valeur">
                                        {trajet.conducteur_note}/5
                                        {trajet.conducteur_nombre_avis > 0 && (
                                            <span className="nb-avis"> ({trajet.conducteur_nombre_avis} avis)</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                        {trajet.conducteur_photo && (
                            <img src={trajet.conducteur_photo} alt={trajet.conducteur_pseudo} className="conducteur-photo" />
                        )}
                    </div>
                </div>

                {trajet.commentaire && 
                 !trajet.commentaire.includes('[DEMARRE]') && 
                 !trajet.commentaire.includes('[TERMINE]') && 
                 trajet.commentaire.trim() !== '...' && (
                    <div className="commentaire-section">
                        <h3>Commentaire</h3>
                        <p>{trajet.commentaire}</p>
                    </div>
                )}

                {/* Mode gestion pour le conducteur */}
                {isGestionMode && isConducteur && (
                    <div className="gestion-section">
                        <h3>Gestion du trajet</h3>
                        
                        <div className="statut-trajet">
                            {!isTrajetDemarre(trajet) && !isTrajetTermine(trajet) && (
                                <div className="statut-attente">
                                    <span>Statut: En attente</span>
                                    <button 
                                        onClick={() => handleActionTrajet('demarrer')}
                                        className="btn-demarrer"
                                    >
                                        Démarrer le trajet
                                    </button>
                                </div>
                            )}
                            
                            {isTrajetDemarre(trajet) && !isTrajetTermine(trajet) && (
                                <div className="statut-en-cours">
                                    <span>Statut: En cours</span>
                                    <button 
                                        onClick={() => handleActionTrajet('terminer')}
                                        className="btn-terminer"
                                    >
                                        Arrivée à destination
                                    </button>
                                </div>
                            )}
                            
                            {isTrajetTermine(trajet) && (
                                <div className="statut-termine">
                                    <span>Statut: Terminé</span>
                                    <span className="info-avis">Les passagers peuvent maintenant laisser des avis</span>
                                </div>
                            )}
                        </div>

                        {reservations.length > 0 && (
                            <div className="reservations-conducteur">
                                <h4>Passagers inscrits ({reservations.length})</h4>
                                <div className="passagers-list">
                                    {reservations.map(reservation => (
                                        <div key={reservation.id} className="passager-card">
                                            <span className="passager-nom">{reservation.passager_pseudo}</span>
                                            <span className={`reservation-statut ${reservation.statut}`}>
                                                {reservation.statut}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Affichage pour les passagers */}
                {!isGestionMode && (
                    <div className="actions-section">
                        {!user ? (
                            <button onClick={() => navigate('/login')} className="btn-login">
                                Se connecter pour réserver
                            </button>
                        ) : isConducteur ? (
                            <div className="conducteur-actions">
                                <button 
                                    onClick={() => navigate(`/trajet-en-cours/${id}`)}
                                    className="btn-gerer"
                                >
                                    Gérer ce trajet
                                </button>
                            </div>
                        ) : userReservation ? (
                            <div className="reservation-existante">
                                <span>Vous avez réservé ce trajet</span>
                                {userReservation.statut === 'termine' ? (
                                    <button 
                                        onClick={() => setShowAvisForm(true)}
                                        className="btn-avis"
                                    >
                                        Laisser un avis
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleAnnulerReservation}
                                        className="btn-annuler"
                                    >
                                        Annuler ma réservation
                                    </button>
                                )}
                            </div>
                        ) : trajet.places_restantes > 0 ? (
                            <button onClick={handleReservation} className="btn-reserver">
                                Réserver ce trajet
                            </button>
                        ) : (
                            <div className="complet">
                                Ce trajet est complet
                            </div>
                        )}
                    </div>
                )}

                {/* Formulaire d'avis pour les passagers après trajet terminé */}
                {showAvisForm && userReservation && (
                    <div className="avis-section">
                        <h3>Laisser un avis</h3>
                        <p>Le trajet est terminé. Vous pouvez maintenant laisser un avis sur votre conducteur :</p>
                        <AvisForm
                            trajetId={id}
                            conducteurId={trajet.conducteur_id}
                            reservationId={userReservation.id}
                            onSubmit={handleAvisSubmit}
                            onCancel={() => setShowAvisForm(false)}
                        />
                    </div>
                )}

                {/* Section des avis validés */}
                {avis.length > 0 && (
                    <div className="avis-section">
                        <h3>Avis des passagers ({avis.length})</h3>
                        <div className="avis-list">
                            {avis.map(avisItem => (
                                <div key={avisItem.id} className="avis-card">
                                    <div className="avis-header">
                                        <span className="auteur">{avisItem.auteur_pseudo}</span>
                                        <div className="note">
                                            <span className="etoiles">
                                                {'★'.repeat(avisItem.note)}
                                                {'☆'.repeat(5 - avisItem.note)}
                                            </span>
                                            <span className="note-valeur">{avisItem.note}/5</span>
                                        </div>
                                    </div>
                                    <p className="commentaire">{avisItem.commentaire}</p>
                                    <span className="date">{new Date(avisItem.date_creation).toLocaleDateString('fr-FR')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CovoiturageDetail; 
