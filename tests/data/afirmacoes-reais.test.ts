// tests/data/afirmacoes-reais.test.ts
import { expect, it } from 'vitest'
import dados from '@/data/afirmacoes.json'
import reserva from '@/data/afirmacoes-reserva.json'
import { afirmacaoSchema, validarAfirmacoes } from '@/lib/afirmacoes'

it('src/data/afirmacoes.json segue as regras de neutralidade', () => {
  expect(() => validarAfirmacoes(dados)).not.toThrow()
})
it('nenhuma explicação é vazia ou menor que 40 caracteres', () => {
  for (const a of validarAfirmacoes(dados)) expect(a.explicacao.length).toBeGreaterThanOrEqual(40)
})
it('toda afirmação da reserva segue o esquema e nenhum id colide com as afirmações ativas', () => {
  const idsAtivos = new Set(validarAfirmacoes(dados).map((a) => a.id))
  for (const item of reserva) {
    const a = afirmacaoSchema.parse(item)
    expect(idsAtivos.has(a.id)).toBe(false)
  }
})
