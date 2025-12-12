import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import axios from "axios";
import https from "https";

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to get file extension by MIME type
function getExtension(mimetype) {
  if (!mimetype) return ".bin";
  if (mimetype.startsWith("image/")) return ".png";
  if (mimetype.startsWith("video/")) return ".mp4";
  if (mimetype.startsWith("audio/")) return ".mp3";
  return ".bin";
}

// POST /upload → for website or bot to upload media
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let buffer, ext;

    if (req.file) {
      // File uploaded directly
      buffer = req.file.buffer;
      ext = getExtension(req.file.mimetype);
    } else if (req.query.url) {
      // URL download
      const response = await axios.get(req.query.url, {
        responseType: "arraybuffer",
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: { "User-Agent": "Mozilla/5.0" },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      buffer = Buffer.from(response.data);
      ext = getExtension(response.headers["content-type"]);
    } else {
      return res.status(400).json({ status: false, message: "No file or URL provided" });
    }

    const fileName = `${Date.now()}${ext}`;
    const filePath = path.join("uploads", fileName);
    fs.writeFileSync(filePath, buffer);

    const hostedUrl = `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
    res.json({ status: true, file: fileName, url: hostedUrl });

  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ status: false, message: "Failed to upload file" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Home route
app.get("/", (req, res) => res.send("Media Host API Running ✔️"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
