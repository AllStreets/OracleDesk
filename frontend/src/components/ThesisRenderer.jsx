import ReactMarkdown from "react-markdown";

export default function ThesisRenderer({ markdown }) {
  if (!markdown) return <p className="text-muted text-sm">No thesis available.</p>;
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-h2:text-white prose-h2:text-base prose-h2:font-bold prose-h2:mt-6
      prose-h3:text-accent prose-h3:text-sm prose-h3:font-semibold prose-h3:mt-4
      prose-p:text-gray-300 prose-p:leading-relaxed
      prose-li:text-gray-300 prose-ol:text-gray-300
      prose-strong:text-white">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
