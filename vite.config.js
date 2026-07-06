import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Bundle everything (JS/CSS/parquet data) into one dist/index.html so it
// can be opened directly via file:// without any HTTP server.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  assetsInclude: ["**/*.parquet"],
  build: {
    assetsInlineLimit: 1024 * 1024, // inline yoyos.parquet (~85KB) as a data: URI
  },
});
