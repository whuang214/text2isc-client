export default function EventInput({
  inputText,
  setInputText,
  loading,
  onConvert,
}) {
  return (
    <section>
      <label htmlFor="eventText" className="block text-lg font-semibold mb-2">
        Event Announcement
      </label>
      <textarea
        id="eventText"
        rows={6}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        placeholder="Paste your event announcement here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={loading}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        onClick={onConvert}
        disabled={loading || (inputText || "").trim() === ""}
      >
        {loading ? "Converting..." : "Convert"}
      </button>
    </section>
  );
}
