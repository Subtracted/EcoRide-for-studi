import React from 'react';
import './EmployesList.css';

const EmployesList = ({ employes, onSuspend }) => {
    return (
        <div className="employes-list">
            <h3>Liste des employés</h3>
            <div className="employes-grid">
                {employes.map(employe => (
                    <div key={employe.id} className="employe-card">
                        <div className="employe-info">
                            <h4>{employe.prenom || employe.pseudo} {employe.nom || ''}</h4>
                            <p>{employe.email}</p>
                            <span className={`status ${employe.statut}`}>
                                {employe.statut === 'actif' ? 'Actif' : 'Suspendu'}
                            </span>
                        </div>
                        <button
                            onClick={() => onSuspend(employe.id)}
                            className={`suspend-button ${employe.statut === 'suspendu' ? 'active' : ''}`}
                        >
                            {employe.statut === 'suspendu' ? 'Réactiver' : 'Suspendre'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmployesList; 
