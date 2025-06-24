import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, setAuthToken, clearAuthToken } from '../utils/cookies';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                // Récupérer les infos utilisateur complètes depuis le backend
                fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(res => {
                    if (!res.ok) throw new Error('Erreur de récupération du profil');
                    return res.json();
                })
                .then(data => {
                    if (data.user) {
                        setUser(data.user);
                    }
                })
                .catch(err => {
                    console.error('Erreur récupération profil:', err);
                    clearAuthToken();
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
            } catch (err) {
                console.error('Erreur décodage token:', err);
                clearAuthToken();
                setUser(null);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials, rememberMe = false) => {
        try {
            console.log('Données envoyées:', credentials); // Debug

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials) // S'assurer que c'est un objet valide
            });

            const data = await response.json();

            if (response.ok) {
                setAuthToken(data.token, rememberMe);
                setUser(data.user);
                console.log(`Connexion réussie - Se souvenir: ${rememberMe ? 'Oui (30 jours)' : 'Non (24h)'}`);
                return { success: true };
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            console.error('Erreur login:', err);
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        clearAuthToken();
        setUser(null);
        console.log('Déconnexion réussie - Cookie supprimé');
    };

    const register = async (user, token, rememberMe = false) => {
        try {
            console.log('Tentative d\'enregistrement:', { user, token });
            setAuthToken(token, rememberMe);
            setUser(user);
            console.log('Utilisateur enregistré avec succès');
        } catch (err) {
            console.error('Erreur dans register:', err);
            throw err;
        }
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};
