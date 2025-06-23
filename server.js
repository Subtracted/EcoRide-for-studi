const express = require('express');
const cors = require('cors');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const trajetsRoutes = require('./routes/trajets');
const userRoutes = require('./routes/user');
const reservationsRoutes = require('./routes/reservations');
const vehiculesRoutes = require('./routes/vehicules');
const adminRoutes = require('./routes/admin');
const employeRoutes = require('./routes/employe');
const preferencesRoutes = require('./routes/preferences');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de santé pour Docker health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'EcoRide API',
        version: '1.0.0'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trajets', trajetsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/vehicules', vehiculesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employe', employeRoutes);
app.use('/api/preferences', preferencesRoutes);

// Route de recherche de trajets
app.get('/api/trajets/search', async (req, res) => {
    try {
        const { depart, arrivee, date, prix_max, est_ecologique } = req.query;
        
        let query = `
            SELECT t.*, u.pseudo as conducteur_pseudo, v.modele, v.marque
            FROM trajets t
            JOIN utilisateurs u ON t.conducteur_id = u.id
            JOIN vehicules v ON t.vehicule_id = v.id
            WHERE t.places_restantes > 0
        `;
        
        const params = [];
        
        if (depart) {
            params.push(depart);
            query += ` AND t.depart ILIKE $${params.length}`;
        }
        
        if (arrivee) {
            params.push(arrivee);
            query += ` AND t.arrivee ILIKE $${params.length}`;
        }
        
        if (date) {
            params.push(date);
            query += ` AND DATE(t.date_depart) = $${params.length}`;
        }
        
        if (prix_max) {
            params.push(prix_max);
            query += ` AND t.prix <= $${params.length}`;
        }
        
        if (est_ecologique === 'true') {
            query += ` AND v.est_ecologique = true`;
        }
        
        query += ` ORDER BY t.date_depart ASC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur recherche trajets:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Le port ${PORT} est déjà utilisé. Tentative sur le port ${PORT + 1}...`);
        server.listen(PORT + 1);
    } else {
        console.error('Erreur serveur:', err);
    }
});
