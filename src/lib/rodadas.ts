import type { Alcance, Veredito } from '@/lib/afirmacoes'

// Quantos itens de cada veredito uma rodada tem em cada lado. Só este arquivo descreve as rodadas;
// mudar o tamanho de uma rodada ou aceitar uma nova é mudar um dado aqui.
export type Composicao = Readonly<Record<Veredito, number>>

export const COMPOSICAO_PRIMEIRA: Composicao = { verdadeiro: 2, falso: 2, enganoso: 1 }
export const COMPOSICAO_EXTRA: Composicao = { verdadeiro: 1, falso: 1, enganoso: 1 }
// Rodadas que não são mais sorteadas mas ainda são aceitas (jogos em andamento, links antigos).
export const COMPOSICOES_HISTORICAS: readonly Composicao[] = [
  { verdadeiro: 1, falso: 2, enganoso: 1 },
  { verdadeiro: 2, falso: 2, enganoso: 2 },
]

const COMPOSICOES_ATUAIS: readonly Composicao[] = [COMPOSICAO_PRIMEIRA, COMPOSICAO_EXTRA]
// Atuais primeiro: num empate de tamanho, vale a atual.
export const COMPOSICOES_ACEITAS: readonly Composicao[] = [...COMPOSICOES_ATUAIS, ...COMPOSICOES_HISTORICAS]

const LADOS_POR_RODADA = 2
const MAXIMO_POR_LINHA = 6

export function tamanhoDa(c: Composicao): number {
  return LADOS_POR_RODADA * (c.verdadeiro + c.falso + c.enganoso)
}

// Tamanho da primeira rodada; só rodadas desse tamanho entram no ranking.
export const TOTAL_AFIRMACOES = tamanhoDa(COMPOSICAO_PRIMEIRA)
export const MAXIMO_ACERTOS = TOTAL_AFIRMACOES
export const TAMANHOS_ACEITOS: readonly number[] = [...new Set(COMPOSICOES_ACEITAS.map(tamanhoDa))]

// Mínimo de itens jogáveis que o pool precisa ter em cada par (lado, veredito): o bastante para
// sortear qualquer rodada atual (o maior pedido de cada veredito entre as composições atuais).
export const MINIMO_POR_PAR: Composicao = {
  verdadeiro: Math.max(...COMPOSICOES_ATUAIS.map((c) => c.verdadeiro)),
  falso: Math.max(...COMPOSICOES_ATUAIS.map((c) => c.falso)),
  enganoso: Math.max(...COMPOSICOES_ATUAIS.map((c) => c.enganoso)),
}

export function composicaoDoTamanho(
  total: number,
  aceitas: readonly Composicao[] = COMPOSICOES_ACEITAS,
): Composicao | null {
  return aceitas.find((c) => tamanhoDa(c) === total) ?? null
}

// Quantas casas cabem numa linha do placar: o maior divisor do total que não passa de 6.
export function porLinha(total: number): number {
  for (let n = Math.min(total, MAXIMO_POR_LINHA); n > 1; n--) if (total % n === 0) return n
  return 1
}

const NOMES: Record<Veredito, [singular: string, plural: string]> = {
  verdadeiro: ['verdadeira', 'verdadeiras'],
  falso: ['falsa', 'falsas'],
  enganoso: ['enganosa', 'enganosas'],
}

function contar(n: number, veredito: Veredito): string {
  const [singular, plural] = NOMES[veredito]
  return `${n} ${n === 1 ? singular : plural}`
}

// "1 verdadeira, 2 falsas e 1 enganosa": a composição de um lado, por extenso.
export function descricaoDaComposicao(c: Composicao): string {
  return `${contar(c.verdadeiro, 'verdadeiro')}, ${contar(c.falso, 'falso')} e ${contar(c.enganoso, 'enganoso')}`
}

// Peso de cada alcance no sorteio da primeira rodada (as extras sorteiam sem peso). Para tirar a preferência,
// basta trocar os três números por 1.
export const PESO_POR_ALCANCE: Readonly<Record<Alcance, number>> = { 1: 1, 2: 2, 3: 3 }
export const PESOS_DA_PRIMEIRA = PESO_POR_ALCANCE

const CRITERIO_DO_ALCANCE: Record<Alcance, string> = {
  3: 'debate ou entrevista de TV nacional, checada por duas ou mais agências',
  2: 'debate ou entrevista de TV nacional, checada por uma agência',
  1: 'o resto (post, live, podcast, fala avulsa)',
}

// "Alcance 3: debate ou entrevista de TV nacional, checada por duas ou mais agências".
export function descricaoDoAlcance(a: Alcance): string {
  return `Alcance ${a}: ${CRITERIO_DO_ALCANCE[a]}`
}
