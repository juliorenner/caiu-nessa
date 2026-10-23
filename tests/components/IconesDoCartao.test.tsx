import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { escolher, IconesDoCartao, livreParaGrande, MAXIMO, VAGAS, VARIACOES } from '@/components/IconesDoCartao'

afterEach(cleanup)

const extrema = ({ top }: { top: number }): boolean => top < 12 || top > 88

describe('VAGAS', () => {
  it('tem 16 vagas e nenhuma na faixa central do texto', () => {
    expect(VAGAS).toHaveLength(16)
    for (const { left, top } of VAGAS) {
      expect(top < 25 || top > 75 || left < 12 || left > 88).toBe(true)
    }
  })
})

describe('VARIACOES', () => {
  it('tem 12 variações de 6 a 9 itens, vagas distintas e pelo menos 4 vagas extremas', () => {
    expect(VARIACOES).toHaveLength(12)
    for (const { vagas, icones, giros } of VARIACOES) {
      expect(vagas.length).toBeGreaterThanOrEqual(6)
      expect(vagas.length).toBeLessThanOrEqual(9)
      expect(icones).toHaveLength(vagas.length)
      expect(giros).toHaveLength(vagas.length)
      expect(new Set(vagas).size).toBe(vagas.length)
      for (const v of vagas) expect(VAGAS[v]).toBeDefined()
      for (const i of icones) expect(i >= 0 && i < 6).toBe(true)
      for (const g of giros) expect(g >= -8 && g <= 8).toBe(true)
      expect(vagas.filter(v => extrema(VAGAS[v]!)).length).toBeGreaterThanOrEqual(4)
    }
  })
})

describe('escolher', () => {
  it('toda variação tem 3 vagas livres para ícones grandes, inclusive só extremas', () => {
    for (const { vagas } of VARIACOES) {
      const livres = vagas.map(v => VAGAS[v]!).filter(livreParaGrande)
      expect(livres.length).toBeGreaterThanOrEqual(MAXIMO)
      expect(livres.filter(extrema).length).toBeGreaterThanOrEqual(MAXIMO)
    }
    for (let s = 0; s < 12; s++) for (const { vaga } of escolher(s, false)) expect(livreParaGrande(vaga)).toBe(true)
  })

  it('posições variam entre cartões', () => {
    const chaves = new Set(Array.from({ length: 12 }, (_, i) => escolher(i, false).map(({ vaga }) => `${vaga.left},${vaga.top}`).join('|')))
    expect(chaves.size).toBeGreaterThanOrEqual(6)
  })

  it('é determinística e usa a semente em módulo 12', () => {
    const itens = escolher(3, false)
    expect(itens).toHaveLength(MAXIMO)
    expect(itens).toEqual(escolher(15, false))
    expect(itens).toEqual(escolher(-9, false))
    expect(itens).not.toEqual(escolher(4, false))
  })

  it('dá tamanhos de 42 a 60 px e giros de −8° a 8°', () => {
    for (let s = 0; s < 12; s++) {
      for (const { tamanho, giro } of [...escolher(s, false), ...escolher(s, true)]) {
        expect(tamanho >= 42 && tamanho <= 60).toBe(true)
        expect(giro >= -8 && giro <= 8).toBe(true)
      }
    }
  })

  it('com longo dá 3 itens, todos nas vagas extremas', () => {
    for (let s = 0; s < 12; s++) {
      const itens = escolher(s, true)
      expect(itens).toHaveLength(MAXIMO)
      for (const { vaga } of itens) expect(extrema(vaga)).toBe(true)
    }
  })
})

describe('IconesDoCartao', () => {
  it('renderiza um svg por item numa camada decorativa sem toque', () => {
    const { container } = render(<IconesDoCartao semente={3} longo={false} />)
    const camada = container.querySelector('[data-icones-cartao]')!
    expect(camada).toHaveAttribute('aria-hidden', 'true')
    expect(camada).toHaveClass('pointer-events-none', 'absolute', 'inset-0', 'overflow-hidden', 'text-tinta', 'opacity-[0.12]')
    const itens = escolher(3, false)
    expect(camada.querySelectorAll('svg')).toHaveLength(itens.length)
    const spans = camada.querySelectorAll(':scope > span')
    expect(spans).toHaveLength(itens.length)
    spans.forEach((span, i) => {
      const { vaga, giro, tamanho } = itens[i]!
      expect(span).toHaveClass('absolute')
      expect(span).toHaveStyle({ left: `${vaga.left}%`, top: `${vaga.top}%`, transform: `rotate(${giro}deg)` })
      expect(span.querySelector('svg')).toHaveClass(`size-[${tamanho}px]`)
    })
  })

  it('com longo renderiza 3 ícones', () => {
    const { container } = render(<IconesDoCartao semente={7} longo />)
    expect(container.querySelectorAll('[data-icones-cartao] svg')).toHaveLength(MAXIMO)
  })

  it('duas renders com a mesma semente são idênticas', () => {
    const a = render(<IconesDoCartao semente={5} longo={false} />).container.innerHTML
    cleanup()
    const b = render(<IconesDoCartao semente={5} longo={false} />).container.innerHTML
    expect(a).toBe(b)
  })
})
