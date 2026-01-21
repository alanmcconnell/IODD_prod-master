const mysql = require('mysql');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// Create MySQL connection from environment variables
const connection = mysql.createConnection({
  host: process.env.DB_Host,
  port: process.env.DB_Port,
  user: process.env.DB_User,
  password: process.env.DB_Password,
  database: process.env.DB_Database
});

// Handler for industry count endpoint
module.exports = function(app) {
  app.get('/api2/industry-count', (req, res) => {
    const query = "SELECT COUNT(DISTINCT Industry) AS TheCnt FROM projects";
    
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const count = results[0].TheCnt || 0;
      res.json({ count });
    });
  });
};