const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Get messages for a persona
app.get('/api/messages/:personaId', (req, res) => {
  const { personaId } = req.params;
  const sql = 'SELECT * FROM messages WHERE personaId = ? ORDER BY timestamp ASC';
  db.all(sql, [personaId], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ messages: rows });
  });
});

// Save a new message
app.post('/api/messages', (req, res) => {
  const { personaId, sender, content, timestamp, imageUrl } = req.body;
  const id = uuidv4();
  
  const sql = 'INSERT INTO messages (id, personaId, sender, content, timestamp, imageUrl) VALUES (?, ?, ?, ?, ?, ?)';
  const params = [id, personaId, sender, content, timestamp, imageUrl];
  
  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ 
      message: { id, personaId, sender, content, timestamp, imageUrl },
      id: this.lastID 
    });
  });
});

// Clear history for a persona (when user wants to restart)
app.delete('/api/messages/:personaId', (req, res) => {
  const { personaId } = req.params;
  const sql = 'DELETE FROM messages WHERE personaId = ?';
  db.run(sql, [personaId], function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'History cleared', changes: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
