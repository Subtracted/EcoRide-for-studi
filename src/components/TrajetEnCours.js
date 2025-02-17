import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './TrajetEnCours.css';
import { sendCancellationEmail, sendValidationEmail } from '../services/emailService';

const TrajetEnCours = ({ trajet, onUpdate }) => {
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStartTrajet = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${trajet.id}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du démarrage du trajet');

            setSuccess('Trajet démarré avec succès !');
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEndTrajet = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${trajet.id}/end`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la finalisation');

            // Envoyer les emails de validation aux passagers
            for (const passager of trajet.passagers) {
                await sendValidationEmail(passager.email, trajet);
            }

            setSuccess('Trajet terminé avec succès');
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelTrajet = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/trajets/${trajet.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors de l\'annulation');

            // Envoyer les emails aux passagers
            for (const passager of trajet.passagers) {
                await sendCancellationEmail(passager.email, trajet);
            }

            setSuccess('Trajet annulé avec succès');
            if (onUpdate) onUpdate();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trajet-en-cours">
            <div className="trajet-header">
                <h3>{trajet.depart} → {trajet.arrivee}</h3>
                <span className={`status ${trajet.statut}`}>{trajet.statut}</span>
            </div>

            <div className="trajet-details">
                <p>Date de départ : {new Date(trajet.date_depart).toLocaleString()}</p>
                <p>Places réservées : {trajet.places_totales - trajet.places_restantes}/{trajet.places_totales}</p>
                <p>Prix : {trajet.prix} crédits</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="trajet-actions">
                {trajet.statut === 'en_attente' && (
                    <>
                        <button 
                            onClick={handleStartTrajet}
                            disabled={loading}
                            className="start-button"
                        >
                            {loading ? 'Démarrage...' : 'Démarrer le trajet'}
                        </button>
                        <button 
                            onClick={handleCancelTrajet}
                            disabled={loading}
                            className="cancel-button"
                        >
                            {loading ? 'Annulation...' : 'Annuler le trajet'}
                        </button>
                    </>
                )}

                {trajet.statut === 'en_cours' && (
                    <button 
                        onClick={handleEndTrajet}
                        disabled={loading}
                        className="end-button"
                    >
                        {loading ? 'Finalisation...' : 'Terminer le trajet'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TrajetEnCours; 