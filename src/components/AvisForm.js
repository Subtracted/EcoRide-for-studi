import React, { useState } from 'react';
import './AvisForm.css';

/**
 * Composant de formulaire d'avis
 * Permet aux utilisateurs de donner une note et un commentaire sur un trajet
 * @param {number} reservationId - ID de la réservation concernée
 * @param {function} onSubmit - Callback appelé après soumission réussie
 */
const AvisForm = ({ reservationId, onSubmit, onCancel }) => {
    // État local pour le formulaire
    const [formData, setFormData] = useState({
        note: 5,
        commentaire: ''
    });

    // États pour la gestion des erreurs et succès
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Gère la soumission du formulaire
     * Envoie l'avis au serveur et met à jour l'interface
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    action: 'create_avis',
                    reservationId,
                    note: formData.note,
                    commentaire: formData.commentaire
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            const result = await response.json();
            setSuccess(result.message);
            setFormData({ note: 5, commentaire: '' });
            
            // Appeler le callback après un délai
            setTimeout(() => {
                if (onSubmit) onSubmit();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'envoi de l\'avis');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="avis-form">
            <h3>Donner votre avis sur ce trajet</h3>
            
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
                                disabled={isSubmitting}
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
                        disabled={isSubmitting}
                    />
                </div>

                <div className="buttons">
                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isSubmitting || formData.commentaire.length < 10}
                    >
                        {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
                    </button>
                    
                    {onCancel && (
                        <button 
                            type="button" 
                            className="cancel-button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AvisForm; 
