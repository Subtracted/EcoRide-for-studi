import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PreferencesConducteur.css';

const PreferencesConducteur = () => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState({
        musique: false,
        discussion: false,
        animaux: false,
        fumeur: false,
        climatisation: true,
        bagages_encombrants: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/preferences`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setPreferences(data);
                }
            } catch (err) {
                setError('Erreur lors du chargement des préférences');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPreferences();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setPreferences(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/preferences`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(preferences)
                }
            );

            if (response.ok) {
                setSuccess('Préférences mises à jour avec succès !');
            } else {
                const data = await response.json();
                setError(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading">Chargement des préférences...</div>;
    }

    return (
        <div className="preferences-container">
            <h2>Préférences de trajet</h2>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="preferences-grid">
                    <label className="preference-item">
                        <input
                            type="checkbox"
                            name="musique"
                            checked={preferences.musique}
                            onChange={handleChange}
                        />
                        <div className="preference-content">
                            <span className="preference-icon">🎵</span>
                            <div className="preference-text">
                                <span className="preference-title">Musique</span>
                                <span className="preference-description">J'aime mettre de la musique pendant les trajets</span>
                            </div>
                        </div>
                    </label>

                    <label className="preference-item">
                        <input
                            type="checkbox"
                            name="discussion"
                            checked={preferences.discussion}
                            onChange={handleChange}
                        />
                        <div className="preference-content">
                            <span className="preference-icon">💬</span>
                            <div className="preference-text">
                                <span className="preference-title">Discussion</span>
                                <span className="preference-description">J'apprécie les conversations pendant le trajet</span>
                            </div>
                        </div>
                    </label>

                    <label className="preference-item">
                        <input
                            type="checkbox"
                            name="animaux"
                            checked={preferences.animaux}
                            onChange={handleChange}
                        />
                        <div className="preference-content">
                            <span className="preference-icon">🐾</span>
                            <div className="preference-text">
                                <span className="preference-title">Animaux acceptés</span>
                                <span className="preference-description">Les animaux de compagnie sont les bienvenus</span>
                            </div>
                        </div>
                    </label>

                    <label className="preference-item">
                        <input
                            type="checkbox"
                            name="fumeur"
                            checked={preferences.fumeur}
                            onChange={handleChange}
                        />
                        <div className="preference-content">
                            <span className="preference-icon">🚬</span>
                            <div className="preference-text">
                                <span className="preference-title">Fumeur autorisé</span>
                                <span className="preference-description">La cigarette est autorisée dans le véhicule</span>
                            </div>
                        </div>
                    </label>

                    <label className="preference-item">
                        <input
                            type="checkbox"
                            name="climatisation"
                            checked={preferences.climatisation}
                            onChange={handleChange}
                        />
                        <div className="preference-content">
                            <span className="preference-icon">❄️</span>
                            <div className="preference-text">
                                <span className="preference-title">Climatisation</span>
                                <span className="preference-description">Le véhicule est équipé de la climatisation</span>
                            </div>
                        </div>
                    </label>

                    <label className="preference-item">
                        <input
                            type="checkbox"
                            name="bagages_encombrants"
                            checked={preferences.bagages_encombrants}
                            onChange={handleChange}
                        />
                        <div className="preference-content">
                            <span className="preference-icon">🧳</span>
                            <div className="preference-text">
                                <span className="preference-title">Bagages encombrants</span>
                                <span className="preference-description">Je peux transporter des bagages volumineux</span>
                            </div>
                        </div>
                    </label>
                </div>

                <button 
                    type="submit" 
                    className="save-button"
                    disabled={saving}
                >
                    {saving ? 'Enregistrement...' : 'Enregistrer les préférences'}
                </button>
            </form>
        </div>
    );
};

export default PreferencesConducteur; 