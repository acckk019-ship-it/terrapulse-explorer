import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily or safely
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API endpoint for Earth Science / Geography Q&A
app.post("/api/ask-earth", async (req, res) => {
  try {
    const { query } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        answer: "Please configure your GEMINI_API_KEY in Settings > Secrets to unlock live AI Earth Science answers! Earth is our 4.5 billion year old home, featuring 7 continents and 5 oceans."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `You are TerraPulse AI, a world-class planetary scientist and geographer. Answer the user's question about Earth, geography, climate, or locations with captivating scientific precision, yet accessible and exciting language. Keep it under 150 words.\n\nUser Question: ${query}`,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Ask Earth Error:", error);
    res.status(500).json({ error: "Failed to answer question" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TerraPulse Server running on http://localhost:${PORT}`);
  });
}

startServer();
