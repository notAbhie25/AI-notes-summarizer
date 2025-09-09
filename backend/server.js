require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Groq = require('groq-sdk');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer();
const PORT = process.env.PORT || 5000;

// Initialize Groq client with API key from env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// --- Summarize Route ---
app.post('/api/summarize', upload.single('file'), async (req, res) => {
  try {
    const { transcript, prompt } = req.body;
    let text = transcript || '';

    if (req.file) {
      text += req.file.buffer.toString('utf-8');
    }

    if (!text) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    // Use a production Groq model
    const summaryResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Or another supported model
      messages: [
        { role: "system", content: prompt || "You are a helpful assistant that summarizes text succinctly." },
        { role: "user", content: text }
      ]
    });

    res.json({ summary: summaryResponse.choices[0].message.content });
  } catch (error) {
    console.error('Summarize Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate summary.' });
  }
});

// --- Email Route ---
app.post('/api/send-email', async (req, res) => {
  try {
    const { summary, recipients } = req.body;

    if (!summary || !recipients || !recipients.length) {
      return res.status(400).json({ error: 'Summary and recipients required.' });
    }

    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(','), // Array to comma-separated string
      subject: 'Meeting Notes Summary',
      text: summary,
    };

    let info = await transporter.sendMail(mailOptions);

    // Log a preview URL for Ethereal (for Gmail, this is undefined)
    if (process.env.EMAIL_HOST.includes('ethereal')) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Preview URL: %s", previewUrl);
    }

    res.json({ message: 'Email sent successfully!', messageId: info.messageId });
  } catch (error) {
    console.error('Send Email Error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
