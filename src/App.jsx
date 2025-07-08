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

/*
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
*/

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

      <footer className="text-center text-xs text-gray-400 mt-12 flex justify-center items-center gap-2">
        <a
          href="https://github.com/whuang214/text2isc-client"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600"
          aria-label="GitHub repository"
        >
          {/* GitHub SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 inline-block"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 0C5.372 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.6.11.793-.258.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.73.083-.73 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.807 1.304 3.492.997.107-.776.418-1.305.76-1.606-2.665-.3-5.466-1.334-5.466-5.933 0-1.312.47-2.384 1.236-3.222-.124-.303-.536-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 013.003-.404c1.018.005 2.045.137 3.003.404 2.29-1.553 3.296-1.23 3.296-1.23.655 1.653.243 2.873.12 3.176.77.838 1.235 1.91 1.235 3.222 0 4.61-2.807 5.63-5.48 5.922.43.37.814 1.096.814 2.21v3.28c0 .32.192.694.8.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
        &copy; {new Date().getFullYear()} text2isc
      </footer>
    </main>
  );
}

export default App;
