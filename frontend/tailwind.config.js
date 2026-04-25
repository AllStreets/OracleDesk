export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { mono: ["JetBrains Mono", "monospace"] },
      colors: {
        surface: "#0f1117",
        panel: "#161b27",
        border: "#1e2635",
        accent: "#3b82f6",
        positive: "#22c55e",
        negative: "#ef4444",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
}
