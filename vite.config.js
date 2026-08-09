// vite.config.js
import { defineConfig } from "vite";

const DEV_PROXY_TARGET = "https://goldbet.fun";

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
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/email/verify": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      // Проверка занятости (NestJS-прокси отдаёт 201 — ориентируемся на тело).
      "/api/phone/check-available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/email/check-available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      // IPQS phone-guard: сниппет + прокси проверки реальности/живости номера.
      "/phone-guard.js": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      "/api/phone/verify": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
      },
      // Ротатор домена: стабильный алиас в nginx-include.
      "/api/domain/available": {
        target: DEV_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
