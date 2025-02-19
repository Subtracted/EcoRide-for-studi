import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

// TODO: Ajouter validation du formulaire
// TODO: Ajouter option "se souvenir de moi"
// Note perso: Penser à ajouter un système de récupération de mot de passe

const Login = () => {
    // État local pour le formulaire
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    // Gestion des changements dans le formulaire
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    /* 
    * Fonction qui gère la soumission du formulaire
    * - Vérifie que les champs sont remplis
    * - Appelle l'API de connexion
    * - Redirige vers la page d'accueil si succès
    */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const result = await login({
                email: formData.email,
                password: formData.password
            });

            if (result.success) {
                navigate('/mon-espace');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    return (
        <div className="login-container">
            <h2>Connexion</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="login-button">
                    Se connecter
                </button>
            </form>

            <div className="register-link">
                Pas encore de compte ? <Link to="/register">S'inscrire</Link>
            </div>
        </div>
    );
};

export default Login; 