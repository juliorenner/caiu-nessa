// tests/data/afirmacoes-reais.test.ts
import { expect, it } from 'vitest'
import dados from '@/data/afirmacoes.json'
import { chaveDoPar, contarPorPar, jogaveis, PARES, sortearRodada, validarPool } from '@/lib/afirmacoes'
import { COMPOSICAO_EXTRA, COMPOSICAO_PRIMEIRA, MINIMO_POR_PAR } from '@/lib/rodadas'

it('src/data/afirmacoes.json é um pool válido', () => {
  expect(() => validarPool(dados)).not.toThrow()
})
it('nenhuma explicação é vazia ou menor que 40 caracteres', () => {
  for (const a of validarPool(dados)) expect(a.explicacao.length, a.id).toBeGreaterThanOrEqual(40)
})
it('pool tem o mínimo de jogáveis por par para qualquer rodada atual', () => {
  const contagem = contarPorPar(jogaveis(validarPool(dados)))
  for (const par of PARES) expect(contagem.get(chaveDoPar(par)), chaveDoPar(par)).toBeGreaterThanOrEqual(MINIMO_POR_PAR[par.veredito])
})
it('pool sustenta a primeira rodada e mais uma extra (inclui ao menos 2 falsas jogáveis por lado)', () => {
  const contagem = contarPorPar(jogaveis(validarPool(dados)))
  for (const { lado, veredito } of PARES) {
    const precisa = COMPOSICAO_PRIMEIRA[veredito] + COMPOSICAO_EXTRA[veredito]
    expect(contagem.get(`${lado}:${veredito}`), `${lado}:${veredito}`).toBeGreaterThanOrEqual(precisa)
  }
  expect(COMPOSICAO_PRIMEIRA.falso).toBeGreaterThanOrEqual(2)
  const pool = validarPool(dados)
  for (let i = 0; i < 20; i++) {
    const primeira = sortearRodada(pool, COMPOSICAO_PRIMEIRA, [])
    expect(primeira).not.toBeNull()
    expect(sortearRodada(pool, COMPOSICAO_EXTRA, primeira!.map((a) => a.id))).not.toBeNull()
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

// A agência declarada é a dona da URL: pega "fonte_nome" trocado numa revisão.
const DOMINIO_DA_AGENCIA: Record<string, RegExp> = {
  'Aos Fatos': /(^|\.)aosfatos\.org$/,
  Lupa: /(^|\.)agencialupa\.org$|^lupa\.uol\.com\.br$/,
  Comprova: /(^|\.)projetocomprova\.com\.br$/,
  'G1 Fato ou Fake': /^g1\.globo\.com$/,
  'Estadão Verifica': /(^|\.)estadao\.com\.br$/,
}
it('fonte_nome é uma das cinco agências e bate com o domínio de fonte_url', () => {
  for (const a of todasAsAfirmacoes) {
    const dominio = DOMINIO_DA_AGENCIA[a.fonte_nome]
    expect(dominio, `${a.id}: fonte_nome "${a.fonte_nome}"`).toBeDefined()
    expect(new URL(a.fonte_url).hostname, `${a.id}: ${a.fonte_url}`).toMatch(dominio)
  }
})
