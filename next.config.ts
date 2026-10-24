import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite resolve o WASM com new URL(..., import.meta.url); empacotado pelo Turbopack no bundle SSR, o fs recebe
  // um URL de outro realm e falha. Carregado do node_modules, resolve normalmente.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Fora do pacote das funções na Vercel (cada deploy guardado conta no "Function Storage" do plano):
  // o PGlite só serve a DATABASE_URL=file: (desenvolvimento, e2e local com next start, que lê do node_modules);
  // o sharp é a otimização de imagem do next/image, que o site não usa (as imagens de next/og não passam por ele).
  outputFileTracingExcludes: {
    // O link que o Turbopack cria para o pacote externo também sai: sem o destino, ficaria quebrado e a Vercel
    // recusa o deploy ("Resource provisioning failed").
    "*": [
      "node_modules/@electric-sql/pglite/**",
      ".next/node_modules/@electric-sql/**",
      "node_modules/sharp/**",
      "node_modules/@img/**",
    ],
  },
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
