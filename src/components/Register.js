import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: '',
        nom: '',
        prenom: '',
        telephone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Envoi des données:', formData);
            
            // Vérification de l'URL API
            const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
            console.log('API URL utilisée:', apiUrl);
            
            const url = `${apiUrl}/api/auth/register`;
            console.log('URL complète:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Status de la réponse:', response.status);
            console.log('Headers de la réponse:', response.headers);

            // Vérifier si la réponse a du contenu
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                console.log('Texte de réponse brut:', text);
                
                if (text) {
                    data = JSON.parse(text);
                } else {
                    throw new Error('Réponse vide du serveur');
                }
            } else {
                const text = await response.text();
                console.log('Réponse non-JSON:', text);
                throw new Error(`Réponse inattendue du serveur: ${text}`);
            }

            console.log('Réponse du serveur:', data);

            if (!response.ok) {
                throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
            }

            // Si l'inscription réussit, connecter l'utilisateur
            await register(data.user, data.token);
            navigate('/user-space');
            
        } catch (err) {
            console.error('Erreur complète:', err);
            
            // Messages d'erreur plus explicites
            if (err.message.includes('405')) {
                setError('Erreur: Le serveur ne supporte pas l\'inscription pour le moment. Veuillez réessayer plus tard.');
            } else if (err.message.includes('Failed to fetch')) {
                setError('Erreur de connexion: Impossible de contacter le serveur.');
            } else if (err.message.includes('Unexpected end of JSON input')) {
                setError('Erreur serveur: Réponse invalide. L\'API pourrait ne pas être disponible.');
            } else {
                setError(err.message || 'Erreur inconnue lors de l\'inscription');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Inscription</h2>
            {error && (
                <div className="error-message">
                    <strong>Erreur:</strong> {error}
                    <br />
                    <small>
                        API URL: {process.env.REACT_APP_API_URL || 'Non définie (utilisation de window.location.origin)'}
                    </small>
                </div>
            )}
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
