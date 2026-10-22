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
