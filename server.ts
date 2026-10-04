import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gen AI client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for real ProLnk AI homework assistant
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ fallback: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: question,
      config: {
        systemInstruction: `You are ProLnk AI, an elite 24/7 homework helper and academic tutor.
Explain the student's question step-by-step with clear logic, easy-to-digest notation, and helpful intuition.
Keep your response concise and focused (under 120 words).
ALWAYS conclude your explanation on a new line with an authoritative textbook or curriculum citation strictly formatted as:
Source: [Author/Textbook Title, Edition, Chapter/Section]
Example: Source: OpenStax Calculus Volume 1, Section 3.9`,
        temperature: 0.7,
      }
    });

    const reply = response.text || '';
    return res.json({ reply });
  } catch (error: any) {
    console.error('ProLnk AI API error:', error?.message || error);
    return res.json({ fallback: true });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProLnk server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
