import { useState } from "react";
import axios from "axios";

function App() {
  const [inputText, setInputText] = useState("");
  const [eventJson, setEventJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleCalLink, setGoogleCalLink] = useState("");

  // if production = true, use the production backend URL
  const API_BASE = import.meta.env.PRODUCTION
    ? import.meta.env.BACKEND_URL
    : "http://127.0.0.1:8000";

  // Convert event text to JSON
  async function handleConvert() {
    // reset state before making the request
    setLoading(true);
    setError("");
    setEventJson(null);
    setGoogleCalLink("");

    try {
      // Sanitize input: convert real newlines to literal "\n" in the string
      const sanitizedText = inputText
        .replace(/\r\n/g, "\n") // Normalize CRLF to LF
        .replace(/\n/g, "\\n") // Escape newlines
        .replace(/"/g, '\\"'); // Escape double quotes inside text

      // creating the http request payload
      // Note: The backend expects a JSON object with a key "event_details"
      const payload = {
        event_details: sanitizedText,
      };

      // debugging
      console.log("Payload being sent:", payload);

      const res = await axios.post(`${API_BASE}/convert/json`, payload);

      setEventJson(res.data);
    } catch (e) {
      setError(
        e.response?.data?.detail || e.message || "Failed to parse event text"
      );
    } finally {
      setLoading(false);
    }
  }

  // Download .ics file
  async function handleDownloadIcs() {
    if (!eventJson) return;

    try {
      const res = await axios.post(`${API_BASE}/convert/isc`, eventJson, {
        responseType: "blob",
      });

      // Extract filename from Content-Disposition header
      const disposition = res.headers["content-disposition"];
      let filename = "event.ics"; // fallback filename

      if (disposition) {
        const filenameMatch = disposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Failed to generate .ics file");
    }
  }

  // Get Google Calendar link
  async function handleGoogleCal() {
    if (!eventJson) return;
    try {
      const res = await axios.post(
        `${API_BASE}/convert/google_calendar`,
        eventJson
      );
      console.log(res);

      if (!res.data.google_calendar_link)
        throw new Error("No Google Calendar link returned");

      setGoogleCalLink(res.data.google_calendar_link);
      window.open(res.data.google_calendar_link, "_blank");
    } catch (e) {
      alert(e.message || "Failed to get Google Calendar link");
    }
  }

  return (
    <div
      style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}
    >
      <h1>text2isc</h1>
      <p>Convert event text into calendar events</p>

      <label htmlFor="eventText">Event Announcement</label>
      <textarea
        id="eventText"
        rows={6}
        style={{ width: "100%", fontSize: "1rem", padding: "0.5rem" }}
        placeholder="Paste your event announcement here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={loading}
      />

      <button
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", fontSize: "1rem" }}
        onClick={handleConvert}
        disabled={loading || inputText.trim() === ""}
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>
      )}

      {eventJson && (
        <>
          <h2 style={{ marginTop: "2rem" }}>Parsed Event JSON</h2>
          <pre
            style={{
              backgroundColor: "#f4f4f4",
              padding: "1rem",
              borderRadius: "4px",
              overflowX: "auto",
            }}
          >
            {JSON.stringify(eventJson, null, 2)}
          </pre>

          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button onClick={handleDownloadIcs}>Download .ics</button>
            <button onClick={handleGoogleCal}>Add to Google Calendar</button>
          </div>

          {googleCalLink && (
            <p style={{ marginTop: "1rem" }}>
              Google Calendar link:{" "}
              <a href={googleCalLink} target="_blank" rel="noreferrer">
                Open Link
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
