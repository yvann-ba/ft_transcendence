import { defineConfig } from "vite";

export default defineConfig({
  root: "public",
  server: {
    port: 8080, 
    strictPort: true,
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
