import { afterEach, expect, it, vi } from 'vitest'
import { metadata } from '@/app/layout'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { DESCRICAO, SITE_URL } from '@/lib/site'

// next/font só funciona no compilador do Next; no teste basta a variável CSS.
vi.mock('next/font/google', () => ({
  Bungee: () => ({ variable: 'font-bungee' }),
  Bungee_Shade: () => ({ variable: 'font-bungee-shade' }),
  Atkinson_Hyperlegible: () => ({ variable: 'font-atkinson' }),
}))

it('metadata tem OG e Twitter com base absoluta', () => {
  expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
  expect(metadata.description).toBe(DESCRICAO)
  expect(DESCRICAO).toBe(
    `${TOTAL_AFIRMACOES} afirmações da eleição. Verdade, mentira ou cheira mal? Descubra em quantas você caiu.`,
  )
  expect(metadata.openGraph).toMatchObject({
    title: 'Caiu Nessa?',
    description: DESCRICAO,
    siteName: 'Caiu Nessa?',
    locale: 'pt_BR',
    type: 'website',
  })
  expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Caiu Nessa?', description: DESCRICAO })
})

// SITE_URL é lido ao importar o módulo: cada caso reimporta com o ambiente controlado.
const original = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = original
  vi.resetModules()
})

it('SITE_URL padrão é o domínio final', async () => {
  delete process.env.NEXT_PUBLIC_SITE_URL
  vi.resetModules()
  const { SITE_URL: padrao } = await import('@/lib/site')
  expect(padrao).toBe('https://caiunessa.com.br')
})

it('SITE_URL respeita NEXT_PUBLIC_SITE_URL', async () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example'
  vi.resetModules()
  const { SITE_URL: sobrescrito } = await import('@/lib/site')
  expect(sobrescrito).toBe('https://preview.example')
})
