import { useState } from "react";
import axios from "axios";
import "./App.css";

import EventInput from "./components/EventInput";
import EventResult from "./components/EventResult";
import ErrorMessage from "./components/ErrorMessage";

const API_BASE =
  import.meta.env.PRODUCTION && import.meta.env.BACKEND_URL
    ? import.meta.env.BACKEND_URL
    : "http://127.0.0.1:8000";

function App() {
  const [inputText, setInputText] = useState("");
  const [eventJson, setEventJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleCalLink, setGoogleCalLink] = useState("");

  // --- API Calls ---
  async function handleConvert() {
    setLoading(true);
    setError("");
    setEventJson(null);
    setGoogleCalLink("");

    try {
      const payload = { event_details: inputText };
      const res = await axios.post(`${API_BASE}/convert/json`, payload);
      setEventJson(res.data);
    } catch (e) {
      setError(
        e?.response?.data?.detail || e.message || "Failed to parse event text"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadIcs() {
    if (!eventJson) return;
    try {
      const res = await axios.post(`${API_BASE}/convert/isc`, eventJson, {
        responseType: "blob",
      });

      // Get filename from header or default
      const disposition = res.headers["content-disposition"];
      let filename = "event.ics";
      if (disposition) {
        const match = disposition.match(/filename="(.+?)"/);
        if (match) filename = match[1];
      }

      // Create download
      const url = window.URL.createObjectURL(res.data);
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

  async function handleGoogleCal() {
    if (!eventJson) return;
    try {
      const res = await axios.post(
        `${API_BASE}/convert/google_calendar`,
        eventJson
      );
      const link = res.data.google_calendar_link;
      if (!link) throw new Error("No Google Calendar link returned");
      setGoogleCalLink(link);
      window.open(link, "_blank");
    } catch (e) {
      alert(e.message || "Failed to get Google Calendar link");
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-8 font-sans p-4">
      <header>
        <h1 className="text-3xl font-bold mb-2">text2isc</h1>
        <p className="text-gray-700 mb-4">
          Convert event text into calendar events
        </p>
      </header>
      <EventInput
        inputText={inputText || ""}
        setInputText={setInputText}
        loading={loading}
        onConvert={handleConvert}
      />
      <ErrorMessage error={error} />
      <EventResult
        eventJson={eventJson}
        onDownloadIcs={handleDownloadIcs}
        onGoogleCal={handleGoogleCal}
        googleCalLink={googleCalLink}
      />
      <footer className="text-center text-xs text-gray-400 mt-12">
        &copy; {new Date().getFullYear()} text2isc
      </footer>
    </main>
  );
}

export default App;
