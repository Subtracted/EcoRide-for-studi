const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'votre-projet'
});

const sendNotification = async (userId, title, body) => {
    try {
        const user = await getUserToken(userId); // Récupérer le token FCM
        await admin.messaging().send({
            token: user.fcmToken,
            notification: { title, body }
        });
    } catch (err) {
        console.error('Erreur d\'envoi de notification:', err);
    }
}; 