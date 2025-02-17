require('dotenv').config();
const { testEmail } = require('../src/services/emailService');

// Exécuter le test
testEmail()
    .then(() => {
        console.log('Tests terminés');
        process.exit(0);
    })
    .catch(err => {
        console.error('Erreur:', err);
        process.exit(1);
    }); 