import express from "express";
import axios from "axios";

const app = express();

const GROQ_API_URL = "https://api.groq.com/v1/generate";

// All Groq keys
const GROQ_KEYS = [
  "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",
  "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",
  "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",
  "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",
  "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"
];

// Pick a random key for each request
function getRandomKey() {
  return GROQ_KEYS[Math.floor(Math.random() * GROQ_KEYS.length)];
}

// GET endpoint: /api/zoro?message=your+message
app.get("/api/zoro", async (req, res) => {
  const message = req.query.message;
  if (!message) return res.status(400).json({ error: "Message query parameter required" });

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "groq-llm-large",
        input: `You are Roronoa Zoro from One Piece. Speak in his character: stoic, serious, sword-focused.\nUser: ${message}\nZoro:`,
        max_output_tokens: 150
      },
      {
        headers: {
          "Authorization": `Bearer ${getRandomKey()}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.output_text || response.data.choices?.[0]?.text || "No response";
    res.json({ reply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "LLM request failed" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zoro Groq GET API running on port ${PORT}`));
