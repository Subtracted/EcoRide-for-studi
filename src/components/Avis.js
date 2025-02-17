import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Avis.css';

const Avis = ({ trajetId, conducteurId, onAvisSubmit }) => {
    const { user } = useAuth();
    const [avis, setAvis] = useState({
        note: 5,
        commentaire: '',
        points_forts: [],
        points_faibles: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const pointsForts = [
        'Ponctuel',
        'Conduite prudente',
        'Véhicule propre',
        'Sympathique',
        'Bonne communication'
    ];

    const pointsFaibles = [
        'Retard',
        'Conduite sportive',
        'Véhicule sale',
        'Peu communicatif',
        'Non respectueux'
    ];

    const handleNoteChange = (newNote) => {
        setAvis(prev => ({ ...prev, note: newNote }));
    };

    const togglePoint = (point, type) => {
        setAvis(prev => ({
            ...prev,
            [type]: prev[type].includes(point)
                ? prev[type].filter(p => p !== point)
                : [...prev[type], point]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/avis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...avis,
                    trajet_id: trajetId,
                    conducteur_id: conducteurId
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Avis envoyé avec succès !');
                if (onAvisSubmit) onAvisSubmit(data);
            } else {
                setError(data.message || 'Erreur lors de l\'envoi de l\'avis');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="avis-container">
            <h3>Évaluer le trajet</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="note-section">
                    <label>Note globale</label>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star ${star <= avis.note ? 'active' : ''}`}
                                onClick={() => handleNoteChange(star)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="points-section">
                    <div className="points-forts">
                        <label>Points forts</label>
                        <div className="points-grid">
                            {pointsForts.map(point => (
                                <button
                                    key={point}
                                    type="button"
                                    className={`point ${avis.points_forts.includes(point) ? 'active' : ''}`}
                                    onClick={() => togglePoint(point, 'points_forts')}
                                >
                                    {point}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="points-faibles">
                        <label>Points à améliorer</label>
                        <div className="points-grid">
                            {pointsFaibles.map(point => (
                                <button
                                    key={point}
                                    type="button"
                                    className={`point ${avis.points_faibles.includes(point) ? 'active' : ''}`}
                                    onClick={() => togglePoint(point, 'points_faibles')}
                                >
                                    {point}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="commentaire-section">
                    <label>Commentaire (optionnel)</label>
                    <textarea
                        value={avis.commentaire}
                        onChange={(e) => setAvis(prev => ({ ...prev, commentaire: e.target.value }))}
                        placeholder="Partagez votre expérience..."
                        rows="4"
                    />
                </div>

                <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? 'Envoi...' : 'Envoyer l\'avis'}
                </button>
            </form>
        </div>
    );
};

export default Avis; 