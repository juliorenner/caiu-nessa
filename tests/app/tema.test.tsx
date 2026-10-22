import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { viewport } from '@/app/layout'
import Landing from '@/app/page'
import { BOTAO_RESPOSTA } from '@/components/rotulos'
import { VEREDITOS } from '@/lib/afirmacoes'

// next/font só funciona no compilador do Next; no teste basta a variável CSS.
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'font-geist-sans' }),
  Geist_Mono: () => ({ variable: 'font-geist-mono' }),
}))

it('declara color-scheme light dark', () => {
  expect(viewport.colorScheme).toBe('light dark')
})

it('landing explica o gesto', () => {
  render(<Landing />)
  expect(
    screen.getByText('Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.'),
  ).toBeInTheDocument()
})

it('botões de resposta têm variante clara e escura', () => {
  for (const v of VEREDITOS) {
    expect(BOTAO_RESPOSTA[v].base).toMatch(/dark:/)
    expect(BOTAO_RESPOSTA[v].destaque).toMatch(/ring-4/)
  }
})
