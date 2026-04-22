import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import { existsSync } from "fs";

function allowPackageJsonPlugin() {
  return {
    name: "allow-package-json",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id.endsWith("/package.json")) {
        const filePath = path.join(__dirname, "node_modules", id);
        if (existsSync(filePath)) {
          return filePath;
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    allowPackageJsonPlugin(),
    react(),
    federation({
      name: "transactions-mfe",
      filename: "remoteEntry.js",
      exposes: {
        "./TransactionsPage": "./src/TransactionsPage.tsx",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "react-router": { singleton: true },
        "@refinedev/core": { singleton: true },
        "@refinedev/react-router": { singleton: true },
        "@refinedev/react-table": { singleton: true },
        "@tanstack/react-table": { singleton: true },
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
