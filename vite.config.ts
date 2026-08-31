import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("react/")) {
              return "vendor-react";
            }
            if (id.includes("convex")) {
              return "vendor-convex";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("html2canvas") || id.includes("purify")) {
              return "vendor-export";
            }
          }
        },
      },
    },
  },
});
