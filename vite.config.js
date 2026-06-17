// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // DEV ONLY — lets the Email-Guard (Zeruh) snippet + proxy endpoint work on
  // localhost by forwarding to the live nginx. Run: npm run dev -- --base=/
  server: {
    proxy: {
      "/email-guard.js": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: true,
      },
      "/api/email/verify": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
