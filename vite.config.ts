import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 8000,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
