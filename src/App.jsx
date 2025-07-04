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

const testEventJson = {
  summary: "Boston Tech Meetup: Summer Networking",
  start: "2025-07-18T18:00:00-04:00",
  end: "2025-07-18T21:30:00-04:00",
  timezone: "America/New_York",
  location: "District Hall Boston, 75 Northern Ave, Boston, MA 02210",
  description:
    'Join local developers, founders, and tech professionals for a fun evening of networking, light snacks, and drinks. Don\'t miss our guest speaker, Sarah Lin, CEO of FutureAI, sharing insights on building products with generative AI.\n\nAgenda:\n- 6:00–6:45pm: Networking & refreshments\n- 6:45–7:30pm: Guest talk – "Building with Generative AI"\n- 7:30–9:30pm: Open mingling',
  organizer_name: "John Smith",
  organizer_email: "john.smith@example.com",
};

function App() {
  const [inputText, setInputText] = useState("");
  const [eventJson, setEventJson] = useState(testEventJson);
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

    if (googleCalLink) {
      // If link is already fetched, just open it
      window.open(googleCalLink, "_blank");
      return;
    }

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
    <main className="max-w-3xl mx-auto mt-8 font-sans p-4">
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-1">text2isc</h1>
        <p className="text-gray-700 text-base mb-4">
          Convert event text into calendar events
        </p>
      </header>

      {/* Inner card container with border */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <EventInput
          inputText={inputText}
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
      </div>

      <footer className="text-center text-xs text-gray-400 mt-12">
        &copy; {new Date().getFullYear()} text2isc
      </footer>
    </main>
  );
}

export default App;
