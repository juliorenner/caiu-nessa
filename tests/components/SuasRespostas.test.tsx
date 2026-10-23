import { act, cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SuasRespostas, type RespostaDada } from '@/components/SuasRespostas'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const respostas: RespostaDada[] = [
  { id: 'a1', texto: 'Primeira afirmação.', veredito: 'verdadeiro', casa: 'acerto' },
  { id: 'a2', texto: 'Segunda afirmação.', veredito: 'falso', casa: 'erro' },
  { id: 'a3', texto: 'Terceira afirmação.', veredito: 'enganoso', casa: 'quase' },
]

function renderizar() {
  return render(<SuasRespostas respostas={respostas} acertos={2} total={3} />)
}

it('lista uma linha por resposta, na ordem jogada, com casa, texto e selo', () => {
  const { container } = renderizar()
  expect(container.querySelector('summary')).toHaveTextContent('Suas respostas (2 de 3)')
  const linhas = [...container.querySelectorAll('[data-resposta]')] as HTMLElement[]
  expect(linhas.map(l => within(l).getByText(/afirmação\.$/).textContent)).toEqual([
    'Primeira afirmação.',
    'Segunda afirmação.',
    'Terceira afirmação.',
  ])
  expect(linhas.map(l => l.getAttribute('data-resposta'))).toEqual(['acerto', 'erro', 'quase'])
  expect(linhas.map(l => within(l).getByText(/^(Verdade|Mentira|Enganoso)$/).textContent)).toEqual([
    'Verdade',
    'Mentira',
    'Enganoso',
  ])
  expect(within(linhas[2]).getByText('?')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Como escolhemos' })).toHaveAttribute('href', '/como-escolhemos')
  expect(screen.getByRole('link', { name: 'Todas as afirmações e fontes' })).toHaveAttribute('href', '/afirmacoes')
})

// MediaQueryList falso: guarda os ouvintes de 'change' para o teste disparar.
function telaFalsa(largo: boolean) {
  const ouvintes = new Set<(e: { matches: boolean }) => void>()
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: largo && q === '(min-width: 1024px)',
    media: q,
    addEventListener: (_: string, f: (e: { matches: boolean }) => void) => ouvintes.add(f),
    removeEventListener: (_: string, f: (e: { matches: boolean }) => void) => ouvintes.delete(f),
  }))
  return { ouvintes, mudar: (matches: boolean) => act(() => ouvintes.forEach(f => f({ matches }))) }
}

it('começa fechado quando a tela é estreita (sem matchMedia no jsdom)', () => {
  const { container } = renderizar()
  expect(container.querySelector('details')).not.toHaveAttribute('open')
  // O summary continua clicável em qualquer largura.
  expect(container.querySelector('summary')).not.toHaveClass('lg:pointer-events-none')
})

it('abre ao montar quando a tela é larga', () => {
  telaFalsa(true)
  const { container } = renderizar()
  expect(container.querySelector('details')).toHaveAttribute('open')
})

it('abre quando a janela cresce até lg, e solta o ouvinte ao desmontar', () => {
  const tela = telaFalsa(false)
  const { container, unmount } = renderizar()
  const details = container.querySelector('details')!
  expect(details).not.toHaveAttribute('open')
  tela.mudar(false)
  expect(details).not.toHaveAttribute('open')
  tela.mudar(true)
  expect(details).toHaveAttribute('open')
  unmount()
  expect(tela.ouvintes.size).toBe(0)
})
