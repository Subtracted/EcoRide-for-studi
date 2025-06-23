import React, { useState, useEffect } from 'react';
import CreateEmploye from './CreateEmploye';
import EmployesList from './EmployesList';
import './AdminSpace.css';

/**
 * Espace d'administration
 * Interface pour les administrateurs permettant de gérer les utilisateurs,
 * les trajets et les statistiques
 */
const AdminSpace = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState({
        totalCredits: 0,
        covoituragesParJour: [],
        creditsParJour: []
    });
    const [employes, setEmployes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Charge les statistiques au montage du composant
     */
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Données factices pour la démo
            const employesData = [
                { id: 1, pseudo: 'employe1', email: 'employe1@ecoride.com', statut: 'actif', role: 'employe' },
                { id: 2, pseudo: 'employe2', email: 'employe2@ecoride.com', statut: 'actif', role: 'employe' }
            ];
            
            const statsData = {
                totalCredits: 2450,
                covoituragesParJour: [
                    { date: '2024-01-01', count: 5 },
                    { date: '2024-01-02', count: 8 },
                    { date: '2024-01-03', count: 12 }
                ],
                creditsParJour: [
                    { date: '2024-01-01', amount: 125 },
                    { date: '2024-01-02', amount: 200 },
                    { date: '2024-01-03', amount: 300 }
                ]
            };

            setEmployes(employesData);
            setStats(statsData);
        } catch (err) {
            setError("Erreur lors du chargement des données");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployes = async () => {
        // API call would go here
        console.log('Fetching employes...');
    };

    const fetchStats = async () => {
        // API call would go here
        console.log('Fetching stats...');
    };

    const handleSuspendEmploye = async (employeId) => {
        try {
            // Simulation de l'API call
            console.log('Suspending employe:', employeId);

            // Mettre à jour la liste des employés localement
            setEmployes(employes.map(employe => 
                employe.id === employeId 
                    ? { ...employe, statut: employe.statut === 'actif' ? 'suspendu' : 'actif' }
                    : employe
            ));
        } catch (err) {
            setError(err.message);
            console.error('Erreur lors de la suspension:', err);
        }
    };

    if (loading) return <div className="loading">Chargement...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-space">
            <h2>Espace Administrateur</h2>

            <div className="admin-tabs">
                <button 
                    className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistiques
                </button>
                <button 
                    className={`tab-button ${activeTab === 'employes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employes')}
                >
                    Gestion Employés
                </button>
            </div>

            {activeTab === 'stats' && (
                <div className="stats-container">
                    <div className="total-credits">
                        <h3>Total des crédits</h3>
                        <p className="credits-amount">{stats.totalCredits}</p>
                    </div>
                    
                    <div className="stats-summary">
                        <div className="stat-item">
                            <h4>Covoiturages aujourd'hui</h4>
                            <div className="stat-number">
                                {stats.covoituragesParJour.length > 0 ? 
                                    stats.covoituragesParJour[stats.covoituragesParJour.length - 1].count : 0}
                            </div>
                        </div>
                        
                        <div className="stat-item">
                            <h4>Crédits aujourd'hui</h4>
                            <div className="stat-number">
                                {stats.creditsParJour.length > 0 ? 
                                    stats.creditsParJour[stats.creditsParJour.length - 1].amount : 0}
                            </div>
                        </div>
                    </div>

                    <div className="stats-table">
                        <h4>Historique des covoiturages</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Nombre de trajets</th>
                                    <th>Crédits générés</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.covoituragesParJour.map((stat, index) => (
                                    <tr key={index}>
                                        <td>{stat.date}</td>
                                        <td>{stat.count}</td>
                                        <td>{stats.creditsParJour[index]?.amount || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'employes' && (
                <div className="employes-container">
                    <div className="create-employe-section">
                        <h3>Créer un nouvel employé</h3>
                        <CreateEmploye onSuccess={fetchEmployes} />
                    </div>
                    
                    <div className="employes-list-section">
                        <h3>Liste des employés</h3>
                        <EmployesList 
                            employes={employes} 
                            onSuspend={handleSuspendEmploye}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSpace; 