import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      allowedHosts: ["mathea.onrender.com"],
    },
    preview: {
      allowedHosts: ["mathea.onrender.com"],
    },
  },

  tanstackStart: {
    server: { entry: "server" },
  },
});