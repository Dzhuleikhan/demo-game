// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb2/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // dev-only: проксируем Email-Guard (Zeruh) на боевой nginx, чтобы локально
  // работали и сниппет, и проверка. В сборку не попадает.
  // Запуск локально: npm run dev -- --base=/
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
      "/api/phone/check-available": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: true,
      },
      "/api/email/check-available": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
