import React, { useState } from 'react';
import './Avis.css';
import { useAuth } from '../context/AuthContext';

const Avis = ({ trajetId, chauffeurId }) => {
    const [note, setNote] = useState(5);
    const [commentaire, setCommentaire] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/avis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    trajetId,
                    chauffeurId,
                    note,
                    commentaire,
                    passagerId: user.id,
                    statut: 'en_attente'
                })
            });

            if (response.ok) {
                setSuccess('Votre avis a été soumis et sera visible après validation');
                setCommentaire('');
                setNote(5);
            } else {
                setError('Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion');
        }
    };

    return (
        <div className="avis-container">
            <h3>Laisser un avis</h3>
            <form onSubmit={handleSubmit} className="avis-form">
                <div className="form-group">
                    <label>Note</label>
                    <div className="rating">
                        {[1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={`star ${value <= note ? 'active' : ''}`}
                                onClick={() => setNote(value)}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Commentaire</label>
                    <textarea
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        required
                        placeholder="Partagez votre expérience..."
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" className="submit-button">
                    Envoyer l'avis
                </button>
            </form>
        </div>
    );
};

export default Avis; 