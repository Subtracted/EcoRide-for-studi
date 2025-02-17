import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './UserCredits.css';

const UserCredits = () => {
    const { user, updateUser } = useAuth();
    const [showAchat, setShowAchat] = useState(false);
    const [montant, setMontant] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAchatCredits = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/credits/acheter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ montant })
            });

            const data = await response.json();

            if (response.ok) {
                updateUser({ ...user, credits: data.nouveauSolde });
                setSuccess(`Achat réussi ! Nouveau solde : ${data.nouveauSolde} crédits`);
                setShowAchat(false);
            } else {
                setError(data.message || 'Erreur lors de l\'achat');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="credits-container">
            <div className="credits-display">
                <h3>Vos crédits :</h3>
                <div className="credits-amount">
                    <span className="amount">{user?.credits || 0}</span>
                    <span className="label">€</span>
                </div>
            </div>
            <button 
                className="acheter-button"
                onClick={() => setShowAchat(true)}
            >
                +
            </button>

            {showAchat && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Acheter des crédits</h3>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <form onSubmit={handleAchatCredits}>
                            <div className="form-group">
                                <label>Montant (en crédits)</label>
                                <select 
                                    value={montant} 
                                    onChange={(e) => setMontant(Number(e.target.value))}
                                >
                                    <option value="10">10 crédits - 10€</option>
                                    <option value="20">20 crédits - 19€</option>
                                    <option value="50">50 crédits - 45€</option>
                                    <option value="100">100 crédits - 85€</option>
                                </select>
                            </div>

                            <div className="buttons">
                                <button 
                                    type="button" 
                                    className="cancel-button"
                                    onClick={() => setShowAchat(false)}
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit" 
                                    className="confirm-button"
                                    disabled={loading}
                                >
                                    {loading ? 'Traitement...' : 'Confirmer l\'achat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserCredits; 