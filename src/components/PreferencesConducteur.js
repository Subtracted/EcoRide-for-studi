import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './PreferencesConducteur.css';

const PreferencesConducteur = () => {
    const [preferences, setPreferences] = useState([]);
    const [selectedPrefs, setSelectedPrefs] = useState([]);
    const [newPref, setNewPref] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/preferences`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Vérifier que data est un tableau
            if (Array.isArray(data)) {
                setPreferences(data);
                // Si l'utilisateur a des préférences, les charger
                if (user && user.preferences) {
                    setSelectedPrefs(user.preferences);
                }
            } else {
                throw new Error('Format de données invalide');
            }
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les préférences. Veuillez réessayer plus tard.');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceToggle = async (prefId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/preferences/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ preferenceId: prefId })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour des préférences');
            }

            setSelectedPrefs(prev => {
                if (prev.includes(prefId)) {
                    return prev.filter(p => p !== prefId);
                }
                return [...prev, prefId];
            });
        } catch (err) {
            setError('Erreur lors de la mise à jour des préférences');
            console.error(err);
        }
    };

    const handleAddPreference = async (e) => {
        e.preventDefault();
        if (!newPref.trim()) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/preferences`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ libelle: newPref })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout de la préférence');
            }

            const data = await response.json();
            setPreferences([...preferences, data]);
            setNewPref('');
        } catch (err) {
            setError('Erreur lors de l\'ajout de la préférence');
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Chargement des préférences...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="preferences-container">
            <h3>Mes préférences de trajet</h3>
            
            <div className="preferences-grid">
                {preferences.map(pref => (
                    <button
                        key={pref.id}
                        className={`preference-button ${selectedPrefs.includes(pref.id) ? 'active' : ''}`}
                        onClick={() => handlePreferenceToggle(pref.id)}
                    >
                        {pref.nom}
                    </button>
                ))}
            </div>

            <form onSubmit={handleAddPreference} className="add-preference-form">
                <input
                    type="text"
                    value={newPref}
                    onChange={(e) => setNewPref(e.target.value)}
                    placeholder="Ajouter une préférence..."
                    maxLength={50}
                />
                <button type="submit">Ajouter</button>
            </form>
        </div>
    );
};

export default PreferencesConducteur; 