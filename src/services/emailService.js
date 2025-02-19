// Version simplifiée du service d'email
export const sendEmail = async (to, subject, content) => {
    console.log('Email simulé:', { to, subject, content });
};

export const sendCancellationEmail = async (email, trajet) => {
    console.log(`Email d'annulation envoyé à ${email} pour le trajet ${trajet.id}`);
};

export const sendValidationEmail = async (email, trajet) => {
    console.log(`Email de validation envoyé à ${email} pour le trajet ${trajet.id}`);
};

export const sendStartTripEmail = async (email, trajet) => {
    console.log(`Email de démarrage envoyé à ${email} pour le trajet ${trajet.id}`);
};

export const testEmail = async () => {
    console.log('Test des emails désactivé temporairement');
}; 