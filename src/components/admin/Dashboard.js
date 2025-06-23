import React from 'react';

const Dashboard = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h2>Tableau de bord</h2>
            <p>Dashboard temporairement simplifié - Version de test</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Utilisateurs</h3>
                    <div style={{ fontSize: '2em', fontWeight: 'bold' }}>25</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Trajets</h3>
                    <div style={{ fontSize: '2em', fontWeight: 'bold' }}>48</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>Crédits</h3>
                    <div style={{ fontSize: '2em', fontWeight: 'bold' }}>1250</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
