import { expect, it } from 'vitest'
import nextConfig from '../next.config'

// Empacotado pelo Turbopack, o PGlite falha na primeira abertura num server component ("path" ... instance of URL).
it('PGlite fica fora do bundle do servidor', () => {
  expect(nextConfig.serverExternalPackages).toContain('@electric-sql/pglite')
})

it('cabeçalhos de segurança em todas as rotas', async () => {
  const [regra] = await nextConfig.headers!()
  expect(regra!.source).toBe('/(.*)')
  const mapa = Object.fromEntries(regra!.headers.map(h => [h.key, h.value]))
  expect(mapa).toMatchObject({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Frame-Options': 'SAMEORIGIN',
  })
})
