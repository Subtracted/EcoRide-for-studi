import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
            const response = await fetch('/api/employe/avis/en-attente', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setAvisEnAttente(data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const fetchSignalements = async () => {
        try {
            const response = await fetch('/api/employe/signalements', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setSignalements(data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const fetchStatsCovoiturages = async () => {
        try {
            const response = await fetch('/api/employe/stats/covoiturages', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setStatsCovoiturages(data);
        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleAvisAction = async (avisId, action) => {
        try {
            await fetch(`/api/employe/avis/${avisId}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchAvisEnAttente();
        } catch (err) {
            console.error('Erreur:', err);
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
                        <div className="stat-card">
                            <h3>Statistiques des covoiturages</h3>
                            <Line 
                                data={{
                                    labels: statsCovoiturages.map(stat => stat.date),
                                    datasets: [{
                                        label: 'Nombre de trajets',
                                        data: statsCovoiturages.map(stat => stat.nombre_trajets),
                                        borderColor: 'rgb(34, 197, 94)',
                                        tension: 0.1
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Évolution des covoiturages'
                                        }
                                    }
                                }}
                            />
                        </div>
                        
                        <div className="stat-card">
                            <h3>Places disponibles</h3>
                            <Line 
                                data={{
                                    labels: statsCovoiturages.map(stat => stat.date),
                                    datasets: [{
                                        label: 'Places totales',
                                        data: statsCovoiturages.map(stat => stat.places_totales),
                                        borderColor: 'rgb(59, 130, 246)',
                                        tension: 0.1
                                    }, {
                                        label: 'Places restantes',
                                        data: statsCovoiturages.map(stat => stat.places_restantes),
                                        borderColor: 'rgb(239, 68, 68)',
                                        tension: 0.1
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Évolution des places'
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeSpace; 