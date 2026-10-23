import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { CarimbosDeProgresso } from '@/components/CarimbosDeProgresso'
import { Ficha } from '@/components/Ficha'

afterEach(cleanup)

it('Ficha mostra os dois lados', () => {
  render(<Ficha esquerda="Ficha 01/12" direita="Placar 00" />)
  expect(screen.getByText('Ficha 01/12')).toBeInTheDocument()
  expect(screen.getByText('Placar 00')).toBeInTheDocument()
})

it('Ficha com ícone: o nó fica num span aria-hidden antes do rótulo', () => {
  const { container } = render(<Ficha icone={<svg data-testid="icone" />} esquerda="Ficha 01/12" />)
  const icone = screen.getByTestId('icone')
  const span = icone.parentElement!
  expect(span).toHaveAttribute('aria-hidden')
  expect(span).toHaveClass('hidden', 'min-[360px]:inline-block')
  expect(span.nextElementSibling).toHaveTextContent('Ficha 01/12')
  expect(container.querySelector('[data-ficha]')!.contains(span)).toBe(true)
})

it('Ficha sem ícone não renderiza o span do ícone', () => {
  const { container } = render(<Ficha esquerda="Ficha 01/12" />)
  const ficha = container.querySelector('[data-ficha]')!
  // Só os dois furos e o rótulo.
  expect(ficha.children).toHaveLength(3)
  expect(ficha.querySelector('svg')).toBeNull()
})

it('CarimbosDeProgresso marca pendente, atual, acerto e erro', () => {
  const { container } = render(
    <CarimbosDeProgresso total={6} atual={2} estados={['acerto', 'erro', null, null, null, null]} />,
  )
  const casas = [...container.querySelectorAll('[data-casa]')].map((c) => c.getAttribute('data-casa'))
  expect(casas).toEqual(['acerto', 'erro', 'atual', 'pendente', 'pendente', 'pendente'])
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '6')
})

it('CarimbosDeProgresso: a casa atual difere de um acerto nos dois temas', () => {
  const { container } = render(<CarimbosDeProgresso total={3} atual={1} estados={['acerto', null, null]} />)
  const atual = container.querySelector('[data-casa="atual"]')!
  const acerto = container.querySelector('[data-casa="acerto"]')!
  // Claro: papel com borda grossa × tinta cheia. Escuro: fundo escuro com borda grossa papel × papel cheio.
  expect(atual).toHaveClass('bg-papel', 'dark:bg-fundo-escuro', 'border-[3px]', 'dark:border-papel')
  expect(atual).not.toHaveClass('border-2')
  expect(atual).not.toHaveClass('dark:bg-papel')
  expect(acerto).toHaveClass('bg-tinta', 'dark:bg-papel', 'border-2')
  expect(acerto).not.toHaveClass('border-[3px]')
})
