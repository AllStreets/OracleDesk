import ReactMarkdown from "react-markdown";

export default function ThesisRenderer({ markdown }) {
  if (!markdown) return (
    <div className="flex flex-col items-center justify-center py-12 text-muted">
      <div className="text-3xl mb-3 opacity-30">◈</div>
      <p className="text-sm">No thesis available yet.</p>
      <p className="text-xs mt-1 opacity-60">Trigger analysis to generate a research thesis.</p>
    </div>
  );

  return (
    <div className="space-y-0 font-sans text-sm leading-relaxed" style={{ color: "#d1d5db" }}>
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="text-white font-semibold text-base mt-6 mb-2 pb-2 border-b border-border first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-accent font-medium text-sm mt-4 mb-1.5">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-secondary leading-relaxed mb-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-semibold">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-3 pl-4">{children}</ul>
          ),
          li: ({ children }) => (
            <li className="text-secondary flex items-start gap-2 before:content-['–'] before:text-muted before:shrink-0">
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent pl-4 my-3 text-muted italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
