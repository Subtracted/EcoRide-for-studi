import React from 'react';
import './CompteSuspendu.css';

const CompteSuspendu = () => {
    return (
        <div className="compte-suspendu">
            <div className="message-container">
                <h2>Compte Suspendu</h2>
                <p>Votre compte a été temporairement suspendu.</p>
                <p>Pour plus d'informations, veuillez contacter l'administration :</p>
                <a href="mailto:admin@ecoride.fr" className="contact-link">
                    admin@ecoride.fr
                </a>
            </div>
        </div>
    );
};

export default CompteSuspendu; 