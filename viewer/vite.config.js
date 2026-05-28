import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    plugins: [
      react(),
      // svgr options: https://react-svgr.com/docs/options/
      svgr({ svgrOptions: { icon: true } }),
    ],
    define: {
      // This ensures the global variable is defined for libraries that expect it
      global: "globalThis",
    },
    resolve: {
      alias: {
        // This provides the EventEmitter polyfill for mapbox-gl-geocoder and similar libraries
        events: "events",
      },
    },
  };
});
