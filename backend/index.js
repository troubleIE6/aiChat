require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const db = require('./database');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Proxy DeepSeek Chat API
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, model = 'deepseek-chat' } = req.body;
    const response = await axios.post(`${process.env.DEEPSEEK_BASE_URL}/chat/completions`, {
      model,
      messages,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('DeepSeek Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

// Proxy DashScope Image Generation API
app.post('/api/ai/image', async (req, res) => {
  try {
    const { prompt, model = 'wanx-v1' } = req.body;
    const response = await axios.post(`${process.env.DASHSCOPE_BASE_URL}/images/generations`, {
      model,
      prompt,
      n: 1,
      size: '1024*1024'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('DashScope Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
});

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
