import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function EventResult({
  eventJson,
  onDownloadIcs,
  onGoogleCal,
  googleCalLink,
}) {
  if (!eventJson) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mt-8 mb-2">Parsed Event JSON</h2>
      <div className="bg-gray-100 rounded-md overflow-x-auto">
        <SyntaxHighlighter
          language="json"
          style={coy}
          customStyle={{ margin: 0, padding: "1rem" }}
          showLineNumbers={false}
        >
          {JSON.stringify(eventJson, null, 2)}
        </SyntaxHighlighter>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <button
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={onDownloadIcs}
        >
          Download .ics
        </button>
        <button
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={onGoogleCal}
        >
          Add to Google Calendar
        </button>
      </div>
    </section>
  );
}
