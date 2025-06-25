import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './CovoiturageDetail.css';

const CovoiturageDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [trajet, setTrajet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nombrePlaces, setNombrePlaces] = useState(1);
    const [reservationSuccess, setReservationSuccess] = useState(false);
    const [avis, setAvis] = useState([]);

    console.log('ID du trajet:', id);
    console.log('Utilisateur connecté:', user);
    console.log('État du trajet:', trajet);
    console.log('Condition d\'affichage:', {
        places_restantes: trajet?.places_restantes,
        user_exists: !!user,
        user_id: user?.id,
        conducteur_id: trajet?.conducteur_id,
        should_show_button: trajet?.places_restantes > 0 && user && user.id !== trajet?.conducteur_id
    });

    useEffect(() => {
        const fetchTrajet = async () => {
            try {
                console.log('Fetching trajet with ID:', id);
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${id}`);
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error('Trajet non trouvé');
                }
                
                const data = await response.json();
                console.log('Données du trajet reçues:', data);
                setTrajet(data);
                
                // Récupérer les avis du conducteur
                if (data.conducteur_id) {
                    fetchAvis(data.conducteur_id);
                }
            } catch (err) {
                console.error('Erreur lors du fetch:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchAvis = async (conducteurId) => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user?type=avis&conducteurId=${conducteurId}`);
                if (response.ok) {
                    const avisData = await response.json();
                    setAvis(avisData);
                }
            } catch (err) {
                console.error('Erreur lors du fetch des avis:', err);
            }
        };

        fetchTrajet();
    }, [id]);

    const handleReservation = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Calculer le coût total en crédits
        const creditCost = trajet.prix * nombrePlaces;

        // Vérifier si l'utilisateur a assez de crédits
        if (user.credits < creditCost) {
            setError(`Vous n'avez pas assez de crédits. Nécessaire: ${creditCost}, Disponible: ${user.credits}`);
            return;
        }

        // Demander confirmation
        if (!window.confirm(`Confirmer la réservation ? Cela vous coûtera ${creditCost} crédits.`)) {
            return;
        }

        try {
            const reservationData = {
                trajet_id: trajet.id,
                passager_id: user.id,
                nombre_places: nombrePlaces,
                prix_total: trajet.prix * nombrePlaces,
                credits_cost: creditCost
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(reservationData)
            });

            const responseData = await response.json();
            console.log('Réponse du serveur:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || 'Erreur lors de la réservation');
            }

            setReservationSuccess(true);
            
            setTrajet(prev => ({
                ...prev,
                places_restantes: prev.places_restantes - nombrePlaces
            }));

            setTimeout(() => {
                navigate('/user-space');
            }, 2000);

        } catch (err) {
            console.error('Erreur lors de la réservation:', err);
            setError(err.message);
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!trajet) return <div className="error">Trajet non trouvé</div>;

    return (
        <div className="covoiturage-detail">
            <h2>Détails du trajet</h2>
            
            {reservationSuccess && (
                <div className="success-message">
                    Réservation effectuée avec succès ! Redirection...
                </div>
            )}

            <div className="trajet-info">
                <div className="trajet-header">
                    <h3>{trajet.depart} → {trajet.arrivee}</h3>
                    <span className="prix">{trajet.prix}€ par personne</span>
                </div>

                <div className="trajet-details">
                    <p>
                        <strong>Date de départ :</strong> {new Date(trajet.date_depart).toLocaleString()}
                    </p>
                    <p>
                        <strong>Date d'arrivée :</strong> {new Date(trajet.date_arrivee).toLocaleString()}
                    </p>
                    <p>
                        <strong>Conducteur :</strong> {trajet.chauffeurpseudo}
                    </p>
                    <p>
                        <strong>Véhicule :</strong> {trajet.modele_voiture}
                        {trajet.est_ecologique && <span className="eco-badge">♻️ Écologique</span>}
                    </p>
                    <p>
                        <strong>Places disponibles :</strong> {trajet.places_restantes}/{trajet.places_totales}
                    </p>
                </div>

                {/* Section des avis */}
                {avis.length > 0 && (
                    <div className="avis-section">
                        <h3>Avis sur le conducteur ({avis.length})</h3>
                        <div className="avis-list">
                            {avis.map((avisItem) => (
                                <div key={avisItem.id} className="avis-item">
                                    <div className="avis-header">
                                        <div className="avis-note">
                                            {'★'.repeat(avisItem.note)}{'☆'.repeat(5-avisItem.note)}
                                        </div>
                                        <span className="avis-auteur">par {avisItem.auteur_pseudo}</span>
                                    </div>
                                    <p className="avis-commentaire">{avisItem.commentaire}</p>
                                    <span className="avis-date">
                                        {new Date(avisItem.date_creation).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {trajet.places_restantes > 0 && user && user.id !== trajet.conducteur_id && (
                    <div className="reservation-section">
                        <div className="credits-info">
                            <p>Vos crédits disponibles : {user.credits}</p>
                            <p>Coût de la réservation : {trajet.prix * nombrePlaces} crédits</p>
                        </div>
                        <div className="places-selection">
                            <label htmlFor="nombre-places">Nombre de places :</label>
                            <select
                                id="nombre-places"
                                value={nombrePlaces}
                                onChange={(e) => setNombrePlaces(Number(e.target.value))}
                            >
                                {[...Array(Math.min(trajet.places_restantes, 4))].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="prix-total">
                            Prix total : {(trajet.prix * nombrePlaces).toFixed(2)}€
                        </div>

                        <button 
                            type="button"
                            onClick={handleReservation}
                            className="reserver-button"
                            style={{ border: '2px solid red' }}
                        >
                            Réserver
                        </button>
                    </div>
                )}

                {user && user.id === trajet.conducteur_id && (
                    <div className="conducteur-message">
                        Vous êtes le conducteur de ce trajet
                    </div>
                )}

                {!user && (
                    <div className="connexion-message">
                        <p>Connectez-vous pour réserver ce trajet</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="connexion-button"
                        >
                            Se connecter
                        </button>
                    </div>
                )}
            </div>

            <div style={{margin: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px'}}>
                <p>Debug Info:</p>
                <pre>
                    {JSON.stringify({
                        user_logged_in: !!user,
                        user_id: user?.id,
                        trajet_loaded: !!trajet,
                        places_restantes: trajet?.places_restantes,
                        conducteur_id: trajet?.conducteur_id,
                        show_reservation_button: trajet?.places_restantes > 0 && user && user.id !== trajet?.conducteur_id
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default CovoiturageDetail; 
