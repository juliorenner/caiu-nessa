import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/font/google', () => {
  const fonte = () => ({ variable: 'font-x' })
  return { Atkinson_Hyperlegible: fonte, Bungee: fonte, Bungee_Shade: fonte }
})
vi.mock('@vercel/analytics/next', () => ({ Analytics: () => <script data-analytics="vercel" /> }))

import RootLayout from '@/app/layout'

describe('RootLayout', () => {
  it('inclui o Vercel Web Analytics depois do conteúdo, dentro do body', () => {
    const html = renderToStaticMarkup(<RootLayout params={Promise.resolve({})}>{<main>conteúdo</main>}</RootLayout>)
    expect(html).toMatch(/<main>conteúdo<\/main><script data-analytics="vercel"><\/script><\/body>/)
    expect(html).toContain('lang="pt-BR"')
  })
})
