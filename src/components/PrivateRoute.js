import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
    const { user } = useAuth();
    const location = useLocation();
    
    console.log('PrivateRoute: État utilisateur:', user);
    console.log('PrivateRoute: Location actuelle:', location);

    if (!user) {
        console.log('PrivateRoute: Redirection vers login');
        return <Navigate to="/login" state={{ from: location }} />;
    }

    // Vérification du rôle si nécessaire
    if (role && user.role !== role) {
        console.log('PrivateRoute: Accès refusé - mauvais rôle');
        return <Navigate to="/" />;
    }

    console.log('PrivateRoute: Accès autorisé');
    return children;
};

export default PrivateRoute; 