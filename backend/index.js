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
    
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is missing in backend .env');
    }

    const response = await axios.post(`${baseUrl}/chat/completions`, {
      model,
      messages,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    console.error('DeepSeek Proxy Error:', JSON.stringify(errorData, null, 2));
    res.status(error.response?.status || 500).json(errorData);
  }
});

// Proxy DashScope/Bailian TTS (Text-to-Speech) API
app.post('/api/ai/tts', async (req, res) => {
  try {
    const { text, model = 'qwen3-tts-flash' } = req.body;
    const apiKey = process.env.DASHSCOPE_API_KEY?.trim();

    if (!apiKey) {
      throw new Error('DASHSCOPE_API_KEY is missing in backend .env');
    }

    // 按照你提供的代码，使用新加坡地域 (intl) 的地址
    const url = 'https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
    
    console.log(`Calling TTS API (Intl): ${url} with model: ${model}`);
    
    const response = await axios({
      method: 'POST',
      url: url,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: model,
        input: {
          voice: 'Cherry',
          language_type: 'Chinese',
          text: text,
          speed: 1.0,
          pitch: 1.0,
          volume: 1.0,
        },
      },
      timeout: 120000,
    });

    const data = response.data;

    // 直接从 JSON 响应中获取音频 URL
    if (data.output?.audio?.url) {
      const audioUrl = data.output.audio.url;
      console.log(`TTS Success! Audio URL: ${audioUrl}`);
      // 返回 URL 给前端播放
      return res.json({ audioUrl: audioUrl });
    }

    throw new Error('响应中未找到音频 URL: ' + JSON.stringify(data));

  } catch (error) {
    const errorData = error.response?.data || { error: error.message };
    console.error('TTS Proxy Error:', JSON.stringify(errorData, null, 2));
    res.status(error.response?.status || 500).json(errorData);
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
