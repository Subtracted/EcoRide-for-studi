const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'postgres',
    password: 'azepoi87',
    host: 'localhost',
    port: 5432,
    database: 'ecoride'
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erreur de connexion:', err);
    } else {
        console.log('Connexion réussie!');
        console.log('Résultat:', res.rows[0]);
    }
    pool.end();
}); 