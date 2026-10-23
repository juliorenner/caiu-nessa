import { describe, expect, it } from 'vitest'
import { CHAVE_SOM, definirSom, somLigado } from '@/lib/som-urna'

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
