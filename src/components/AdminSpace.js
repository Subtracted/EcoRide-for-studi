import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import CreateEmploye from './CreateEmploye';
import EmployesList from './EmployesList';
import './AdminSpace.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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
            const [employesData, statsData] = await Promise.all([
                fetchEmployes(),
                fetchStats()
            ]);

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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/employes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Erreur lors du chargement des employés');
        return response.json();
    };

    const fetchStats = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');
        return response.json();
    };

    const handleSuspendEmploye = async (employeId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/employes/${employeId}/suspend`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suspension du compte');
            }

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

    const covoituragesChartData = {
        labels: stats.covoituragesParJour.map(stat => stat.date),
        datasets: [{
            label: 'Nombre de covoiturages',
            data: stats.covoituragesParJour.map(stat => stat.count),
            borderColor: 'rgb(34, 197, 94)',
            tension: 0.1
        }]
    };

    const creditsChartData = {
        labels: stats.creditsParJour.map(stat => stat.date),
        datasets: [{
            label: 'Crédits gagnés',
            data: stats.creditsParJour.map(stat => stat.amount),
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1
        }]
    };

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
                    
                    <div className="charts-container">
                        <div className="chart-box">
                            <h3>Covoiturages par jour</h3>
                            <Line data={covoituragesChartData} />
                        </div>
                        
                        <div className="chart-box">
                            <h3>Crédits gagnés par jour</h3>
                            <Line data={creditsChartData} />
                        </div>
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