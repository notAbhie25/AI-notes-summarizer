import './App.css';
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [recipients, setRecipients] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSummarize = async () => {
    const data = new FormData();
    if (file) data.append("file", file);
    if (transcript) data.append("transcript", transcript);
    data.append("prompt", prompt || "Summarize succinctly");

    setSummary("Generating summary...");
    try {
      const res = await axios.post("/api/summarize", data);
      setSummary(res.data.summary || "");
    } catch (err) {
      setSummary("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const handleSend = async () => {
    if (!recipients.trim()) {
      setMsg("Please enter at least one recipient email.");
      return;
    }
    setSending(true);
    setMsg("");
    try {
      await axios.post("/api/send-email", {
        summary,
        recipients: recipients.split(",").map(r => r.trim()).filter(Boolean)
      });
      setMsg("Email sent successfully!");
    } catch (err) {
      setMsg("Failed to send email: " + (err.response?.data?.error || err.message));
    }
    setSending(false);
  };

    return (
  <div className="card">
    <h2>AI Meeting Notes Summarizer</h2>
    <label>Upload transcript (txt only):</label><br />
    <input type="file" accept=".txt" onChange={e => setFile(e.target.files[0])} />
    <br /><br />
    <label>Or paste transcript:</label><br />
    <textarea rows={4} style={{ width: "100%" }} value={transcript} onChange={e => setTranscript(e.target.value)} />
    <br /><br />
    <label>Custom prompt:</label><br />
    <input style={{ width: "100%" }} placeholder="e.g. Summarize for execs" value={prompt} onChange={e => setPrompt(e.target.value)} />
    <br /><br />
    <button onClick={handleSummarize}>Generate Summary</button>
    <br /><br />
    <label>Summary (editable):</label><br />
    <textarea rows={6} style={{ width: "100%" }} value={summary} onChange={e => setSummary(e.target.value)} />
    <br /><br />
    <label>Recipient Emails (comma separated):</label><br />
    <input style={{ width: "100%" }} placeholder="email1@example.com, email2@example.com" value={recipients} onChange={e => setRecipients(e.target.value)} />
    <br /><br />
    <button disabled={sending} onClick={handleSend}>Send Email</button>
    <div className="read-the-docs" style={{ marginTop: 10 }}>{msg}</div>
  </div>
);


}

export default App;
