import express from "express";
import axios from "axios";

const app = express();

const GROQ_API_URL = "https://api.groq.com/v1/generate";

// All Groq API keys
const GROQ_KEYS = [
  "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",
  "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",
  "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",
  "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",
  "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"
];

// Pick a random key
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
        input: `You are Roronoa Zoro from One Piece. Always reply in-character: stoic, serious, sword-focused, sometimes humorous. User says: "${message}"\nZoro:`,
        max_output_tokens: 150,
        temperature: 0.6,
        top_p: 0.8
      },
      {
        headers: {
          "Authorization": `Bearer ${getRandomKey()}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    // Fix: check both output_text and choices array
    let reply = "Zoro is silent...";
    if (response.data) {
      if (response.data.output_text && response.data.output_text.trim().length > 0) {
        reply = response.data.output_text.trim();
      } else if (response.data.choices && response.data.choices[0]?.text) {
        reply = response.data.choices[0].text.trim();
      }
    }

    res.json({ reply });

  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message || error);
    res.status(500).json({ error: "LLM request failed", details: error.response?.data || error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zoro AI API running on port ${PORT}`));
