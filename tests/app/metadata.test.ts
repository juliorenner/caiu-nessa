import { expect, it, vi } from 'vitest'
import { metadata } from '@/app/layout'
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
  expect(metadata.openGraph).toMatchObject({
    title: 'Caiu Nessa?',
    description: DESCRICAO,
    url: '/',
    siteName: 'Caiu Nessa?',
    locale: 'pt_BR',
    type: 'website',
  })
  expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Caiu Nessa?', description: DESCRICAO })
})

it('SITE_URL padrão é o domínio final', () => {
  expect(SITE_URL).toBe('https://caiunessa.com.br')
})
