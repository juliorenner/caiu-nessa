import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite resolve o WASM com new URL(..., import.meta.url); empacotado pelo Turbopack no bundle SSR, o fs recebe
  // um URL de outro realm e falha. Carregado do node_modules, resolve normalmente.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Cabeçalhos de segurança básicos. Sem CSP por enquanto: next/font, next/og e o Turbopack injetam estilos e
  // scripts inline que exigiriam nonces; fica para um ticket próprio.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
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
