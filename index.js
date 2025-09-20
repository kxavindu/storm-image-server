const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");
const nodemailer = require("nodemailer");

const app = express();
const port = process.env.PORT || 3000;

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Nodemailer setup (use Gmail app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Enable CORS so your client can POST images
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// POST /upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Prepare FormData for File.io
    const form = new FormData();
    form.append("file", req.file.buffer, req.file.originalname);

    // Upload to File.io
    const response = await fetch("https://file.io", { method: "POST", body: form });
    const data = await response.json();

    if(data.success){
      // Send email with link
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "New File.io Upload",
        text: `Your file has been uploaded: ${data.link}`
      });

      res.json({ message: "Uploaded and emailed successfully", link: data.link });
    } else {
      res.status(500).json({ error: "File.io upload failed" });
    }
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
