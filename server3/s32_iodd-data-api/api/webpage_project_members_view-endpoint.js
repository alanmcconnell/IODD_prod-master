// Add this endpoint to your server to support the webpage_project_members_view

module.exports = function(app, db) {
    // Endpoint for the project members view
    app.get('/api2/webpage_project_members_view', async (req, res) => {
        try {
            // Get ProjectID from query parameters
            const projectId = req.query.ProjectID;
            
            // Build the SQL query
            let query = 'SELECT * FROM webpage_project_members_view';
            let params = [];
            
            // Add WHERE clause if ProjectID is provided
            if (projectId) {
                query += ' WHERE ProjectID = ?';
                params.push(projectId);
            }
            
            // Execute the query
            const results = await db.query(query, params);
            res.json(results);
        } catch (error) {
            console.error('Error querying webpage_project_members_view:', error);
            res.status(500).json({ error: error.message });
        }
    });
};