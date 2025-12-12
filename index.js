const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads folder if not exists
if (!fs.existsSync("./uploads")) fs.mkdirSync("./uploads");

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    let prefix = "file";

    if (file.mimetype.startsWith("image")) prefix = "image";
    else if (file.mimetype.startsWith("video")) prefix = "video";
    else if (file.mimetype.startsWith("audio")) prefix = "audio";

    const uniqueName = `${prefix}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

// Allowed media types
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg"
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("File type not supported!"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB max
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// POST /upload endpoint
app.post("/upload", upload.single("media"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileLink = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ link: fileLink });
});

// Simple GET test
app.get("/", (req, res) => res.send("Media host is live!"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
