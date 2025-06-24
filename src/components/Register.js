import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validatePassword, validatePasswordConfirmation, evaluatePasswordStrength } from '../utils/passwordValidation';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: '',
        confirmPassword: '',
        nom: '',
        prenom: '',
        telephone: ''
    });
    const [error, setError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Validation en temps réel du mot de passe
        if (name === 'password') {
            const validation = validatePassword(value);
            setPasswordErrors(validation.errors);
            
            const strength = evaluatePasswordStrength(value);
            setPasswordStrength(strength);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation côté client
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setError('Mot de passe invalide : ' + passwordValidation.errors.join(', '));
            setLoading(false);
            return;
        }

        const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
        if (!confirmValidation.isValid) {
            setError(confirmValidation.error);
            setLoading(false);
            return;
        }

        try {
            console.log('Envoi des données:', formData); // Log pour déboguer
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Réponse du serveur:', data); // Log pour déboguer

            if (!response.ok) {
                throw new Error(data.message || data.errors?.join(', ') || 'Erreur lors de l\'inscription');
            }

            // Si l'inscription réussit, connecter l'utilisateur
            await register(data.user, data.token);
            navigate('/user-space');
        } catch (err) {
            console.error('Erreur complète:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Inscription</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="pseudo">Pseudo *</label>
                    <input
                        type="text"
                        id="pseudo"
                        name="pseudo"
                        value={formData.pseudo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Mot de passe *</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {passwordStrength && (
                        <div className={`password-strength strength-${passwordStrength.strength.toLowerCase().replace(' ', '-')}`}>
                            <div className="strength-bar">
                                <div 
                                    className="strength-fill" 
                                    style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                                ></div>
                            </div>
                            <span className="strength-text">Force : {passwordStrength.strength}</span>
                        </div>
                    )}
                    {passwordErrors.length > 0 && (
                        <div className="password-errors">
                            {passwordErrors.map((error, index) => (
                                <div key={index} className="password-error">• {error}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="nom">Nom *</label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="prenom">Prénom *</label>
                    <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
            </form>
        </div>
    );
};

export default Register; 