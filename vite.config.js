// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb/multigeo/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  server: {
    host: true,
    open: true,
    proxy: {
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
      "/api/domain/available": {
        target: "https://goldbet.fun",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
