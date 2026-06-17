// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb2/10dollars/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // DEV-only: проксируем сниппет и Zeruh-эндпоинт на боевой nginx, чтобы
  // email-guard работал целиком на localhost. В сборку не попадает.
  // Запуск: npm run dev -- --base=/
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
