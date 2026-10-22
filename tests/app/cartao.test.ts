// @vitest-environment node
import { mkdirSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { GET } from '@/app/cartao/route'

function pedir(query: string) {
  return GET(new Request(`http://localhost/cartao?${query}`))
}

describe('GET /cartao', () => {
  it('gera PNG 1080×1920 com cache de um dia no navegador e uma semana na CDN', async () => {
    const res = await pedir('a=4&t=12&c=3&f=caiu-feio&g=aeaqeeaeeqea')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400, s-maxage=604800')
    const png = Buffer.from(await res.arrayBuffer())
    expect(png.readUInt32BE(16)).toBe(1080)
    expect(png.readUInt32BE(20)).toBe(1920)
    // Cópia para conferência visual (fora do repositório versionado).
    mkdirSync('.superpowers/sdd/2026-10-22-compartilhar', { recursive: true })
    writeFileSync('.superpowers/sdd/2026-10-22-compartilhar/cartao.png', png)
  })

  it('aceita a rodada de 6 casas', async () => {
    const res = await pedir('t=6&g=aeqaee&a=2&c=1&f=abre-o-olho')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('image/png')
  })

  it('recusa total fora de 6 ou 12', async () => {
    const res = await pedir('a=4&t=7&c=3&f=caiu-feio&g=aeaqeea')
    expect(res.status).toBe(400)
    expect(await res.text()).toBe('Parâmetros inválidos')
  })

  it('recusa grade com contagem de acertos diferente de a', async () => {
    const res = await pedir('a=4&t=12&c=3&f=caiu-feio&g=aaaqeeaeeqea')
    expect(res.status).toBe(400)
  })
})
