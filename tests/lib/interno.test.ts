import { describe, expect, it } from 'vitest'
import { CHAVE_INTERNO, jogadorInterno, lerMarcaDaUrl } from '@/lib/interno'

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

describe('jogador interno', () => {
  it('ninguém é interno sem a marca, sem armazém ou com armazém quebrado', () => {
    expect(jogadorInterno(armazem())).toBe(false)
    expect(jogadorInterno(null)).toBe(false)
    expect(jogadorInterno(quebrado())).toBe(false)
  })

  it('?interno=1 liga, ?interno=0 desliga e outros parâmetros não mudam nada', () => {
    const a = armazem()
    lerMarcaDaUrl('?interno=1', a)
    expect(jogadorInterno(a)).toBe(true)
    expect(a.getItem(CHAVE_INTERNO)).toBe('1')
    lerMarcaDaUrl('?utm_source=whatsapp', a)
    expect(jogadorInterno(a)).toBe(true)
    lerMarcaDaUrl('?interno=0', a)
    expect(jogadorInterno(a)).toBe(false)
  })

  it('armazém quebrado ou ausente não lança', () => {
    expect(() => lerMarcaDaUrl('?interno=1', quebrado())).not.toThrow()
    expect(() => lerMarcaDaUrl('?interno=1', null)).not.toThrow()
  })
})
