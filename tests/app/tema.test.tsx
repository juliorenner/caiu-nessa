import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
import { CHAVE_SOM } from '@/lib/som-urna'

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
  const titulo = screen.getByRole('heading', { level: 1, name: 'Caiu Nessa?' })
  expect(titulo).toHaveClass('font-letreiro-sombra')
  // O carimbo (logo) fica no mesmo quadro do título, decorativo.
  const carimbo = titulo.parentElement!.querySelector('svg')
  expect(carimbo).not.toBeNull()
  expect(carimbo).toHaveAttribute('aria-hidden', 'true')
  expect(screen.getByRole('link', { name: 'Começar' })).toHaveAttribute('href', '/quiz')
  expect(screen.getByText('← Mentira · ↑ Cheira mal · Verdade →')).toBeInTheDocument()
  expect(screen.getByText('Arraste o cartão ou toque')).toBeInTheDocument()
  expect(
    screen.getByText('Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.'),
  ).toHaveClass('sr-only')
})

describe('landing: som da urna', () => {
  let dados: Map<string, string>
  beforeEach(() => {
    dados = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => dados.get(k) ?? null,
      setItem: (k: string, v: string) => void dados.set(k, v),
      removeItem: (k: string) => void dados.delete(k),
      clear: () => dados.clear(),
      key: () => null,
      length: 0,
    })
    return () => vi.unstubAllGlobals()
  })

  it('começa ligado e alterna gravando a preferência', () => {
    render(<Landing />)
    const botao = screen.getByRole('button', { name: 'Som da urna: ligado' })
    expect(botao).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(botao)
    expect(botao).toHaveTextContent('Som da urna: desligado')
    expect(botao).toHaveAttribute('aria-pressed', 'false')
    expect(dados.get(CHAVE_SOM)).toBe('desligado')
  })

  it("com 'desligado' gravado, mostra desligado depois do efeito", async () => {
    dados.set(CHAVE_SOM, 'desligado')
    await act(async () => {
      render(<Landing />)
    })
    const botao = screen.getByRole('button', { name: 'Som da urna: desligado' })
    expect(botao).toHaveAttribute('aria-pressed', 'false')
  })
})

it("landing: Congresso como marca-d'água decorativa, sem toque", () => {
  const { container } = render(<Landing />)
  const fundo = container.querySelector('div.pointer-events-none[aria-hidden="true"]')
  expect(fundo).not.toBeNull()
  expect(fundo!.querySelector('svg')).not.toBeNull()
  expect(screen.getByRole('main')).toHaveClass('relative', 'z-10')
})
