import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le front appelle /api/claude ; en dev, Vite proxifie vers le petit backend Node
// (server/proxy.js) qui détient la clé API et parle à api.anthropic.com.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
