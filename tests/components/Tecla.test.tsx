import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { Tecla } from '@/components/Tecla'

afterEach(cleanup)

it('Tecla: kbd decorativo, escondido abaixo de lg por padrão', () => {
  const { container } = render(<Tecla>Enter</Tecla>)
  const kbd = container.querySelector('kbd')!
  expect(kbd).toHaveTextContent('Enter')
  expect(kbd).toHaveAttribute('aria-hidden', 'true')
  expect(kbd).toHaveClass('hidden', 'lg:inline-flex', 'text-tinta')
})

it('Tecla: cor do veredito e className no lugar da visibilidade padrão', () => {
  const { container } = render(
    <Tecla cor="verdade" className="inline-flex">
      →
    </Tecla>,
  )
  const kbd = container.querySelector('kbd')!
  expect(kbd).toHaveClass('text-verdade', 'inline-flex')
  expect(kbd).not.toHaveClass('hidden')
})
