// Add this endpoint to your server to support the webpage_project_info_view

module.exports = function(app, db) {
    // Endpoint for the project info view
    app.get('/api2/webpage_project_info_view', async (req, res) => {
        try {
            const query = 'SELECT * FROM webpage_project_info_view';
            const results = await db.query(query);
            res.json(results);
        } catch (error) {
            console.error('Error querying webpage_project_info_view:', error);
            res.status(500).json({ error: error.message });
        }
    });
};