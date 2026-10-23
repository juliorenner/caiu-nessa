import { describe, expect, it } from 'vitest'
import {
  DADOS_POR_TIPO,
  MODOS_DE_COMPARTILHAR,
  RESULTADOS_DE_COMPARTILHAR,
  TAMANHO_MAXIMO_DADOS,
  TIPOS_DE_EVENTO,
  eventoSchema,
} from '@/lib/eventos'

describe('eventoSchema', () => {
  it('cada tipo tem um esquema de dados', () => {
    expect(Object.keys(DADOS_POR_TIPO).sort()).toEqual([...TIPOS_DE_EVENTO].sort())
    expect(TAMANHO_MAXIMO_DADOS).toBe(500)
  })

  it('aceita compartilhar com todo modo e resultado da lista', () => {
    for (const modo of MODOS_DE_COMPARTILHAR)
      for (const resultado of RESULTADOS_DE_COMPARTILHAR)
        expect(eventoSchema.safeParse({ tipo: 'compartilhar', dados: { modo, resultado } }).success).toBe(true)
  })

  it('rejeita tipo desconhecido, dados ausentes, valores fora da lista e chaves extras', () => {
    for (const corpo of [
      null,
      {},
      { tipo: 'visita', dados: {} },
      { tipo: 'compartilhar' },
      { tipo: 'compartilhar', dados: null },
      { tipo: 'compartilhar', dados: { modo: 'email', resultado: 'folha' } },
      { tipo: 'compartilhar', dados: { modo: 'link', resultado: 'enviado' } },
      { tipo: 'compartilhar', dados: { modo: 'link' } },
      { tipo: 'compartilhar', dados: { modo: 'link', resultado: 'folha', extra: 'x'.repeat(600) } },
    ])
      expect(eventoSchema.safeParse(corpo).success).toBe(false)
  })
})
