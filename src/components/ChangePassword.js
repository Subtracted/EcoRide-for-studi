import React, { useState } from 'react';
import { getAuthToken } from '../utils/cookies';
import { validatePassword, validatePasswordConfirmation, evaluatePasswordStrength } from '../utils/passwordValidation';
import './ChangePassword.css';

const ChangePassword = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Validation en temps réel du nouveau mot de passe
        if (name === 'newPassword') {
            const validation = validatePassword(value);
            setPasswordErrors(validation.errors);
            
            const strength = evaluatePasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Réinitialiser les messages d'erreur
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Validation côté client
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
            setError('Nouveau mot de passe invalide : ' + passwordValidation.errors.join(', '));
            setLoading(false);
            return;
        }

        const confirmValidation = validatePasswordConfirmation(formData.newPassword, formData.confirmPassword);
        if (!confirmValidation.isValid) {
            setError(confirmValidation.error);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.errors?.join(', ') || 'Erreur lors du changement de mot de passe');
            }

            setSuccess('Mot de passe changé avec succès !');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordErrors([]);
            setPasswordStrength(null);

            // Appeler la fonction de succès si fournie
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }

        } catch (err) {
            console.error('Erreur changement mot de passe:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-modal">
            <div className="change-password-content">
                <div className="change-password-header">
                    <h3>Changer le mot de passe</h3>
                    {onClose && (
                        <button className="close-button" onClick={onClose}>
                            ×
                        </button>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit} className="change-password-form">
                    <div className="form-group">
                        <label htmlFor="currentPassword">Mot de passe actuel *</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">Nouveau mot de passe *</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
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
                        <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            disabled={loading || passwordErrors.length > 0}
                            className="submit-button"
                        >
                            {loading ? 'Changement en cours...' : 'Changer le mot de passe'}
                        </button>
                        {onClose && (
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="cancel-button"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>

                <div className="password-requirements">
                    <h4>Exigences pour le mot de passe :</h4>
                    <ul>
                        <li>Au moins 8 caractères</li>
                        <li>Au moins une lettre majuscule</li>
                        <li>Au moins une lettre minuscule</li>
                        <li>Au moins un chiffre</li>
                        <li>Au moins un caractère spécial (!@#$%^&*)</li>
                        <li>Pas de séquences communes (123456, password, etc.)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword; 
