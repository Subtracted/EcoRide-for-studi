import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
    try {
        console.log('Tentative d\'envoi d\'email:', { to, subject });
        
        const { data, error } = await resend.emails.send({
            from: 'EcoRide <notification@ecoride.fr>',
            to,
            subject,
            html
        });

        if (error) {
            console.error('Erreur Resend:', error);
            throw new Error(error.message);
        }

        console.log('Email envoyé avec succès:', data);
        return data;
    } catch (err) {
        console.error('Erreur détaillée:', err);
        throw err;
    }
};

// Mise à jour des templates d'email
export const sendCancellationEmail = async (email, trajet) => {
    const content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #34D399; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Trajet Annulé</h1>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
                <p>Bonjour,</p>
                <p>Nous vous informons que votre trajet a été annulé :</p>
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <p><strong>Départ :</strong> ${trajet.depart}</p>
                    <p><strong>Arrivée :</strong> ${trajet.arrivee}</p>
                    <p><strong>Date :</strong> ${new Date(trajet.date_depart).toLocaleString()}</p>
                </div>
                <p>Vos crédits ont été automatiquement remboursés.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #6B7280;">
                © ${new Date().getFullYear()} EcoRide - Tous droits réservés
            </div>
        </div>
    `;

    return sendEmail(email, 'Annulation de votre trajet', content);
};

export const sendValidationEmail = async (email, trajet) => {
    const content = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #34D399; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">Trajet Terminé</h1>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
                <p>Bonjour,</p>
                <p>Votre trajet est maintenant terminé :</p>
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
                    <p><strong>Départ :</strong> ${trajet.depart}</p>
                    <p><strong>Arrivée :</strong> ${trajet.arrivee}</p>
                    <p><strong>Date :</strong> ${new Date(trajet.date_depart).toLocaleString()}</p>
                </div>
                <p>N'oubliez pas de :</p>
                <ul style="list-style-type: none; padding: 0;">
                    <li style="margin: 10px 0;">✓ Valider que le trajet s'est bien passé</li>
                    <li style="margin: 10px 0;">✓ Donner votre avis sur le conducteur</li>
                </ul>
            </div>
            <div style="text-align: center; padding: 20px; color: #6B7280;">
                © ${new Date().getFullYear()} EcoRide - Tous droits réservés
            </div>
        </div>
    `;

    return sendEmail(email, 'Validation de votre trajet', content);
};

// Ajoutons aussi un email pour le démarrage du trajet
export const sendStartTripEmail = (email, trajet) => {
    const content = `
        <p>Bonjour,</p>
        <p>Votre trajet va bientôt commencer :</p>
        <div style="background-color: white; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>Départ :</strong> ${trajet.depart}</p>
            <p><strong>Arrivée :</strong> ${trajet.arrivee}</p>
            <p><strong>Date :</strong> ${new Date(trajet.date_depart).toLocaleString()}</p>
            <p><strong>Conducteur :</strong> ${trajet.conducteur_pseudo}</p>
        </div>
        <p style="color: #4F46E5; font-weight: bold;">
            Bon voyage avec EcoRide !
        </p>
    `;

    return sendEmail(
        email,
        'Votre trajet commence bientôt',
        createHtmlTemplate('Trajet Imminent', content)
    );
};

// Ajouter cette fonction de test
export const testEmail = async () => {
    const trajetTest = {
        depart: 'Paris',
        arrivee: 'Lyon',
        date_depart: new Date(),
        conducteur_pseudo: 'John Doe',
        prix: 15
    };

    try {
        console.log('Test envoi email annulation...');
        await sendCancellationEmail('votre-email@example.com', trajetTest);
        console.log('Email d\'annulation envoyé avec succès');

        console.log('Test envoi email validation...');
        await sendValidationEmail('votre-email@example.com', trajetTest);
        console.log('Email de validation envoyé avec succès');
    } catch (err) {
        console.error('Erreur test email:', err);
    }
}; 