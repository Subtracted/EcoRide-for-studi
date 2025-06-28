import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    console.log('ProtectedRoute - User role:', user?.role || 'none');
    console.log('ProtectedRoute - Required role:', requiredRole);

    if (!user) {
        console.log('ProtectedRoute - No user, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (user.statut === 'suspendu') {
        console.log('ProtectedRoute - Account suspended');
        return <Navigate to="/compte-suspendu" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        console.log(`ProtectedRoute - Insufficient role. Required: ${requiredRole}, Current: ${user.role}`);
        return <Navigate to="/" />;
    }

    console.log('ProtectedRoute - Access granted');
    return children;
};

export default ProtectedRoute; 
