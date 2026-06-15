// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/ndb/multigeo/zeruh/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  server: {
    host: true,
    open: true,
    // proxy: {
    //   "/email-guard.js": {
    //     target: "https://goldbet.fun",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    //   "/api/email/verify": {
    //     target: "https://goldbet.fun",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});
