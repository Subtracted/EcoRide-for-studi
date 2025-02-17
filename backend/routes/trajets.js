router.get('/search', async (req, res) => {
    try {
        // Requête la plus simple possible
        const result = await pool.query('SELECT * FROM trajets');
        console.log('Nombre de trajets trouvés:', result.rows.length);
        res.json(result.rows);
    } catch (err) {
        console.error('Erreur recherche trajets:', err);
        res.status(500).json({ 
            message: "Erreur serveur", 
            error: err.message 
        });
    }
}); 