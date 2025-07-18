import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import PreferencesConducteur from './PreferencesConducteur';
import ChangePassword from './ChangePassword';
import './UserSpace.css';

const UserSpace = () => {
    const [reservations, setReservations] = useState([]);
    const [mesTrajets, setMesTrajets] = useState([]);
    const [activeTab, setActiveTab] = useState('trajets');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                const [reservationsRes, trajetsRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_URL}/api/user?type=reservations`, {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    }),
                    fetch(`${process.env.REACT_APP_API_URL}/api/user?type=trajets`, {
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`
                        }
                    })
                ]);

                const [reservationsData, trajetsData] = await Promise.all([
                    reservationsRes.json(),
                    trajetsRes.json()
                ]);

                setReservations(reservationsData);
                setMesTrajets(trajetsData);
            } catch (err) {
                setError('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user, navigate]);

    return (
        <div className="user-space">
            <h2>Mon Espace</h2>

            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'trajets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trajets')}
                >
                    Mes trajets proposés
                </button>
                <button 
                    className={`tab ${activeTab === 'reservations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reservations')}
                >
                    Mes réservations
                </button>
                <button 
                    className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    Mes préférences conducteur
                </button>
                <button 
                    className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Paramètres
                </button>
            </div>

            {loading ? (
                <div className="loading">Chargement...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="tab-content">
                    {activeTab === 'trajets' && (
                        <div className="trajets-list">
                            <h3>Mes trajets proposés</h3>
                            {mesTrajets.length === 0 ? (
                                <p className="empty-message">
                                    Vous n'avez pas encore proposé de trajets.
                                    <button 
                                        onClick={() => navigate('/saisir-voyage')}
                                        className="action-button"
                                    >
                                        Proposer un trajet
                                    </button>
                                </p>
                            ) : (
                                <div className="trajets-grid">
                                    {mesTrajets.map(trajet => (
                                        <div key={trajet.id} className="trajet-card">
                                            <div className="trajet-header">
                                                <h4>{trajet.depart} → {trajet.arrivee}</h4>
                                                <span className={`status ${trajet.places_restantes === 0 ? 'complet' : ''}`}>
                                                    {trajet.places_restantes === 0 ? 'Complet' : `${trajet.places_restantes} places disponibles`}
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
                                                    <i className="fas fa-car"></i> 
                                                    {trajet.marque} {trajet.modele}
                                                    {trajet.est_ecologique && 
                                                        <span className="eco-badge" title="Véhicule écologique">🌱</span>
                                                    }
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
                                            <div className="trajet-actions">
                                                <button 
                                                    onClick={() => navigate(`/trajet-en-cours/${trajet.id}`)}
                                                    className="manage-button"
                                                >
                                                    Gérer le trajet
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/covoiturage/${trajet.id}`)}
                                                    className="details-button"
                                                >
                                                    Voir détails
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reservations' && (
                        <div className="reservations-list">
                            <h3>Mes réservations</h3>
                            {reservations.length === 0 ? (
                                <p className="empty-message">
                                    Vous n'avez pas encore de réservations.
                                    <button 
                                        onClick={() => navigate('/covoiturages')}
                                        className="action-button"
                                    >
                                        Rechercher un trajet
                                    </button>
                                </p>
                            ) : (
                                <div className="reservations-grid">
                                    {reservations.map(reservation => (
                                        <div key={reservation.id} className="reservation-card">
                                            <div className="reservation-header">
                                                <h4>{reservation.depart} → {reservation.arrivee}</h4>
                                                <span className={`status ${reservation.statut}`}>
                                                    {reservation.statut === 'confirmee' ? 'Confirmée' : reservation.statut}
                                                </span>
                                            </div>
                                            <div className="reservation-details">
                                                <p>
                                                    <i className="fas fa-calendar"></i> 
                                                    Date: {reservation.date_depart ? 
                                                        new Date(reservation.date_depart).toLocaleDateString('fr-FR') : 
                                                        'Date non disponible'
                                                    }
                                                </p>
                                                <p>
                                                    <i className="fas fa-clock"></i>
                                                    Heure: {reservation.date_depart ? 
                                                        new Date(reservation.date_depart).toLocaleTimeString('fr-FR', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        }) : 
                                                        'Heure non disponible'
                                                    }
                                                </p>
                                                <p>
                                                    <i className="fas fa-user"></i>
                                                    Conducteur: {reservation.conducteur_pseudo}
                                                </p>
                                                <p>
                                                    <i className="fas fa-euro-sign"></i>
                                                    Prix: {reservation.prix_total || reservation.prix} crédits
                                                </p>
                                                <p>
                                                    <i className="fas fa-calendar-check"></i>
                                                    Réservé le: {reservation.date_reservation ? 
                                                        new Date(reservation.date_reservation).toLocaleDateString('fr-FR') : 
                                                        'Date inconnue'
                                                    }
                                                </p>
                                            </div>
                                            <div className="reservation-actions">
                                                <button 
                                                    onClick={() => navigate(`/trajet-en-cours/${reservation.trajet_id}`)}
                                                    className="action-button"
                                                >
                                                    Voir le trajet
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/covoiturage/${reservation.trajet_id}`)}
                                                    className="details-button"
                                                >
                                                    Détails
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <PreferencesConducteur />
                    )}

                    {activeTab === 'settings' && (
                        <div className="settings-section">
                            <h3>Paramètres du compte</h3>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Mot de passe</h4>
                                        <p>Changez votre mot de passe pour sécuriser votre compte</p>
                                    </div>
                                    <button 
                                        className="setting-button"
                                        onClick={() => setShowChangePassword(true)}
                                    >
                                        Changer le mot de passe
                                    </button>
                                </div>
                                
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <h4>Informations personnelles</h4>
                                        <p>Pseudo: {user?.pseudo}</p>
                                        <p>Email: {user?.email}</p>
                                        <p>Crédits: {user?.credits}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {showChangePassword && (
                <ChangePassword 
                    onClose={() => setShowChangePassword(false)}
                    onSuccess={() => {
                        setShowChangePassword(false);
                        // Optionnel: rafraîchir les données utilisateur
                    }}
                />
            )}
        </div>
    );
};

export default UserSpace; 
