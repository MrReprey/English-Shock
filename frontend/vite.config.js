import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",
    port: 5173,

    /*
     * Permite acceder utilizando el dominio
     * público asignado por ngrok.
     */
    allowedHosts: true,

    watch: {
      usePolling: true,
      interval: 100,
    },

    /*
     * Una sola dirección pública atenderá
     * React, Laravel y Reverb.
     */
    proxy: {
      "/api": {
        target: "http://backend:8000",
        changeOrigin: true,
      },

      "/storage": {
        target: "http://backend:8000",
        changeOrigin: true,
      },

      "/app": {
        target: "ws://reverb:8080",
        changeOrigin: true,
        ws: true,
      },

      "/apps": {
        target: "http://reverb:8080",
        changeOrigin: true,
      },
    },
  },
});