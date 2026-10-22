// tests/data/afirmacoes-reais.test.ts
import { expect, it } from 'vitest'
import dados from '@/data/afirmacoes.json'
import { contarPorPar, jogaveis, POR_VEREDITO_POR_LADO, validarPool } from '@/lib/afirmacoes'

it('src/data/afirmacoes.json é um pool válido', () => {
  expect(() => validarPool(dados)).not.toThrow()
})
it('nenhuma explicação é vazia ou menor que 40 caracteres', () => {
  for (const a of validarPool(dados)) expect(a.explicacao.length, a.id).toBeGreaterThanOrEqual(40)
})
it('pool tem ao menos 2 jogáveis por par', () => {
  for (const [par, n] of contarPorPar(jogaveis(validarPool(dados)))) {
    expect(n, par).toBeGreaterThanOrEqual(POR_VEREDITO_POR_LADO)
  }
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

const todasAsAfirmacoes = validarPool(dados)

it('toda afirmação do pool tem citacao não vazia', () => {
  for (const a of todasAsAfirmacoes) expect(a.citacao.trim(), a.id).not.toBe('')
})
it.each(REGRAS_TEXTO_NEUTRO)('texto neutro: %s', (_regra, proibido) => {
  const violacoes = todasAsAfirmacoes.filter((a) => proibido.test(a.texto)).map((a) => `${a.id}: ${a.texto}`)
  expect(violacoes).toEqual([])
})
