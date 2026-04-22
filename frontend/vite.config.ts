import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import { existsSync } from "fs";

// Vite respeta el mapa "exports" de los paquetes y bloquea imports de package.json
// si el paquete no los declara explícitamente (ej. @refinedev/*).
// Este plugin intercepta esas resoluciones y las apunta directamente al archivo en disco.
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

const mfeUrl = process.env.VITE_MFE_TRANSACTIONS_URL ?? "http://localhost:3001";

export default defineConfig({
  plugins: [
    allowPackageJsonPlugin(),
    react(),
    federation({
      name: "shell",
      remotes: {
        transactionsMfe: `${mfeUrl}/assets/remoteEntry.js`,
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
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["@refinedev/core"],
  },
  build: {
    target: "esnext",
    minify: false,
  },
});
