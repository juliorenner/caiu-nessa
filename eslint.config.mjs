// typescript-eslint (via eslint-config-next) aceita typescript >=4.8.4 <6.1.0 e não roda com o TS 7. Por isso
// `typescript` aponta para @typescript/typescript6 (API do TS 6) e o TS 7 fica em @typescript/native, que fornece o `tsc`.
// Reverter quando o typescript-eslint suportar o TS 7.
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Prefixo _ marca, por convenção do projeto, variáveis descartadas de propósito (ex.: omitir um campo na desestruturação).
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
    },
  },
  globalIgnores(['.next/**', 'node_modules/**', 'drizzle/**', 'coverage/**', '.superpowers/**', 'next-env.d.ts']),
])
