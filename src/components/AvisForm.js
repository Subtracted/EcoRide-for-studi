import React, { useState } from 'react';
import './AvisForm.css';

const AvisForm = ({ trajetId, onSubmit }) => {
    const [formData, setFormData] = useState({
        note: 5,
        commentaire: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/avis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    trajetId,
                    ...formData
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            setSuccess('Avis envoyé avec succès ! Il sera visible après validation.');
            setFormData({ note: 5, commentaire: '' });
            if (onSubmit) onSubmit();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'envoi de l\'avis');
        }
    };

    return (
        <div className="avis-form">
            <h3>Donner votre avis</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Note</label>
                    <div className="rating">
                        {[5, 4, 3, 2, 1].map((note) => (
                            <button
                                key={note}
                                type="button"
                                className={`star ${formData.note >= note ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, note })}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Commentaire</label>
                    <textarea
                        value={formData.commentaire}
                        onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                        required
                        minLength={10}
                        placeholder="Partagez votre expérience (minimum 10 caractères)"
                        rows={4}
                    />
                </div>

                <button type="submit" className="submit-button">
                    Envoyer l'avis
                </button>
            </form>
        </div>
    );
};

export default AvisForm; 