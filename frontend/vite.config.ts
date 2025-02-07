import { defineConfig } from "vite";

export default defineConfig({
  root: "public", // Définit le dossier où se trouve index.html
  server: {
    port: 8080, // Le frontend tourne sur ce port
    strictPort: true,
    host: "0.0.0.0", // Permet d'exposer le serveur dans Docker
  },
  build: {
    outDir: "dist", // Dossier de build
    emptyOutDir: true,
  },
});
