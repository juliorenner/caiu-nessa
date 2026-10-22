import { expect, it } from 'vitest'
import nextConfig from '../next.config'

// Empacotado pelo Turbopack, o PGlite falha na primeira abertura num server component ("path" ... instance of URL).
it('PGlite fica fora do bundle do servidor', () => {
  expect(nextConfig.serverExternalPackages).toContain('@electric-sql/pglite')
})
