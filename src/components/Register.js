import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        motDePasse: '',
        confirmMotDePasse: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.motDePasse !== formData.confirmMotDePasse) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            await register(formData.pseudo, formData.email, formData.motDePasse);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        }
    };

    return (
        <div className="register-container">
            <h2>Inscription</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label>Pseudo</label>
                    <input
                        type="text"
                        name="pseudo"
                        value={formData.pseudo}
                        onChange={handleChange}
                        required
                    />
                </div>
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
                        name="motDePasse"
                        value={formData.motDePasse}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirmer le mot de passe</label>
                    <input
                        type="password"
                        name="confirmMotDePasse"
                        value={formData.confirmMotDePasse}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="register-button">
                    S'inscrire
                </button>
            </form>
        </div>
    );
};

export default Register; 