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

it('CarimbosDeProgresso marca pendente, atual, acerto e erro', () => {
  const { container } = render(
    <CarimbosDeProgresso total={6} atual={2} estados={['acerto', 'erro', null, null, null, null]} />,
  )
  const casas = [...container.querySelectorAll('[data-casa]')].map((c) => c.getAttribute('data-casa'))
  expect(casas).toEqual(['acerto', 'erro', 'atual', 'pendente', 'pendente', 'pendente'])
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '6')
})
