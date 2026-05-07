const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const OpenAI = require('openai');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Chatbot route
app.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exchange rate route
app.get('/exchange-rate', async (req, res) => {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fraud detection route
app.post('/fraud-detection', (req, res) => {
  const { amount, currency, sender, recipient } = req.body;
  const suspicious = amount > 1000;
  res.json({ suspicious, details: suspicious ? 'Amount exceeds threshold' : 'No issues detected' });
});

// Tracking route
app.post('/tracking', (req, res) => {
  const { transactionId, status } = req.body;
  res.json({ message: `Transaction ${transactionId} updated to ${status}` });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});