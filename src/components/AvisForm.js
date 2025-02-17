import React, { useState } from 'react';
import './AvisForm.css';

const AvisForm = ({ reservation, onSubmit, onClose }) => {
    const [note, setNote] = useState(5);
    const [commentaire, setCommentaire] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const requestData = {
                reservation_id: reservation.id,
                note,
                commentaire
            };
            console.log('Données envoyées:', requestData);
            console.log('URL:', `${process.env.REACT_APP_API_URL}/api/avis`);
            console.log('Token:', localStorage.getItem('token'));

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/avis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(requestData)
            });

            console.log('Status de la réponse:', response.status);
            const responseText = await response.text();
            console.log('Réponse brute:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (err) {
                console.error('Erreur parsing JSON:', err);
                throw new Error('Réponse invalide du serveur');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la soumission de l\'avis');
            }

            await onSubmit();
            onClose();
        } catch (err) {
            console.error('Erreur lors de l\'envoi:', err);
            setError(err.message);
        }
    };

    return (
        <div className="avis-form-container">
            <h3>Noter le conducteur</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <label key={value} className={note >= value ? 'active' : ''}>
                            <input
                                type="radio"
                                name="rating"
                                value={value}
                                checked={note === value}
                                onChange={(e) => {
                                    const newNote = Number(e.target.value);
                                    console.log('Nouvelle note:', newNote);
                                    setNote(newNote);
                                }}
                            />
                            ★
                        </label>
                    ))}
                </div>
                <div className="note-text">Note : {note}/5</div>
                <textarea
                    placeholder="Votre commentaire (optionnel)"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                />
                <div className="buttons">
                    <button type="submit" className="submit-button">
                        Envoyer
                    </button>
                    <button type="button" className="cancel-button" onClick={onClose}>
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AvisForm; 