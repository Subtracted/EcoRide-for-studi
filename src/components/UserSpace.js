import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PreferencesConducteur from './PreferencesConducteur';
import './UserSpace.css';

const UserSpace = () => {
    const [reservations, setReservations] = useState([]);
    const [trajets, setTrajets] = useState([]);
    const [activeTab, setActiveTab] = useState('trajets');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
                    fetch(`${process.env.REACT_APP_API_URL}/api/reservations/user`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }),
                    fetch(`${process.env.REACT_APP_API_URL}/api/trajets/conducteur`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
                ]);

                const [reservationsData, trajetsData] = await Promise.all([
                    reservationsRes.json(),
                    trajetsRes.json()
                ]);

                setReservations(reservationsData);
                setTrajets(trajetsData);
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
                            {trajets.length === 0 ? (
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
                                    {trajets.map(trajet => (
                                        <div key={trajet.id} className="trajet-card">
                                            <h4>{trajet.depart} → {trajet.arrivee}</h4>
                                            <p>Date : {new Date(trajet.date_depart).toLocaleString()}</p>
                                            <p>Places : {trajet.places_restantes}/{trajet.places_totales}</p>
                                            <p>Prix : {trajet.prix}€</p>
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
                                            <h4>{reservation.depart} → {reservation.arrivee}</h4>
                                            <p>Date : {new Date(reservation.date_depart).toLocaleString()}</p>
                                            <p>Conducteur : {reservation.conducteur_pseudo}</p>
                                            <p>Prix : {reservation.prix}€</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <PreferencesConducteur />
                    )}
                </div>
            )}
        </div>
    );
};

export default UserSpace; 