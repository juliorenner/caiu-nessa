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

// Limites de tamanho com folga sobre o pool atual (texto 186, citacao 234, explicacao 563, autor 122):
// um texto muito maior não cabe no cartão nem no painel do celular.
const TAMANHO_MAXIMO = { texto: 240, citacao: 300, explicacao: 700, autor: 150 } as const
it.each(Object.entries(TAMANHO_MAXIMO))('%s tem no máximo %i caracteres', (campo, maximo) => {
  for (const a of todasAsAfirmacoes) expect(a[campo as keyof typeof TAMANHO_MAXIMO].length, a.id).toBeLessThanOrEqual(maximo)
})

// Datas reais, de 2025 em diante (o jogo cobre o mundo político, não só a campanha de 2026) e nunca no futuro.
const INICIO_DO_PERIODO = '2025-01-01'
it('data_checagem é uma data real entre o início do período e hoje', () => {
  const hoje = new Date().toISOString().slice(0, 10)
  for (const a of todasAsAfirmacoes) {
    const data = new Date(`${a.data_checagem}T00:00:00Z`)
    expect(data.toISOString().slice(0, 10), a.id).toBe(a.data_checagem)
    expect(a.data_checagem >= INICIO_DO_PERIODO,`${a.id}: ${a.data_checagem}`).toBe(true)
    expect(a.data_checagem <= hoje, `${a.id}: ${a.data_checagem}`).toBe(true)
  }
})

// Sem repetição: a mesma fala ou o mesmo texto duas vezes (ignorando acentos, caixa e espaços).
const normalizar = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
it.each(['texto', 'citacao'] as const)('nenhum %s se repete', (campo) => {
  const vistos = new Map<string, string>()
  for (const a of todasAsAfirmacoes) {
    const chave = normalizar(a[campo])
    expect(vistos.get(chave), `${a.id} repete ${campo} de ${vistos.get(chave)}`).toBeUndefined()
    vistos.set(chave, a.id)
  }
})

// "Lula (PT), no debate da Band" ou "Post nas redes, compartilhado por Flávio Bolsonaro (PL)": partido entre
// parênteses e uma vírgula separando quem disse de onde ou como.
it('autor tem o partido entre parênteses e uma vírgula', () => {
  for (const a of todasAsAfirmacoes) {
    expect(a.autor, a.id).toMatch(/\([^)]+\)/)
    expect(a.autor, a.id).toContain(', ')
  }
})

// Alcance (publicado em /como-escolhemos): 3 e 2 só para debate ou entrevista de TV nacional; post, live e podcast são 1.
// Conferência heurística pelo `autor`.
it('alcance é 1, 2 ou 3 e bate com a ocasião descrita no autor', () => {
  for (const a of todasAsAfirmacoes) {
    expect([1, 2, 3], a.id).toContain(a.alcance)
    if (/debate|Jornal Nacional|TV Globo/.test(a.autor)) expect(a.alcance, `${a.id}: ${a.autor}`).toBeGreaterThanOrEqual(2)
    if (/\bFlow\b|\blive\b|\bposts?\b/i.test(a.autor)) expect(a.alcance, `${a.id}: ${a.autor}`).toBe(1)
  }
})
