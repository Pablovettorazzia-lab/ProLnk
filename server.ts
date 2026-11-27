import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { Part } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// Initialize Google Gen AI client lazily on the server side
function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const LITE_FALLBACK_MODEL = 'gemini-3.1-flash-lite';

const ALLOWED_DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

interface UploadedDocumentInput {
  name: string;
  mimeType: string;
  base64Data: string;
}

interface VerifiedSource {
  title: string;
  uri?: string;
  type: 'web' | 'document' | 'textbook';
}

function sanitizeDocuments(rawDocs: unknown): UploadedDocumentInput[] {
  if (!Array.isArray(rawDocs)) return [];
  const valid: UploadedDocumentInput[] = [];
  for (const item of rawDocs.slice(0, 3)) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as any).name === 'string' &&
      typeof (item as any).mimeType === 'string' &&
      typeof (item as any).base64Data === 'string' &&
      ALLOWED_DOCUMENT_MIME_TYPES.has((item as any).mimeType) &&
      (item as any).base64Data.length > 0 &&
      (item as any).base64Data.length <= 12 * 1024 * 1024
    ) {
      valid.push({
        name: (item as any).name.slice(0, 140),
        mimeType: (item as any).mimeType,
        base64Data: (item as any).base64Data,
      });
    }
  }
  return valid;
}

function extractVerifiedSources(
  response: any,
  attachedDocs: UploadedDocumentInput[]
): { sources: VerifiedSource[]; searchQueries: string[] } {
  const sources: VerifiedSource[] = [];
  const seenUris = new Set<string>();

  for (const doc of attachedDocs) {
    sources.push({
      title: `Uploaded: ${doc.name}`,
      type: 'document',
    });
  }

  const groundingMetadata = response?.candidates?.[0]?.groundingMetadata;
  const chunks = groundingMetadata?.groundingChunks;
  if (Array.isArray(chunks)) {
    for (const chunk of chunks) {
      const uri = chunk?.web?.uri;
      if (typeof uri === 'string' && uri.startsWith('http') && !seenUris.has(uri)) {
        seenUris.add(uri);
        let fallbackHost = uri;
        try {
          fallbackHost = new URL(uri).hostname.replace(/^www\./, '');
        } catch {
          // keep uri
        }
        const title =
          typeof chunk.web.title === 'string' && chunk.web.title.trim()
            ? chunk.web.title.trim()
            : fallbackHost;
        sources.push({
          title,
          uri,
          type: 'web',
        });
      }
    }
  }

  const searchQueries = Array.isArray(groundingMetadata?.webSearchQueries)
    ? groundingMetadata.webSearchQueries.filter(
        (q: unknown): q is string => typeof q === 'string' && q.trim().length > 0
      )
    : [];

  return { sources, searchQueries };
}

function getErrorStatus(err: any): number {
  if (typeof err?.status === 'number') return err.status;
  if (typeof err?.code === 'number') return err.code;
  const msg = String(err?.message || '');
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) return 429;
  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) return 403;
  if (msg.includes('400') || msg.includes('API_KEY_INVALID')) return 400;
  return 502;
}

function formatFriendlyGeminiError(err: any): { status: number; message: string } {
  const status = getErrorStatus(err);
  if (status === 429) {
    return {
      status: 429,
      message:
        'Gemini API quota or rate limit exceeded (429). Please wait a moment and try again, or select a billing-enabled API key in Settings > Secrets.',
    };
  }
  if (status === 403 || status === 400) {
    return {
      status,
      message:
        'Gemini API key permission or configuration issue. Please verify your API key in Settings > Secrets.',
    };
  }
  return {
    status: 502,
    message: 'Unable to reach ProLnk AI right now. Please try again in a moment.',
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetryAndGrounding(params: {
  contents: any;
  systemInstruction: string;
  useWebSearch: boolean;
}) {
  const ai = getAiClient();
  const { contents, systemInstruction, useWebSearch } = params;

  // Attempt 1: Primary model (gemini-4-hydrogen, LOW thinking to preserve quota) + optional Google Search Grounding
  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        ...(useWebSearch ? { tools: [{ googleSearch: {} }] } : {}),
      },
    });
    return { response, usedWebSearch: useWebSearch, webGroundingSkipped: false };
  } catch (err1: any) {
    if (getErrorStatus(err1) !== 429) {
      throw err1;
    }

    // Backoff before retrying without Google Search grounding (Search tool often has tighter free-tier quota)
    await delay(900);

    if (useWebSearch) {
      try {
        const response = await ai.models.generateContent({
          model: PRIMARY_MODEL,
          contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });
        return { response, usedWebSearch: false, webGroundingSkipped: true };
      } catch (err2: any) {
        if (getErrorStatus(err2) !== 429) {
          throw err2;
        }
      }
    }

    // Backoff and try lightweight Flash Lite model
    await delay(1200);
    const response = await ai.models.generateContent({
      model: LITE_FALLBACK_MODEL,
      contents,
      config: {
        systemInstruction,
      },
    });
    return { response, usedWebSearch: false, webGroundingSkipped: useWebSearch };
  }
}

// Single-turn grounded academic question endpoint
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, documents, groundingMode } = req.body || {};
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini AI is not configured on this server. Please check Settings > Secrets.',
      });
    }

    const attachedDocs = sanitizeDocuments(documents);
    const useWebSearch = groundingMode !== 'document';

    const userParts: Part[] = [];
    for (const doc of attachedDocs) {
      userParts.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: doc.base64Data,
        },
      });
    }

    const docContextPrefix =
      attachedDocs.length > 0
        ? `Attached study files (${attachedDocs.map((d) => d.name).join(', ')}). Cite specific section titles, headings, or page numbers directly visible in these files.\n\n`
        : '';

    userParts.push({ text: `${docContextPrefix}${question.trim()}` });

    const { response, usedWebSearch, webGroundingSkipped } = await generateWithRetryAndGrounding({
      contents: [{ role: 'user', parts: userParts }],
      useWebSearch,
      systemInstruction: `You are ProLnk AI, a 24/7 academic homework helper and university tutor.
Explain the student's question step-by-step with clear logic, mathematical notation, and intuition.
Always reply in the EXACT SAME LANGUAGE as the student's prompt (e.g., Spanish if the user asks in Spanish, English if in English).
Keep your response focused and well-structured (under 180 words unless solving a multi-part problem).
CRITICAL VERIFICATION RULES:
- NEVER invent, guess, or fabricate textbook editions, chapter numbers, page numbers, or URLs from memory.
- If the student uploaded study files, ground your answer in those files and explicitly cite the exact file name and visible section/page you read.
- Do NOT manually append a fake "Source:" line at the end because verified source links are rendered automatically by the app.`,
    });

    const reply = response.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Empty response received from Gemini.' });
    }

    const { sources, searchQueries } = extractVerifiedSources(response, attachedDocs);
    const resolvedMode =
      attachedDocs.length > 0 && usedWebSearch
        ? 'hybrid'
        : attachedDocs.length > 0
        ? 'document'
        : usedWebSearch
        ? 'web'
        : 'standard';

    return res.json({
      reply,
      sources,
      searchQueries,
      mode: resolvedMode,
      webGroundingSkipped,
    });
  } catch (error: any) {
    const formatted = formatFriendlyGeminiError(error);
    console.warn(`ProLnk AI /api/ai/ask (${formatted.status}):`, error?.message || error);
    return res.status(formatted.status).json({
      error: formatted.message,
    });
  }
});

// Multi-turn grounded ProLnk AI tutor & study assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], documents, groundingMode = 'hybrid', userContext } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini AI is not configured on this server. Please check Settings > Secrets.',
      });
    }

    const attachedDocs = sanitizeDocuments(documents);
    const useWebSearch = groundingMode !== 'document';
    const explanationStyle = userContext?.explanationStyle === 'quick' ? 'quick' : 'detailed';
    const styleDirective =
      explanationStyle === 'quick'
        ? 'STUDENT PREFERENCE: Direct & Concise mode — prioritize the final answer and brief key reduction steps (under 110 words).'
        : 'STUDENT PREFERENCE: Step-by-Step Detailed mode — explain underlying theorems, every algebraic step, and intuition clearly (under 180 words unless solving complex multi-step math).';

    const systemInstruction = `You are ProLnk AI, an elite 24/7 academic tutor and intelligent assistant for the ProLnk education platform.
You assist university and high school students with homework, exam prep, uploaded study notes/PDFs, and navigating ProLnk.
${styleDirective}

KNOWLEDGE OF PROLNK PLATFORM FEATURES:
1. 1-on-1 Human Tutoring: Verified tutors from top universities. Tutors include:
   - Daniela Ríos: Calculus, Differential Equations & Physics (Q135/hr)
   - Gabriel Castillo: Linear Algebra, Algorithms & Python/C++ (Q125/hr)
   - Sofia Chang: Organic Chemistry & Biochemistry (Q120/hr)
   - Lucas Méndez: Probability & Microeconomics (Q130/hr)
   - Urgent Matching: connect with a tutor in ~15 minutes for a +Q25 upgrade.
2. 3-Day Free Trial: Full access to 24/7 verified AI tutoring and 1 free community question.
3. Pricing Plans:
   - Starter Plan (Q120/mo): 1 hour of 1-on-1 tutoring + 50 AI questions/mo.
   - Plus Plan (Q240/mo): 3 hours of 1-on-1 tutoring + unlimited AI questions + session whiteboard notes.
   - Unlimited STEM Plan (Q450/mo): 6 hours of 1-on-1 tutoring + urgent priority matching + unlimited AI questions.
4. Community Homework Board & Student Portal: Tracks study streak, XP progress, sessions, whiteboard notes, and uploaded study documents.

VERIFICATION & CITATION RULES (CRITICAL):
- Always reply in the EXACT SAME LANGUAGE as the user (Spanish if Spanish, English if English).
- NEVER invent or fabricate textbook editions, chapter numbers, page numbers, or URLs from memory.
- If the user attached study documents (PDF, TXT, MD, or homework images), read them carefully and cite exact headings, quotes, or page numbers directly observed in the attached files (e.g., "From your file Calculus_Notes.pdf, p. 3...").
- If answering using Document-Only mode and the answer is not inside the attached document, clearly tell the student it wasn't found in their uploaded file rather than guessing.
- Do NOT manually write a fake "Source:" footer line—the UI automatically displays clickable verified source links when available.
- For ProLnk platform inquiries, you may append ONE action tag at the very end when helpful:
  - [ACTION:book_expert]
  - [ACTION:start_trial]
  - [ACTION:view_pricing]
  - [ACTION:ask_community]`;

    const contents: Array<{ role: 'user' | 'model'; parts: Part[] }> = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-10)) {
        if (turn && typeof turn.text === 'string' && turn.text.trim()) {
          contents.push({
            role: turn.role === 'model' || turn.role === 'ai' ? 'model' : 'user',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    const currentUserParts: Part[] = [];
    for (const doc of attachedDocs) {
      currentUserParts.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: doc.base64Data,
        },
      });
    }

    const docHeader =
      attachedDocs.length > 0
        ? `[Attached study materials: ${attachedDocs.map((d) => d.name).join(', ')}]\n`
        : '';

    currentUserParts.push({
      text: `${docHeader}${message.trim()}`,
    });

    contents.push({
      role: 'user',
      parts: currentUserParts,
    });

    const { response, usedWebSearch, webGroundingSkipped } = await generateWithRetryAndGrounding({
      contents,
      systemInstruction,
      useWebSearch,
    });

    const reply = response.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Empty response received from Gemini.' });
    }

    const { sources, searchQueries } = extractVerifiedSources(response, attachedDocs);
    const resolvedMode =
      attachedDocs.length > 0 && usedWebSearch
        ? 'hybrid'
        : attachedDocs.length > 0
        ? 'document'
        : usedWebSearch
        ? 'web'
        : 'standard';

    return res.json({
      reply,
      sources,
      searchQueries,
      mode: resolvedMode,
      webGroundingSkipped,
    });
  } catch (error: any) {
    const formatted = formatFriendlyGeminiError(error);
    console.warn(`ProLnk AI /api/ai/chat (${formatted.status}):`, error?.message || error);
    return res.status(formatted.status).json({
      error: formatted.message,
    });
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
