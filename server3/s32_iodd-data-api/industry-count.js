const mysql = require('mysql');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'nimdas',
  password: 'FromR!1234',
  database: 'iodd'
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Handler for industry count endpoint
exports.getIndustryCount = (req, res) => {
  const query = "SELECT COUNT(DISTINCT Industry) AS TheCnt FROM projects";
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const count = results[0].TheCnt || 0;
    res.json({ count });
  });
};