import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite resolve o WASM com new URL(..., import.meta.url); empacotado pelo Turbopack no bundle SSR, o fs recebe
  // um URL de outro realm e falha. Carregado do node_modules, resolve normalmente.
  serverExternalPackages: ["@electric-sql/pglite"],
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
