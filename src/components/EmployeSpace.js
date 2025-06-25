import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../utils/cookies';
import './EmployeSpace.css';

const EmployeSpace = () => {
    const [activeTab, setActiveTab] = useState('avis');
    const [avisEnAttente, setAvisEnAttente] = useState([]);
    const [signalements, setSignalements] = useState([]);
    const [statsCovoiturages, setStatsCovoiturages] = useState([]);

    useEffect(() => {
        fetchAvisEnAttente();
        fetchSignalements();
        fetchStatsCovoiturages();
    }, []);

    const fetchAvisEnAttente = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employes?type=avis`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des avis');
            }

            const data = await response.json();
            setAvisEnAttente(data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const fetchSignalements = async () => {
        try {
            // Données factices pour la démo
            const data = [
                {
                    id: 1,
                    trajet_id: 123,
                    date_signalement: new Date(),
                    conducteur_pseudo: 'conducteur1',
                    conducteur_email: 'conducteur1@example.com',
                    passager_pseudo: 'passager1',
                    passager_email: 'passager1@example.com',
                    ville_depart: 'Paris',
                    ville_arrivee: 'Lyon',
                    date_depart: new Date(),
                    description: 'Retard important sans prévenir'
                }
            ];
            setSignalements(data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const fetchStatsCovoiturages = async () => {
        try {
            // Données factices pour la démo
            const data = [
                { date: '2024-01-01', nombre_trajets: 15 },
                { date: '2024-01-02', nombre_trajets: 23 },
                { date: '2024-01-03', nombre_trajets: 18 }
            ];
            setStatsCovoiturages(data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleAvisAction = async (avisId, action) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    avisId,
                    action
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la validation de l\'avis');
            }

            const result = await response.json();
            console.log(result.message);
            
            // Retirer l'avis de la liste après action
            setAvisEnAttente(avisEnAttente.filter(avis => avis.id !== avisId));
        } catch (err) {
            console.error('Erreur:', err);
            alert('Erreur lors de la validation de l\'avis');
        }
    };

    return (
        <div className="employe-space">
            <h2>Espace Employé</h2>
            
            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'avis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('avis')}
                >
                    Avis en attente
                </button>
                <button 
                    className={`tab ${activeTab === 'signalements' ? 'active' : ''}`}
                    onClick={() => setActiveTab('signalements')}
                >
                    Signalements
                </button>
                <button 
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistiques
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'avis' && (
                    <div className="avis-list">
                        {avisEnAttente.map(avis => (
                            <div key={avis.id} className="avis-card">
                                <div className="avis-header">
                                    <h3>Avis de {avis.auteur_pseudo}</h3>
                                    <div className="avis-actions">
                                        <button 
                                            onClick={() => handleAvisAction(avis.id, 'valider')}
                                            className="btn-valider"
                                        >
                                            Valider
                                        </button>
                                        <button 
                                            onClick={() => handleAvisAction(avis.id, 'refuser')}
                                            className="btn-refuser"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                </div>
                                <div className="avis-content">
                                    <p>{avis.commentaire}</p>
                                    <div className="avis-meta">
                                        <span>Note: {avis.note}/5</span>
                                        <span>Pour: {avis.conducteur_pseudo}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'signalements' && (
                    <div className="signalements-list">
                        {signalements.map(signalement => (
                            <div key={signalement.id} className="signalement-card">
                                <div className="signalement-header">
                                    <h3>Trajet #{signalement.trajet_id}</h3>
                                    <div className="signalement-date">
                                        {new Date(signalement.date_signalement).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="signalement-content">
                                    <div className="participants">
                                        <div className="participant">
                                            <strong>Conducteur:</strong>
                                            <p>{signalement.conducteur_pseudo}</p>
                                            <p>{signalement.conducteur_email}</p>
                                        </div>
                                        <div className="participant">
                                            <strong>Passager:</strong>
                                            <p>{signalement.passager_pseudo}</p>
                                            <p>{signalement.passager_email}</p>
                                        </div>
                                    </div>
                                    <div className="trajet-details">
                                        <p><strong>Départ:</strong> {signalement.ville_depart}</p>
                                        <p><strong>Arrivée:</strong> {signalement.ville_arrivee}</p>
                                        <p><strong>Date:</strong> {new Date(signalement.date_depart).toLocaleString()}</p>
                                    </div>
                                    <div className="signalement-description">
                                        <strong>Description du problème:</strong>
                                        <p>{signalement.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="stats-container">
                        <div className="stats-summary">
                            <h3>Résumé des statistiques</h3>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-value">
                                        {statsCovoiturages.reduce((acc, stat) => acc + stat.nombre_trajets, 0)}
                                    </div>
                                    <div className="stat-label">Total trajets</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">
                                        {avisEnAttente.length}
                                    </div>
                                    <div className="stat-label">Avis en attente</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">
                                        {signalements.length}
                                    </div>
                                    <div className="stat-label">Signalements actifs</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="stats-table">
                            <h4>Évolution des trajets</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Nombre de trajets</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statsCovoiturages.map((stat, index) => (
                                        <tr key={index}>
                                            <td>{stat.date}</td>
                                            <td>{stat.nombre_trajets}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeSpace; 
