import express from "express";
import OpenAI from "openai";

const app = express();

// All your Groq keys
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

// Store conversation history per user
const conversationHistory = new Map();

// GET endpoint: /api/zoro?user=USER_ID&message=Your+message
app.get("/api/zoro", async (req, res) => {
  const { user, message } = req.query;
  if (!user || !message) return res.status(400).json({ error: "Both 'user' and 'message' are required" });

  const conversationKey = user;

  try {
    // Initialize conversation if it doesn't exist
    if (!conversationHistory.has(conversationKey)) {
      conversationHistory.set(conversationKey, [
        { role: "system", content: "You are Roronoa Zoro from One Piece. Speak stoic, serious, sword-focused, sometimes humorous." }
      ]);
    }

    const history = conversationHistory.get(conversationKey);
    history.push({ role: "user", content: message });

    // Create OpenAI-compatible Groq client
    const client = new OpenAI({
      apiKey: getRandomKey(),
      baseURL: "https://api.groq.com/openai/v1"
    });

    // Send request
    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      messages: history,
      temperature: 0.6,
      max_output_tokens: 150,
      top_p: 0.8
    });

    const reply = response.output_text || "Zoro is silent...";

    history.push({ role: "assistant", content: reply });
    if (history.length > 10) history.splice(1, history.length - 10);

    res.json({ reply });

  } catch (err) {
    console.error("Groq API error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "LLM request failed", details: err.response?.data || err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zoro AI API running on port ${PORT}`));
