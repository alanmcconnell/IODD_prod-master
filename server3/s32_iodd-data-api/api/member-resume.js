/**
 * member-resume.js
 * Get comprehensive member information including bio, skills, and projects
 */

async function memberResumeHandler(req, res) {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email parameter is required'
            });
        }

        // Use the database connection passed from the main server
        const pDB = req.pDB;
        if (!pDB) {
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Get member information
        const [memberRows] = await pDB.execute(
            'SELECT MemberNo, TitleName, FirstName, LastName, Email, Company, Address1, Address2, City, State, Zip, Country, Phone1, Phone2, WebSite FROM members WHERE Email = ?',
            [email]
        );

        if (memberRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        // Get member bio
        const [bioRows] = await pDB.execute(
            'SELECT Bio FROM members WHERE Email = ?',
            [email]
        );

        // Get member skills
        const [skillsRows] = await pDB.execute(
            'SELECT Skills FROM members WHERE Email = ?',
            [email]
        );

        //Get project count
        const [projectcount] = await pDB.execute(
            'SELECT Count(projects.Id) as TheCnnt FROM members, projects, members_projects WHERE members.Email = ? AND members.MemberNo = members_projects.MemberNo AND members_projects.ProjectId = projects.Id',
            [email]
        )

        // Get member projects
        const [projectRows] = await pDB.execute(
            'SELECT projects.Name, projects.Client, projects.ClientWeb, projects.ProjectWeb, projects.Location, projects.ProjectType, projects.Industry, projects.Description, members_projects.Role, members_projects.Duration, members_projects.Dates FROM projects, members_projects, members WHERE members.Email = ? AND members.MemberNo = members_projects.MemberNo AND members_projects.ProjectId = projects.Id',
            [email]
        );

        // Helper function to strip HTML/rich text tags
        const stripRichText = (text) => {
            if (!text) return '';
            console.log('Original text:', text);
            
            // Handle different Unicode encoding formats
            let decoded = text
                // Handle \u003C format
                .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
                    return String.fromCharCode(parseInt(code, 16));
                })
                // Handle \u003C without double backslash
                .replace(/\u([0-9a-fA-F]{4})/g, (match, code) => {
                    return String.fromCharCode(parseInt(code, 16));
                });
            
            console.log('After Unicode decode:', decoded);
            
            // Strip HTML tags and entities
            let cleaned = decoded
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\\n/g, ' ')
                .replace(/\n/g, ' ')
                .replace(/\r/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            console.log('Final cleaned text:', cleaned);
            return cleaned;
        };

        // Structure the response
        const response = {
            success: true,
            separator0: 'Version: 1-13-2026',
            memberInfo: memberRows[0],
            separator1: '####################',
            memberBio: stripRichText(bioRows[0]?.Bio || ''),
            separator2: '####################',
            memberSkills: stripRichText(skillsRows[0]?.Skills || ''),
            separator3: '####################',
            memberProjectCount: projectcount[0]?.TheCnnt || 0,
            separator4: '####################',
            memberProjects: projectRows
        };

        // Use custom JSON stringify to prevent Unicode escaping
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('Member resume error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch member resume',
            error: error.message
        });
    }
}

export default memberResumeHandler;