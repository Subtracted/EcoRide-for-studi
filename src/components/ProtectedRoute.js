import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    console.log(' ProtectedRoute - User:', user);
    console.log(' ProtectedRoute - Required role:', requiredRole);

    if (!user) {
        console.log(' ProtectedRoute - Pas d\'utilisateur, redirection vers login');
        return <Navigate to="/login" />;
    }

    if (user.statut === 'suspendu') {
        console.log(' ProtectedRoute - Compte suspendu');
        return <Navigate to="/compte-suspendu" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        console.log(` ProtectedRoute - Rôle insuffisant. Requis: ${requiredRole}, Actuel: ${user.role}`);
        return <Navigate to="/" />;
    }

    console.log(' ProtectedRoute - Accès autorisé');
    return children;
};

export default ProtectedRoute; 
