const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const port = process.env.PORT || 3000;

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Enable CORS so client can access
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// POST /upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    const response = await fetch("https://file.io", {
      method: "POST",
      body: form
    });

    const data = await response.json();

    if (data.success) {
      res.json({ link: data.link });
    } else {
      res.status(500).json({ error: "File.io upload failed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
