import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
 * Tableau de bord administrateur
 * Affiche les statistiques globales et les actions rapides
 */
const Dashboard = () => {
    // État pour les données du tableau de bord
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalTrajets: 0,
        totalCredits: 0,
        recentActivities: [],
        stats: [],
        recentConnections: [],
        recentTrajetActions: []
    });
    const [loading, setLoading] = useState(true);

    /**
     * Charge les données du tableau de bord
     */
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setDashboardData(data);
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading) return <div>Chargement...</div>;

    const statsData = {
        labels: dashboardData.stats.map(stat => 
            new Date(stat.date).toLocaleDateString()
        ),
        datasets: [
            {
                label: 'Trajets',
                data: dashboardData.stats.map(stat => stat.trajets_count),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Crédits gagnés',
                data: dashboardData.stats.map(stat => stat.credits_earned),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    return (
        <div className="dashboard">
            <h2>Tableau de bord</h2>
            
            <div className="stats-chart">
                <h3>Statistiques des 30 derniers jours</h3>
                <Line data={statsData} />
            </div>

            <div className="recent-activities">
                <div className="connections">
                    <h3>Dernières connexions</h3>
                    <ul>
                        {dashboardData.recentConnections.map((log, index) => (
                            <li key={index}>
                                Utilisateur {log.userId} - {log.action} 
                                {' '}
                                {new Date(log.timestamp).toLocaleString()}
                                {' '}
                                depuis {log.ip}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="trajet-actions">
                    <h3>Dernières actions sur les trajets</h3>
                    <ul>
                        {dashboardData.recentTrajetActions.map((log, index) => (
                            <li key={index}>
                                Trajet {log.trajetId} - {log.action} 
                                {' '}
                                par utilisateur {log.userId}
                                {' '}
                                {new Date(log.timestamp).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 