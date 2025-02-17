const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log(`
-- Supprimer l'ancien compte admin
DELETE FROM utilisateurs WHERE email = 'admin@ecoride.fr';

-- Créer le nouveau compte admin
INSERT INTO utilisateurs (
    email,
    mot_de_passe,
    pseudo,
    role,
    credits,
    statut
) VALUES (
    'admin@ecoride.fr',
    '${hash}',
    'admin',
    'admin',
    999,
    'actif'
);
    `);
}

generateHash(); 