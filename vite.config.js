// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // Dev-only proxy so the email-guard snippet + Zeruh endpoint (served from the
  // landing domain root in prod) resolve while running `npm run dev`.
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
