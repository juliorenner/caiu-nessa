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
it('toda afirmação da reserva segue o esquema', () => {
  for (const item of reserva) expect(() => afirmacaoSchema.parse(item)).not.toThrow()
})
it('ids são únicos dentro da reserva e entre reserva e afirmações ativas', () => {
  const ids = [...validarAfirmacoes(dados), ...reserva.map((item) => afirmacaoSchema.parse(item))].map((a) => a.id)
  expect(new Set(ids).size).toBe(ids.length)
})
