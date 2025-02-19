import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TrajetEnCours.css';

const TrajetEnCours = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [trajet, setTrajet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrajet = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Trajet non trouvé');
                }

                const data = await response.json();
                setTrajet(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTrajet();
        }
    }, [id]);

    useEffect(() => {
        if (!user) {
            navigate('/login', { 
                state: { 
                    from: `/trajet/${id}`,
                    message: 'Veuillez vous connecter pour réserver un trajet' 
                }
            });
        }
    }, [user, id, navigate]);

    const handleReservation = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token récupéré:', token);

            if (!token) {
                throw new Error('Vous devez être connecté pour réserver');
            }

            if (!user) {
                throw new Error('Utilisateur non authentifié');
            }

            console.log('User:', user);
            console.log('Envoi requête avec token:', token);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ trajetId: id })
            });

            console.log('Réponse status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const data = await response.json();
            navigate('/mon-espace', { 
                state: { message: 'Réservation effectuée avec succès !' } 
            });
        } catch (err) {
            console.error('Erreur détaillée:', err);
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!trajet) return <div className="not-found">Trajet non trouvé</div>;

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
                    </div>

                    <div className="info-section">
                        <h3>Conducteur</h3>
                        <p><i className="fas fa-user"></i> {trajet.conducteur_pseudo}</p>
                    </div>

                    {trajet.commentaire && (
                        <div className="info-section">
                            <h3>Commentaire</h3>
                            <p>{trajet.commentaire}</p>
                        </div>
                    )}
                </div>

                <div className="actions">
                    {user && trajet.places_restantes > 0 && user.id !== trajet.conducteur_id && (
                        <button onClick={handleReservation} className="reserve-button">
                            Réserver ce trajet
                        </button>
                    )}
                    <button onClick={() => navigate(-1)} className="back-button">
                        Retour
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrajetEnCours; 