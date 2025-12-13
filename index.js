import express from "express";
import OpenAI from "openai";

const app = express();

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

// Conversation memory
const conversationHistory = new Map();

// GET endpoint
app.get("/api/zoro", async (req, res) => {
  const { user, message } = req.query;
  if (!message) return res.status(400).json({ error: "Message query parameter required" });

  const uid = user || "anonymous"; // fallback if user not provided
  const conversationKey = uid;

  try {
    // Initialize history if missing
    if (!conversationHistory.has(conversationKey)) {
      conversationHistory.set(conversationKey, []);
    }

    const history = conversationHistory.get(conversationKey);

    // Build prompt
    let prompt = "You are Roronoa Zoro from One Piece. Speak in-character: stoic, serious, sword-focused, sometimes humorous.\n";
    if (history.length > 0) {
      history.forEach((msg, i) => {
        prompt += i % 2 === 0 ? `User: ${msg}\n` : `Zoro: ${msg}\n`;
      });
    }
    prompt += `User: ${message}\nZoro:`;

    // Create client
    const client = new OpenAI({
      apiKey: getRandomKey(),
      baseURL: "https://api.groq.com/openai/v1"
    });

    // Send request (use input as string)
    const response = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: prompt,
      temperature: 0.6,
      max_output_tokens: 150,
      top_p: 0.8
    });

    const reply = response.output_text?.trim() || "Zoro is silent...";

    // Save history
    history.push(message);
    history.push(reply);
    if (history.length > 10) history.splice(0, history.length - 10);

    res.json({ reply });

  } catch (err) {
    console.error("Groq API error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "LLM request failed", details: err.response?.data || err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Zoro AI API running on port ${PORT}`));
