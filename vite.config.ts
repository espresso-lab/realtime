import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "unplugin-dts/vite";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "EspressoRealtime",
      fileName: (format) => `index.${format}.js`,
    },
    rolldownOptions: {
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    react(),
    dts({ tsconfigPath: "./tsconfig.build.json" }),
  ],
});
