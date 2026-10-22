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

// A pergunta mostra só `texto`, neutro e em terceira pessoa (JUL-104); a fala original fica em `citacao`.
// Regras heurísticas (sem diferenciar maiúsculas): nada de colchetes de glosa, de "você" dirigido a alguém
// ("Você ...", "você,", "você [...]"), de "[Eu]", de frase começando por "eu ", de "nós " ou "a gente ".
const REGRAS_TEXTO_NEUTRO: [string, RegExp][] = [
  ['sem "["', /\[/],
  ['sem "]"', /\]/],
  ['sem "você" como palavra', /(^|[^\p{L}])você([^\p{L}]|$)/iu],
  ['sem "você ["', /você \[/i],
  ['sem "[Eu]"', /\[eu\]/i],
  ['sem "eu " no início de frase', /(^|[.!?…]\s+)eu /i],
  ['sem "nós "', /(^|[^\p{L}])nós /iu],
  ['sem "a gente "', /(^|[^\p{L}])a gente /iu],
]

const todasAsAfirmacoes = [...validarAfirmacoes(dados), ...reserva.map((item) => afirmacaoSchema.parse(item))]

it('toda afirmação, em jogo e na reserva, tem citacao não vazia', () => {
  for (const a of todasAsAfirmacoes) expect(a.citacao.trim(), a.id).not.toBe('')
})
it.each(REGRAS_TEXTO_NEUTRO)('texto neutro: %s', (_regra, proibido) => {
  const violacoes = todasAsAfirmacoes.filter((a) => proibido.test(a.texto)).map((a) => `${a.id}: ${a.texto}`)
  expect(violacoes).toEqual([])
})
