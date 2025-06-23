import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

const Dashboard = () => {
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

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const data = {
                totalUsers: 25,
                totalTrajets: 48,
                totalCredits: 1250,
                recentActivities: [],
                stats: [
                    { date: '2024-01-01', trajets_count: 5, credits_earned: 125 },
                    { date: '2024-01-02', trajets_count: 8, credits_earned: 200 }
                ],
                recentConnections: [
                    { userId: 1, action: 'login', timestamp: new Date(), ip: '127.0.0.1' },
                    { userId: 2, action: 'login', timestamp: new Date(), ip: '127.0.0.1' }
                ],
                recentTrajetActions: [
                    { trajetId: 1, action: 'created', userId: 3, timestamp: new Date() },
                    { trajetId: 2, action: 'booked', userId: 4, timestamp: new Date() }
                ]
            };
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

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="dashboard">
            <h2>Tableau de bord</h2>
            
            <div className="stats-overview">
                <div className="stat-card">
                    <h3>Utilisateurs</h3>
                    <div className="stat-number">{dashboardData.totalUsers}</div>
                </div>
                <div className="stat-card">
                    <h3>Trajets</h3>
                    <div className="stat-number">{dashboardData.totalTrajets}</div>
                </div>
                <div className="stat-card">
                    <h3>Crédits totaux</h3>
                    <div className="stat-number">{dashboardData.totalCredits}</div>
                </div>
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
