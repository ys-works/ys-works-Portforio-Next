import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'API server is running', endpoint: '/api/predict' });
});

app.get('/api/models', async (req, res) => {
  const apiKey = process.env.MY_API_KEY;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/predict', async (req, res) => {
  const apiKey = process.env.MY_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not found" });
  }

  try {
    const { prompt } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData?.error?.message || `HTTP ${response.status}`
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
