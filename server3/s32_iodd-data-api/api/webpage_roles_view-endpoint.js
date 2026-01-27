/**
 * webpage_roles_view-endpoint.js
 * Returns roles data from webpage_roles_view
 */

async function webpageRolesViewHandler(req, res) {
    try {
        const db = req.pDB;
        
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }
        
        // Get roles data from roles table instead of view
        const [rows] = await db.execute(
            `SELECT Id, Name FROM ${process.env.DB_NAME}.roles WHERE Active = 'Yes' ORDER BY Name`
        );
        
        return res.json({
            success: true,
            count: rows.length,
            roles: rows
        });
        
    } catch (error) {
        console.error('Webpage roles view error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            error: error.message
        });
    }
}

export default webpageRolesViewHandler;