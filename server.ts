import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware for parsing JSON with high limit for base64 camera images
app.use(express.json({ limit: '25mb' }));

// Helper to initialize GoogleGenAI
function getGenAIClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & config status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    model: 'gemini-2.5-flash',
  });
});

// Homework scanning endpoint
app.post('/api/scan-homework', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', currentLang = 'es-ES' } = req.body;
    const customApiKey = req.headers['x-gemini-api-key'] as string | undefined;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Ingen bilddata mottogs.' });
    }

    const ai = getGenAIClient(customApiKey);
    if (!ai) {
      return res.status(500).json({
        error: 'Ingen Gemini API-nyckel konfigurerad. Lägg till GEMINI_API_KEY i inställningarna eller servermiljön.',
      });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `
Du är en pedagogisk assistent för Melker, en 12-årig svensk elev i mellanstadiet.
Analysera denna bild av en läxa/gloslista och extrahera glosorna.

Instruktioner:
1. Identifiera målspråket för glosorna:
   - Om orden är på spanska (eller spanska/svenska ordpar), sätt detectedLang till "es-ES".
   - Om orden är på engelska (eller engelska/svenska ordpar), sätt detectedLang till "en-GB".
   - Nuvarande aktivt språk i appen är ${currentLang === 'es-ES' ? 'Spanska (es-ES)' : 'Engelska (en-GB)'}.

2. Extrahera alla ordpar:
   - "sv": Det svenska ordet eller frasen.
   - "target": Ordet/frasen på målspråket. Inkludera spansk/engelsk artikel om det står på läxan (t.ex. "el fútbol", "la manzana", "the cat", "to run"). Rätta eventuella uppenbara skrivfel om det är handskrivet.
   - "example": Skriv en kort, enkel, rolig och peppig exempelmening på MÅLSPRÅKET (anpassad för en 12-åring).
   - "mastered": false.

3. Ignorera allmänna rubriker som "Kapitel 4", "Läxa till torsdag", namn, datum eller instruktionstext, såvida de inte är faktiska glosor.
Om bilden inte innehåller några identifierbara glosor, returnera en tom lista i "words".
`;

    // Attempt model calls with gemini-2.5-flash, fallback to gemini-flash-latest or gemini-3.8-flash if needed
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let lastError: any = null;
    let responseText: string | undefined;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: promptText,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedLang: {
                  type: Type.STRING,
                  enum: ['es-ES', 'en-GB'],
                  description: 'Detekterat språk: "es-ES" för spanska, "en-GB" för engelska',
                },
                words: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      sv: { type: Type.STRING, description: 'Svenskt ord eller uttryck' },
                      target: { type: Type.STRING, description: 'Ordet på målspråket (spanska eller engelska)' },
                      example: { type: Type.STRING, description: 'Enkel exempelmening på målspråket' },
                      mastered: { type: Type.BOOLEAN, description: 'Alltid false initially' },
                    },
                    required: ['sv', 'target', 'example', 'mastered'],
                  },
                },
              },
              required: ['detectedLang', 'words'],
            },
          },
        });

        responseText = response.text;
        if (responseText) {
          break; // Success
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next fallback...`, err.message || err);
      }
    }

    if (!responseText) {
      throw lastError || new Error('Inget svar från AI-modellen.');
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error scanning homework:', error);
    return res.status(500).json({
      error: error.message || 'Kunde inte analysera bilden. Kontrollera att bilden är tydlig och försök igen.',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Melkers Glos-Coach server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
