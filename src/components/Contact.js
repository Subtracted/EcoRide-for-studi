import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        nom: '',
        email: 'contact@ecoride.fr',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'info', message: 'Envoi en cours...' });

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Message envoyé avec succès !' });
                setFormData({ nom: '', email: '', message: '' });
            } else {
                throw new Error('Erreur lors de l\'envoi');
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Erreur lors de l\'envoi du message' });
        }
    };

    return (
        <div className="contact-container">
            <h2>Contactez-nous</h2>
            
            <div className="contact-info">
                <div className="info-block">
                    <h3>Notre adresse</h3>
                    <p>123 rue de l'Écologie</p>
                    <p>75000 Paris</p>
                </div>
                
                <div className="info-block">
                    <h3>Téléphone</h3>
                    <p>01 23 45 67 89</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input
                        type="text"
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email de destination</label>
                    <input
                        type="email"
                        id="email"
                        value="contact@ecoride.fr"
                        readOnly
                        disabled
                        className="input-disabled"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required
                        rows="5"
                    />
                </div>

                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}

                <button type="submit" className="submit-button">
                    Envoyer
                </button>
            </form>
        </div>
    );
};

export default Contact; 