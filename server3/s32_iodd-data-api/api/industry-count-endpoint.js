const mysql = require('mysql');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'nimdas',
  password: 'FormR!1234',
  database: 'iodd'
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