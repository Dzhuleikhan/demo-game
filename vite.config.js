// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb/multigeo/50/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // Dev only: proxy the Email-Guard snippet + Zeruh endpoint to the live nginx
  // so the full flow (typo + deliverability) works on localhost.
  // Run with: npm run dev -- --base=/
  server: {
    proxy: {
      "/email-guard.js": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
      "/api/email/verify": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
      // Phone-Guard (IPQS) snippet + verify endpoint — proxy to live nginx.
      "/phone-guard.js": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
      "/api/phone/verify": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
      // Availability (занятость) checks — same-origin proxy to live nginx.
      "/api/phone/check-available": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
      "/api/email/check-available": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
      // Ротатор доменов — same-origin proxy to live nginx.
      "/api/domain/available": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
