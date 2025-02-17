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

const AdminSpace = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [employes, setEmployes] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [statsCovoiturages, setStatsCovoiturages] = useState([]);
    const [statsCredits, setStatsCredits] = useState([]);
    const [totalCredits, setTotalCredits] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [newEmploye, setNewEmploye] = useState({
        email: '',
        mot_de_passe: '',
        nom: '',
        prenom: ''
    });

    useEffect(() => {
        fetchStats();
        fetchEmployes();
        fetchUtilisateurs();
    }, []);

    const fetchStats = async () => {
        try {
            const [covoResponse, creditsResponse] = await Promise.all([
                fetch('/api/admin/stats/covoiturages', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('/api/admin/stats/credits', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const [covoData, creditsData] = await Promise.all([
                covoResponse.json(),
                creditsResponse.json()
            ]);

            setStatsCovoiturages(covoData);
            setStatsCredits(creditsData);
            setTotalCredits(creditsData.reduce((acc, curr) => acc + curr.total_credits, 0));
        } catch (err) {
            console.error('Erreur lors du chargement des statistiques:', err);
        }
    };

    const fetchEmployes = async () => {
        try {
            const response = await fetch('/api/admin/employes', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setEmployes(data);
        } catch (err) {
            console.error('Erreur lors du chargement des employés:', err);
        }
    };

    const fetchUtilisateurs = async () => {
        try {
            const response = await fetch('/api/admin/utilisateurs', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setUtilisateurs(data);
        } catch (err) {
            console.error('Erreur lors du chargement des utilisateurs:', err);
        }
    };

    const handleCreateEmploye = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/employes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newEmploye)
            });

            if (response.ok) {
                setNewEmploye({
                    email: '',
                    mot_de_passe: '',
                    nom: '',
                    prenom: ''
                });
                fetchEmployes();
            }
        } catch (err) {
            console.error('Erreur lors de la création de l\'employé:', err);
        }
    };

    const handleSuspendAccount = async (userId, type) => {
        try {
            await fetch('/api/admin/suspend-account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ userId, type })
            });
            
            if (type === 'employe') {
                fetchEmployes();
            } else {
                fetchUtilisateurs();
            }
        } catch (err) {
            console.error('Erreur lors de la suspension du compte:', err);
        }
    };

    const covoituragesChartData = {
        labels: statsCovoiturages.map(stat => stat.date),
        datasets: [{
            label: 'Nombre de covoiturages',
            data: statsCovoiturages.map(stat => stat.count),
            borderColor: 'rgb(34, 197, 94)',
            tension: 0.1
        }]
    };

    const creditsChartData = {
        labels: statsCredits.map(stat => stat.date),
        datasets: [{
            label: 'Crédits gagnés',
            data: statsCredits.map(stat => stat.amount),
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1
        }]
    };

    return (
        <div className="admin-space">
            <h2>Espace Administrateur</h2>

            <div className="stats-overview">
                <div className="total-credits">
                    <h3>Total des crédits plateforme</h3>
                    <div className="credits-amount">{totalCredits} crédits</div>
                </div>
            </div>

            <div className="tabs">
                <button 
                    className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Statistiques
                </button>
                <button 
                    className={`tab ${activeTab === 'employes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('employes')}
                >
                    Gestion des employés
                </button>
                <button 
                    className={`tab ${activeTab === 'utilisateurs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('utilisateurs')}
                >
                    Gestion des utilisateurs
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'stats' && (
                    <div className="stats-section">
                        <div className="charts-container">
                            <div className="chart-card">
                                <h3>Covoiturages par jour</h3>
                                <Line 
                                    data={covoituragesChartData}
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
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="chart-card">
                                <h3>Crédits gagnés par jour</h3>
                                <Line 
                                    data={creditsChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                            title: {
                                                display: true,
                                                text: 'Évolution des crédits'
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'employes' && (
                    <div className="employes-section">
                        <div className="create-employe">
                            <h3>Créer un compte employé</h3>
                            <form onSubmit={handleCreateEmploye}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={newEmploye.email}
                                        onChange={(e) => setNewEmploye({
                                            ...newEmploye,
                                            email: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input
                                            type="text"
                                            value={newEmploye.nom}
                                            onChange={(e) => setNewEmploye({
                                                ...newEmploye,
                                                nom: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Prénom</label>
                                        <input
                                            type="text"
                                            value={newEmploye.prenom}
                                            onChange={(e) => setNewEmploye({
                                                ...newEmploye,
                                                prenom: e.target.value
                                            })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Mot de passe</label>
                                    <input
                                        type="password"
                                        value={newEmploye.mot_de_passe}
                                        onChange={(e) => setNewEmploye({
                                            ...newEmploye,
                                            mot_de_passe: e.target.value
                                        })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="submit-button">
                                    Créer l'employé
                                </button>
                            </form>
                        </div>

                        <div className="employes-list">
                            <h3>Liste des employés</h3>
                            <div className="employes-grid">
                                {employes.map(employe => (
                                    <div key={employe.id} className="employe-card">
                                        <div className="employe-info">
                                            <h4>{employe.prenom} {employe.nom}</h4>
                                            <p>{employe.email}</p>
                                            <p className={`status ${employe.statut}`}>
                                                {employe.statut}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSuspendAccount(employe.id, 'employe')}
                                            className={`suspend-button ${employe.statut === 'suspendu' ? 'active' : ''}`}
                                        >
                                            {employe.statut === 'suspendu' ? 'Réactiver' : 'Suspendre'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'utilisateurs' && (
                    <div className="utilisateurs-section">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="utilisateurs-grid">
                            {utilisateurs
                                .filter(user => 
                                    user.pseudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    user.email.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(user => (
                                    <div key={user.id} className="utilisateur-card">
                                        <div className="utilisateur-info">
                                            <h4>{user.pseudo}</h4>
                                            <p>{user.email}</p>
                                            <div className="user-stats">
                                                <span>Trajets: {user.nombre_trajets || 0}</span>
                                                <span>Crédits: {user.credits || 0}</span>
                                            </div>
                                            <p className={`status ${user.statut}`}>
                                                {user.statut}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSuspendAccount(user.id, 'utilisateur')}
                                            className={`suspend-button ${user.statut === 'suspendu' ? 'active' : ''}`}
                                        >
                                            {user.statut === 'suspendu' ? 'Réactiver' : 'Suspendre'}
                                        </button>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSpace; 