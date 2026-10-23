import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHAVE_SOM, definirSom, somLigado, tocarSomDaUrna } from '@/lib/som-urna'

function armazem(inicial: Record<string, string> = {}): Storage {
  const dados = new Map(Object.entries(inicial))
  return {
    get length() {
      return dados.size
    },
    clear: () => dados.clear(),
    getItem: (k: string) => dados.get(k) ?? null,
    key: (i: number) => [...dados.keys()][i] ?? null,
    removeItem: (k: string) => void dados.delete(k),
    setItem: (k: string, v: string) => void dados.set(k, v),
  }
}

function quebrado(): Storage {
  return {
    ...armazem(),
    getItem: () => {
      throw new Error('bloqueado')
    },
    setItem: () => {
      throw new Error('cheio')
    },
  }
}

describe('somLigado', () => {
  it('sem preferência gravada: ligado', () => {
    expect(somLigado(armazem())).toBe(true)
  })

  it("'desligado' gravado: desligado", () => {
    expect(somLigado(armazem({ [CHAVE_SOM]: 'desligado' }))).toBe(false)
  })

  it('armazém que lança na leitura: ligado', () => {
    expect(somLigado(quebrado())).toBe(true)
  })

  it('sem armazém: ligado', () => {
    expect(somLigado(null)).toBe(true)
  })
})

describe('definirSom', () => {
  it("desligar grava 'desligado'; ligar grava 'ligado'", () => {
    const a = armazem()
    definirSom(false, a)
    expect(a.getItem(CHAVE_SOM)).toBe('desligado')
    definirSom(true, a)
    expect(a.getItem(CHAVE_SOM)).toBe('ligado')
  })

  it('armazém que lança na escrita: não propaga', () => {
    expect(() => definirSom(false, quebrado())).not.toThrow()
    expect(() => definirSom(false, null)).not.toThrow()
  })
})

interface OsciladorFalso {
  type: string
  frequency: { value: number }
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

function contextoFalso() {
  const osciladores: OsciladorFalso[] = []
  const ctx = {
    currentTime: 0,
    destination: {},
    createOscillator: () => {
      const o: OsciladorFalso = { type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
      osciladores.push(o)
      return o
    },
    createGain: () => ({ gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn() }),
    close: vi.fn(),
  }
  return { ctx, osciladores, criar: () => ctx as unknown as AudioContext }
}

describe('tocarSomDaUrna', () => {
  afterEach(() => vi.useRealTimers())

  it('agenda as quatro notas da urna, quadradas, e fecha o contexto depois', () => {
    vi.useFakeTimers()
    const { ctx, osciladores, criar } = contextoFalso()
    tocarSomDaUrna(criar)
    expect(osciladores).toHaveLength(4)
    expect(osciladores.map(o => o.type)).toEqual(['square', 'square', 'square', 'square'])
    expect(osciladores.map(o => o.frequency.value)).toEqual([1046, 1318, 1568, 2093])
    const inicios = [0, 0.12, 0.24, 0.36]
    const duracoes = [0.09, 0.09, 0.09, 0.35]
    osciladores.forEach((o, i) => {
      expect(o.start).toHaveBeenCalledTimes(1)
      expect(o.start.mock.calls[0][0]).toBeCloseTo(inicios[i])
      expect(o.stop.mock.calls[0][0]).toBeCloseTo(inicios[i] + duracoes[i])
    })
    expect(ctx.close).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(ctx.close).toHaveBeenCalledTimes(1)
  })

  it('sem Web Audio (fábrica que lança): não propaga', () => {
    expect(() =>
      tocarSomDaUrna(() => {
        throw new Error('sem AudioContext')
      }),
    ).not.toThrow()
  })
})
