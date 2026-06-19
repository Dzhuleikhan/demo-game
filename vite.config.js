// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb2/5dollars/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // DEV-ONLY: проксируем сниппет email-guard и Zeruh-эндпоинт на боевой nginx,
  // чтобы проверка email работала на localhost. В сборку не попадает.
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
    },
  },
});
