import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
  return {
    base: "/viewer/",
    build: {
      outDir: "build/viewer",
    },
    server: {
      port: 3000,
    },
    plugins: [
      react(),
      // svgr options: https://react-svgr.com/docs/options/
      // allow SVG files to be imported as React components
      svgr({ svgrOptions: { icon: true } }),
    ],
    define: {
      // Ensures the global variable is defined for libraries that expect it
      global: "globalThis",
    },
    resolve: {
      // Respect the import path aliases set in tsconfig.json
      tsconfigPaths: true,
      alias: {
        // Provides the EventEmitter polyfill for mapbox-gl-geocoder and similar libraries
        events: "events",
      },
    },
  };
});
