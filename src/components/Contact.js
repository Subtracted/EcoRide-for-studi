import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-container">
            <h2>Contactez-nous</h2>
            <div className="contact-content">
                <div className="contact-info">
                    <h3>Nos coordonnées</h3>
                    <p>Email : contact@ecoride.fr</p>
                    <p>Téléphone : 01 23 45 67 89</p>
                    <p>Adresse : 123 rue du Covoiturage, 75000 Paris</p>
                </div>
                
                <div className="contact-form">
                    <h3>Envoyez-nous un message</h3>
                    <form>
                        <div className="form-group">
                            <label>Nom</label>
                            <input type="text" name="nom" required />
                        </div>
                        
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required />
                        </div>
                        
                        <div className="form-group">
                            <label>Message</label>
                            <textarea name="message" rows="5" required></textarea>
                        </div>
                        
                        <button type="submit" className="submit-button">
                            Envoyer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact; 