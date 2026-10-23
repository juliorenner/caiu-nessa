import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import manifest from '@/app/manifest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/site'

it('manifesto: nome, cores do papel e ícones 192/512 que existem em public/', () => {
  const m = manifest()
  expect(m.name).toBe('Caiu Nessa?')
  expect(m.display).toBe('standalone')
  expect(m.theme_color).toBe('#fff3dc')
  expect(m.lang).toBe('pt-BR')
  for (const icone of m.icons ?? []) {
    const png = readFileSync(`public${icone.src}`)
    const lado = Number(icone.sizes?.split('x')[0])
    expect(png.readUInt32BE(16)).toBe(lado)
    expect(png.readUInt32BE(20)).toBe(lado)
  }
})

it('robots libera o site, bloqueia a API e o cartão, e aponta o sitemap', () => {
  const r = robots()
  expect(r.rules).toMatchObject({ userAgent: '*', allow: '/', disallow: ['/api/', '/cartao'] })
  expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`)
})

it('sitemap lista as três páginas públicas com URL absoluta', () => {
  const urls = sitemap().map(e => e.url)
  expect(urls).toEqual([`${SITE_URL}/`, `${SITE_URL}/afirmacoes`, `${SITE_URL}/como-escolhemos`])
})
