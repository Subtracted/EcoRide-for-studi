import React, { useState } from 'react';
import './CreateEmploye.css';
import { getAuthToken } from '../utils/cookies';
import { validatePassword, evaluatePasswordStrength } from '../utils/passwordValidation';

const CreateEmploye = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(null);

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
        setSuccess('');

        // Validation côté client
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            setError('Mot de passe invalide : ' + passwordValidation.errors.join(', '));
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/employes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    role: 'employe'
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la création du compte employé');
            }

            setSuccess('Compte employé créé avec succès');
            setFormData({
                nom: '',
                prenom: '',
                email: '',
                password: ''
            });
            
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.message);
            console.error('Erreur:', err);
        }
    };

    return (
        <div className="create-employe">
            <h3>Créer un compte employé</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
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
                    <label htmlFor="nom">Nom</label>
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
                    <label htmlFor="email">Email</label>
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
                    <label htmlFor="password">Mot de passe</label>
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

                <button type="submit" className="submit-button">
                    Créer le compte
                </button>
            </form>
        </div>
    );
};

export default CreateEmploye; 