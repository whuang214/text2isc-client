export default function EventResult({
  eventJson,
  onDownloadIcs,
  onGoogleCal,
  googleCalLink,
}) {
  if (!eventJson) return null;
  return (
    <section>
      <h2 className="text-2xl font-semibold mt-8 mb-2">Parsed Event JSON</h2>
      <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(eventJson, null, 2)}
      </pre>
      <div className="flex space-x-4 mt-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={onDownloadIcs}
        >
          Download .ics
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={onGoogleCal}
        >
          Add to Google Calendar
        </button>
      </div>
      {googleCalLink && (
        <p className="mt-4">
          Google Calendar link:{" "}
          <a
            href={googleCalLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            Open Link
          </a>
        </p>
      )}
    </section>
  );
}
