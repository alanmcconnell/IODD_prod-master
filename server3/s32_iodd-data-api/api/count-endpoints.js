// Endpoints for count queries

module.exports = function(app, db) {
  // Industry count endpoint
  app.get('/api2/industry-count', (req, res) => {
    db.query("SELECT COUNT(DISTINCT LCASE(Industry)) AS TheCnt FROM iodd.projects", (err, results) => {
      if (err) {
        console.error('Error executing industry count query:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const count = results[0].TheCnt || 0;
      res.json({ count });
    });
  });
  
  // Member count endpoint
  app.get('/api2/member-count', (req, res) => {
    db.query("SELECT COUNT(DISTINCT ID) AS TheCnt FROM members WHERE Active = 'Y'", (err, results) => {
      if (err) {
        console.error('Error executing member count query:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const count = results[0].TheCnt || 0;
      res.json({ count });
    });
  });
  
  // Project count endpoint
  app.get('/api2/project-count', (req, res) => {
    db.query("SELECT COUNT(DISTINCT ID) AS TheCnt FROM projects", (err, results) => {
      if (err) {
        console.error('Error executing project count query:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      const count = results[0].TheCnt || 0;
      res.json({ count });
    });
  });
  
  // Generic SQL query endpoint
  app.post('/api2/query', (req, res) => {
    if (!req.body || !req.body.query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }
    
    const query = req.body.query;
    console.log('Executing SQL query:', query);
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      res.json(results);
    });
  });
};