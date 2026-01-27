/**
 * list-members-endpoint.js
 * Lists all active members in the database
 */

async function listMembersHandler(req, res) {
    try {
        const db = req.pDB;
        
        if (!db) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }
        
        // Get all active members
        const [rows] = await db.execute(
            'SELECT MemberNo, FirstName, LastName, Email FROM members WHERE Active = "Y" ORDER BY FirstName, LastName'
        );
        
        const members = rows.map(member => ({
            MemberNo: member.MemberNo,
            fullName: `${member.FirstName} ${member.LastName}`,
            email: member.Email,
            FirstName: member.FirstName,
            LastName: member.LastName
        }));
        
        return res.json({
            success: true,
            count: members.length,
            members: members
        });
        
    } catch (error) {
        console.error('List members error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch members',
            error: error.message
        });
    }
}

export default listMembersHandler;