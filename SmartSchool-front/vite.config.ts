import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8083, // ← tu as dit que ton front tourne sur 8083
    proxy: {
      // TOUTES les requêtes qui commencent par /api seront redirigées vers ton backend
      "/api": {
        target: "http://localhost:3000",  // ← ton backend Node.js
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''), // au cas où ton backend attend sans /api
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
