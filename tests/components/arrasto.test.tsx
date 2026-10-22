import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  direcaoDominante,
  inclinacao,
  opacidadeSelo,
  passouLimiar,
  useArrasto,
} from '@/components/arrasto'
import type { Veredito } from '@/lib/afirmacoes'

describe('direcaoDominante', () => {
  it.each([
    [60, 5, 'direita'],
    [-60, 5, 'esquerda'],
    [5, -60, 'cima'],
    [5, 60, 'baixo'],
    [3, -3, null],
    [40, -45, 'cima'],
  ] as const)('(%i,%i) → %s', (dx, dy, esperado) => expect(direcaoDominante(dx, dy)).toBe(esperado))
})

describe('passouLimiar (cartão 300×400)', () => {
  it('direita além de 35% responde verdadeiro', () => expect(passouLimiar(106, 0, 300, 400)).toBe('verdadeiro'))
  it('direita aquém de 35% não responde', () => expect(passouLimiar(104, 0, 300, 400)).toBeNull())
  it('cima além de 25% responde enganoso', () => expect(passouLimiar(0, -101, 300, 400)).toBe('enganoso'))
  it('baixo nunca responde', () => expect(passouLimiar(0, 300, 300, 400)).toBeNull())
  it('toque sem arrasto não responde', () => expect(passouLimiar(5, 5, 300, 400)).toBeNull())
})

it('inclinacao satura em ±12°', () => {
  expect(inclinacao(1000, 300)).toBe(12)
  expect(inclinacao(-1000, 300)).toBe(-12)
  expect(inclinacao(0, 300)).toBe(0)
})

it('opacidadeSelo é 1 no limiar e 0 parado', () => {
  expect(opacidadeSelo(105, 0, 300, 400)).toBeCloseTo(1)
  expect(opacidadeSelo(0, 0, 300, 400)).toBe(0)
})

function Cartao({ ativo, onResposta }: { ativo: boolean; onResposta: (v: Veredito) => void }) {
  const { handlers, dx, dy, arrastando, selo } = useArrasto({ ativo, onResposta })
  return (
    <div
      data-testid="cartao"
      data-dx={dx}
      data-dy={dy}
      data-arrastando={String(arrastando)}
      data-selo={selo ?? ''}
      {...handlers}
      ref={(el) => {
        if (el) el.getBoundingClientRect = () => ({ width: 300, height: 400, x: 0, y: 0, top: 0, left: 0, right: 300, bottom: 400, toJSON: () => ({}) })
      }}
    />
  )
}

function arrastar(el: HTMLElement, ate: { x: number; y: number }) {
  fireEvent.pointerDown(el, { clientX: 100, clientY: 100, pointerId: 1, button: 0 })
  fireEvent.pointerMove(el, { clientX: 100 + ate.x, clientY: 100 + ate.y, pointerId: 1 })
}

describe('useArrasto', () => {
  it('chama onResposta ao soltar além do limiar', () => {
    const onResposta = vi.fn()
    render(<Cartao ativo onResposta={onResposta} />)
    const cartao = screen.getByTestId('cartao')
    arrastar(cartao, { x: 120, y: 0 })
    expect(cartao).toHaveAttribute('data-dx', '120')
    expect(cartao).toHaveAttribute('data-arrastando', 'true')
    expect(cartao).toHaveAttribute('data-selo', 'verdadeiro')
    fireEvent.pointerUp(cartao, { clientX: 220, clientY: 100, pointerId: 1 })
    expect(onResposta).toHaveBeenCalledWith('verdadeiro')
    expect(cartao).toHaveAttribute('data-dx', '0')
    expect(cartao).toHaveAttribute('data-arrastando', 'false')
  })

  it('não chama onResposta quando ativo=false', () => {
    const onResposta = vi.fn()
    render(<Cartao ativo={false} onResposta={onResposta} />)
    const cartao = screen.getByTestId('cartao')
    arrastar(cartao, { x: 0, y: -150 })
    expect(cartao).toHaveAttribute('data-dy', '0')
    fireEvent.pointerUp(cartao, { clientX: 100, clientY: -50, pointerId: 1 })
    expect(onResposta).not.toHaveBeenCalled()
  })

  it('volta a zero ao soltar aquém do limiar', () => {
    const onResposta = vi.fn()
    render(<Cartao ativo onResposta={onResposta} />)
    const cartao = screen.getByTestId('cartao')
    arrastar(cartao, { x: -50, y: 10 })
    expect(cartao).toHaveAttribute('data-dx', '-50')
    expect(cartao).toHaveAttribute('data-selo', 'falso')
    fireEvent.pointerUp(cartao, { clientX: 50, clientY: 110, pointerId: 1 })
    expect(onResposta).not.toHaveBeenCalled()
    expect(cartao).toHaveAttribute('data-dx', '0')
    expect(cartao).toHaveAttribute('data-dy', '0')
    expect(cartao).toHaveAttribute('data-arrastando', 'false')
  })

  it('pointercancel além do limiar não responde e devolve o cartão ao centro', () => {
    const onResposta = vi.fn()
    render(<Cartao ativo onResposta={onResposta} />)
    const cartao = screen.getByTestId('cartao')
    arrastar(cartao, { x: 150, y: 0 })
    expect(cartao).toHaveAttribute('data-dx', '150')
    fireEvent.pointerCancel(cartao, { pointerId: 1 })
    expect(onResposta).not.toHaveBeenCalled()
    expect(cartao).toHaveAttribute('data-dx', '0')
    expect(cartao).toHaveAttribute('data-dy', '0')
    expect(cartao).toHaveAttribute('data-arrastando', 'false')
    fireEvent.pointerUp(cartao, { clientX: 250, clientY: 100, pointerId: 1 })
    expect(onResposta).not.toHaveBeenCalled()
    expect(cartao).toHaveAttribute('data-dx', '0')
  })

  it('ignora botão secundário e movimento sem arrasto ativo', () => {
    const onResposta = vi.fn()
    render(<Cartao ativo onResposta={onResposta} />)
    const cartao = screen.getByTestId('cartao')
    fireEvent.pointerMove(cartao, { clientX: 300, clientY: 100, pointerId: 1 })
    expect(cartao).toHaveAttribute('data-dx', '0')
    fireEvent.pointerDown(cartao, { clientX: 100, clientY: 100, pointerId: 1, button: 2 })
    fireEvent.pointerMove(cartao, { clientX: 300, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(cartao, { clientX: 300, clientY: 100, pointerId: 1 })
    expect(onResposta).not.toHaveBeenCalled()
  })
})
