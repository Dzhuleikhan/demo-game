// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  base: "https://landing-res.b-cdn.net/goldbet/",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
});
