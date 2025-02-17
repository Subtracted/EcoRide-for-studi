const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const trajetsRoutes = require('./routes/trajets');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());
app.use(express.json());

// Test de connexion à la base de données au démarrage
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err);
    } else {
        console.log('✅ Connexion à la base de données réussie');
    }
});

// Route de test simple
app.get('/api/test', (req, res) => {
    res.json({ message: 'API fonctionne' });
});

// Route de test pour la table trajets
app.get('/api/trajets/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM trajets');
        res.json({ count: result.rows[0].count });
    } catch (err) {
        console.error('Erreur test trajets:', err);
        res.status(500).json({ error: err.message });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/trajets', trajetsRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});