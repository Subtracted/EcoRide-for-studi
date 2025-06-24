import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/cookies';
import './ProfilConducteur.css';

const ProfilConducteur = () => {
    const { user, updateUser } = useAuth();
    const [vehicules, setVehicules] = useState([]);
    const [preferences, setPreferences] = useState({
        fumeur: false,
        animaux: false,
        customPreferences: []
    });
    const [newVehicule, setNewVehicule] = useState({
        immatriculation: '',
        dateImmatriculation: '',
        modele: '',
        couleur: '',
        marque: '',
        places: ''
    });
    const [newPreference, setNewPreference] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newCustomPreference, setNewCustomPreference] = useState('');

    useEffect(() => {
        let mounted = true;

        const fetchVehicules = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicules`, {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des véhicules');
                }
                
                const data = await response.json();
                if (mounted) {
                    setVehicules(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                if (mounted) {
                    setError('Erreur lors de la récupération des véhicules');
                }
            }
        };

        fetchVehicules();
        fetchPreferences();
        return () => {
            mounted = false;
        };
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/preferences`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la récupération des préférences');
            }

            const data = await response.json();
            console.log('Données des préférences reçues:', data);
            
            setPreferences({
                fumeur: data.base?.fumeur || false,
                animaux: data.base?.animaux || false,
                customPreferences: data.custom || []
            });
        } catch (err) {
            console.error('Erreur lors de la récupération des préférences:', err);
            setError(err.message);
        }
    };

    const handleAddVehicule = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/vehicules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(newVehicule)
            });

            if (!response.ok) throw new Error('Erreur lors de l\'ajout du véhicule');

            setSuccess('Véhicule ajouté avec succès');
            fetchVehicules();
            setNewVehicule({
                immatriculation: '',
                dateImmatriculation: '',
                modele: '',
                couleur: '',
                marque: '',
                places: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddPreference = (preference) => {
        setPreferences(prev => ({
            ...prev,
            customPreferences: [...prev.customPreferences, preference]
        }));
    };

    const handleAddCustomPreference = async (e) => {
        e.preventDefault();
        if (!newCustomPreference.trim()) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/preferences/custom`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ description: newCustomPreference })
            });

            if (!response.ok) throw new Error('Erreur lors de l\'ajout de la préférence');

            setSuccess('Préférence ajoutée avec succès');
            setNewCustomPreference('');
            fetchPreferences();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemoveCustomPreference = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/preferences/custom/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');

            fetchPreferences();
            setSuccess('Préférence supprimée avec succès');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBecomeDriver = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/become-driver`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) throw new Error('Erreur lors du changement de statut');

            setSuccess('Vous êtes maintenant conducteur !');
            if (updateUser) {
                updateUser({ ...user, type_utilisateur: 'conducteur' });
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="profil-conducteur">
            <h3>Profil Conducteur</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {user?.type_utilisateur === 'passager' && (
                <div className="become-driver-section">
                    <p>Pour proposer des trajets, vous devez d'abord devenir conducteur</p>
                    <button onClick={handleBecomeDriver} className="become-driver-button">
                        Devenir conducteur
                    </button>
                </div>
            )}
            
            <section className="vehicules-section">
                <h4>Mes Véhicules</h4>
                <form onSubmit={handleAddVehicule} className="vehicule-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Immatriculation</label>
                            <input
                                type="text"
                                value={newVehicule.immatriculation}
                                onChange={(e) => setNewVehicule(prev => ({
                                    ...prev,
                                    immatriculation: e.target.value.toUpperCase()
                                }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date d'immatriculation</label>
                            <input
                                type="date"
                                value={newVehicule.dateImmatriculation}
                                onChange={(e) => setNewVehicule(prev => ({
                                    ...prev,
                                    dateImmatriculation: e.target.value
                                }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Marque</label>
                            <input
                                type="text"
                                value={newVehicule.marque}
                                onChange={(e) => setNewVehicule(prev => ({
                                    ...prev,
                                    marque: e.target.value
                                }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Modèle</label>
                            <input
                                type="text"
                                value={newVehicule.modele}
                                onChange={(e) => setNewVehicule(prev => ({
                                    ...prev,
                                    modele: e.target.value
                                }))}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Couleur</label>
                            <input
                                type="text"
                                value={newVehicule.couleur}
                                onChange={(e) => setNewVehicule(prev => ({
                                    ...prev,
                                    couleur: e.target.value
                                }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Nombre de places</label>
                            <input
                                type="number"
                                min="1"
                                max="9"
                                value={newVehicule.places}
                                onChange={(e) => setNewVehicule(prev => ({
                                    ...prev,
                                    places: e.target.value
                                }))}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit">Ajouter le véhicule</button>
                </form>

                <div className="vehicules-list">
                    {vehicules.map(vehicule => (
                        <div key={vehicule.id} className="vehicule-card">
                            <h5>{vehicule.marque} {vehicule.modele}</h5>
                            <p>Immatriculation : {vehicule.immatriculation}</p>
                            <p>Couleur : {vehicule.couleur}</p>
                            <p>Places : {vehicule.places}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="preferences-section">
                <h4>Mes Préférences</h4>
                
                {/* Préférences de base */}
                <div className="preferences-options">
                    <label>
                        <input
                            type="checkbox"
                            checked={preferences.fumeur}
                            onChange={(e) => setPreferences(prev => ({
                                ...prev,
                                fumeur: e.target.checked
                            }))}
                        />
                        Fumeur autorisé
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={preferences.animaux}
                            onChange={(e) => setPreferences(prev => ({
                                ...prev,
                                animaux: e.target.checked
                            }))}
                        />
                        Animaux autorisés
                    </label>
                </div>

                {/* Préférences personnalisées */}
                <div className="custom-preferences">
                    <h5>Préférences personnalisées</h5>
                    <form onSubmit={handleAddCustomPreference}>
                        <input
                            type="text"
                            value={newCustomPreference}
                            onChange={(e) => setNewCustomPreference(e.target.value)}
                            placeholder="Ajouter une préférence..."
                        />
                        <button type="submit">Ajouter</button>
                    </form>
                    <ul>
                        {preferences.customPreferences.map((pref, index) => (
                            <li key={index} className="custom-preference-item">
                                {pref}
                                <button onClick={() => handleRemoveCustomPreference(index)}>
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default ProfilConducteur; 
