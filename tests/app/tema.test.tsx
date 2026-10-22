import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { viewport } from '@/app/layout'
import Landing from '@/app/page'
import {
  ARIA_BOTAO_RESPOSTA,
  BOTAO_EM_CARTAO,
  BOTAO_PRIMARIO,
  BOTAO_RESPOSTA,
  ROTULO_BOTAO,
} from '@/components/rotulos'
import { VEREDITOS } from '@/lib/afirmacoes'

// next/font só funciona no compilador do Next; no teste basta a variável CSS.
vi.mock('next/font/google', () => ({
  Bungee: () => ({ variable: 'font-bungee' }),
  Bungee_Shade: () => ({ variable: 'font-bungee-shade' }),
  Atkinson_Hyperlegible: () => ({ variable: 'font-atkinson' }),
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

it('botões de resposta: preenchimento no claro, borda papel no escuro, escolhido afunda', () => {
  for (const v of VEREDITOS) {
    expect(BOTAO_RESPOSTA[v].base).toMatch(/dark:border-papel/)
    expect(BOTAO_RESPOSTA[v].destaque).toMatch(/translate-y-\[5px\]/)
    expect(BOTAO_RESPOSTA[v].destaque).toMatch(/shadow-none/)
    expect(BOTAO_RESPOSTA[v].base).toMatch(/motion-reduce:transition-none/)
  }
})

it('botão no cartão (claro nos dois temas) não tem variante escura', () => {
  expect(BOTAO_EM_CARTAO).not.toMatch(/(^|\s)dark:/)
  expect(BOTAO_EM_CARTAO).toMatch(/focus-visible:outline-tinta/)
  expect(BOTAO_PRIMARIO).toMatch(/dark:bg-papel/)
  expect(BOTAO_PRIMARIO).toMatch(/dark:text-tinta/)
})

it('rótulos dos botões e do carimbo', () => {
  expect(ROTULO_BOTAO).toEqual({ verdadeiro: 'Verdade', falso: 'Mentira', enganoso: 'Cheira mal' })
  expect(ARIA_BOTAO_RESPOSTA.enganoso).toBe('Isso me cheira mal: enganoso')
})

it('landing: título em letreiro, carimbo, botão Começar e dicas', () => {
  render(<Landing />)
  expect(screen.getByRole('heading', { level: 1, name: 'Caiu Nessa?' })).toHaveClass('font-letreiro-sombra')
  expect(screen.getByRole('link', { name: 'Começar' })).toHaveAttribute('href', '/quiz')
  expect(screen.getByText('← Mentira · ↑ Cheira mal · Verdade →')).toBeInTheDocument()
  expect(screen.getByText('Arraste o cartão ou toque')).toBeInTheDocument()
  expect(
    screen.getByText('Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.'),
  ).toHaveClass('sr-only')
})
