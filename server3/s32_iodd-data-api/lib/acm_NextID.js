/**
 * acm_NextID - Global ID generator function
 * Returns the next unique ID for a record in a table and updates the counter
 * 
 * @param {object} pDB - Shared database connection pool
 * @param {string} tableName - The name of the table to generate ID for
 * @returns {Promise<number>} - The next unique ID number
 * @throws {Error} - If database operation fails
 */
async function acm_NextID(pDB, tableName) {
    try {
        if (!tableName || typeof tableName !== 'string') {
            throw new Error('Table name must be a non-empty string');
        }
        
        const [rows] = await pDB.execute(
            'SELECT next_value FROM acm_nextid WHERE lower(table_name) = lower(?) FOR UPDATE',
            [tableName]
        );
        
        let nextId;
        
        if (rows.length > 0) {
            nextId = rows[0].next_value;
            
            await pDB.execute(
                'UPDATE acm_nextid SET next_value = next_value + 1 WHERE lower(table_name) = lower(?)',
                [tableName]
            );
        } else {
            nextId = 1;
            
            await pDB.execute(
                'INSERT INTO acm_nextid (table_name, next_value) VALUES (?, ?)',
                [tableName, 2]
            );
        }
        
        return nextId;
        
    } catch (error) {
        throw new Error(`acm_NextID function failed: ${error.message}`);
    }
}

export { acm_NextID };