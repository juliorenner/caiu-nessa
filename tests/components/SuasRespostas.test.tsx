import { cleanup, render, screen, within } from '@testing-library/react'
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

it('começa fechado quando a tela é estreita (sem matchMedia no jsdom)', () => {
  const { container } = renderizar()
  expect(container.querySelector('details')).not.toHaveAttribute('open')
  expect(container.querySelector('summary')).toHaveClass('lg:pointer-events-none')
})

it('abre depois de montar quando a tela é larga', () => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q === '(min-width: 1024px)', media: q }))
  const { container } = renderizar()
  expect(container.querySelector('details')).toHaveAttribute('open')
})
