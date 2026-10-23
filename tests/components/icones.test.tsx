import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Congresso } from '@/components/icones/Congresso'
import { Politico } from '@/components/icones/Politico'
import { Urna } from '@/components/icones/Urna'
import { MarcaDagua } from '@/components/MarcaDagua'

afterEach(cleanup)

describe.each([
  ['Urna', Urna],
  ['Politico', Politico],
  ['Congresso', Congresso],
])('%s', (_nome, Icone) => {
  it('desenha um svg decorativo 64×64 em traço de tinta e aceita className', () => {
    const { container } = render(<Icone className="h-8 w-8" />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveAttribute('focusable', 'false')
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64')
    expect(svg).toHaveAttribute('fill', 'none')
    expect(svg).toHaveAttribute('stroke', 'currentColor')
    expect(svg).toHaveClass('h-8', 'w-8')
    expect(svg.querySelectorAll('path, rect, circle, line, polyline').length).toBeGreaterThanOrEqual(3)
  })
})

describe('MarcaDagua', () => {
  it('rodapé: fixa, centralizada embaixo, não captura toque e fica fora da árvore acessível', () => {
    const { container } = render(
      <MarcaDagua posicao="rodape">
        <Congresso />
      </MarcaDagua>,
    )
    const marca = container.firstElementChild!
    expect(marca).toHaveAttribute('aria-hidden', 'true')
    expect(marca).toHaveClass('pointer-events-none', 'fixed', 'z-0', 'bottom-0', 'left-1/2', '-translate-x-1/2', 'w-[min(90vw,480px)]')
    expect(marca).toHaveClass('text-tinta', 'opacity-[0.07]', 'dark:text-papel', 'dark:opacity-[0.12]')
    expect(marca.querySelector('svg')).not.toBeNull()
  })

  it('canto: fixa no canto inferior direito, 220 px', () => {
    const { container } = render(
      <MarcaDagua posicao="canto">
        <Politico />
      </MarcaDagua>,
    )
    const marca = container.firstElementChild!
    expect(marca).toHaveAttribute('aria-hidden', 'true')
    expect(marca).toHaveClass('pointer-events-none', 'fixed', 'right-2', 'bottom-2', 'w-[220px]')
    expect(marca).not.toHaveClass('left-1/2')
  })
})
