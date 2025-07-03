export default function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <p className="text-red-600 mt-4" aria-live="polite">
      Error: {error}
    </p>
  );
}
