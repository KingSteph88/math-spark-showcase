import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    preview: {
      host: "0.0.0.0",
      allowedHosts: ["mathea.onrender.com"],
    },
  },

  tanstackStart: {
    server: { entry: "server" },
  },
});