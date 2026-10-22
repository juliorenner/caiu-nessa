import { z } from 'zod'
import dados from '@/data/afirmacoes.json'
import dadosReserva from '@/data/afirmacoes-reserva.json'

export type Lado = 'esquerda' | 'direita'

export const VEREDITOS = ['verdadeiro', 'falso', 'enganoso'] as const
export type Veredito = (typeof VEREDITOS)[number]

export interface Afirmacao {
  id: string
  texto: string
  lado: Lado
  autor: string
  veredito: Veredito
  explicacao: string
  fonte_nome: string
  fonte_url: string
  data_checagem: string // YYYY-MM-DD
}

export type Respostas = Record<string, Veredito>

export const TOTAL_AFIRMACOES = 12
export const POR_LADO = 6
export const POR_VEREDITO_POR_LADO = 2

const LADOS: readonly Lado[] = ['esquerda', 'direita']

function hostEhDominio(host: string, dominio: string): boolean {
  return host === dominio || host === `www.${dominio}`
}

export function fonteEhPermitida(url: string): boolean {
  let endereco: URL
  try {
    endereco = new URL(url)
  } catch {
    return false
  }
  if (endereco.protocol !== 'https:') return false

  const host = endereco.hostname
  const caminho = endereco.pathname
  if (hostEhDominio(host, 'aosfatos.org')) return true
  if (hostEhDominio(host, 'projetocomprova.com.br')) return true
  if (host === 'lupa.uol.com.br') return true
  if (hostEhDominio(host, 'agencialupa.org')) return true
  if (host === 'g1.globo.com') return caminho === '/fato-ou-fake' || caminho.startsWith('/fato-ou-fake/')
  if (hostEhDominio(host, 'estadao.com.br')) return caminho.includes('estadao-verifica')
  return false
}

const esquemaAfirmacao = z.object({
  id: z.string().min(1, { error: 'id não pode ser vazio' }),
  texto: z.string(),
  lado: z.enum(LADOS, { error: 'lado deve ser "esquerda" ou "direita"' }),
  autor: z.string(),
  veredito: z.enum(VEREDITOS, { error: 'veredito deve ser "verdadeiro", "falso" ou "enganoso"' }),
  explicacao: z.string(),
  fonte_nome: z.string(),
  fonte_url: z
    .url({ error: 'fonte_url deve ser uma URL válida' })
    .refine(fonteEhPermitida, { error: 'fonte_url não pertence a uma agência de checagem permitida' }),
  data_checagem: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'data_checagem deve estar no formato YYYY-MM-DD' })
    .refine(
      (v) => {
        const data = new Date(`${v}T00:00:00Z`)
        return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === v
      },
      {
        error: 'data_checagem deve ser uma data de calendário válida',
      },
    ),
})

export const afirmacaoSchema = esquemaAfirmacao

const esquemaAfirmacoes = z
  .array(esquemaAfirmacao)
  .length(TOTAL_AFIRMACOES, { error: `devem existir exatamente ${TOTAL_AFIRMACOES} afirmações` })

export function validarAfirmacoes(dados: unknown): Afirmacao[] {
  const resultado = esquemaAfirmacoes.safeParse(dados)
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map(({ path, message }) => (path.length ? `[${path.join('.')}] ${message}` : message))
      .join('; ')
    throw new Error(`Afirmações inválidas: ${problemas}`)
  }
  const afirmacoes = resultado.data

  const ids = new Set<string>()
  for (const { id } of afirmacoes) {
    if (ids.has(id)) throw new Error(`Afirmações inválidas: id duplicado "${id}"`)
    ids.add(id)
  }

  for (const lado of LADOS) {
    const doLado = afirmacoes.filter((a) => a.lado === lado)
    const contagens = VEREDITOS.map((v) => doLado.filter((a) => a.veredito === v).length)
    if (doLado.length !== POR_LADO || contagens.some((n) => n !== POR_VEREDITO_POR_LADO)) {
      const detalhe = VEREDITOS.map((v, k) => `${contagens[k]} ${v}`).join(', ')
      throw new Error(
        `Afirmações inválidas: lado ${lado} deve ter ${POR_VEREDITO_POR_LADO} de cada veredito ` +
          `(${VEREDITOS.join(', ')}); tem ${detalhe}`,
      )
    }
  }

  return afirmacoes
}

let afirmacoesCarregadas: Afirmacao[] | undefined

export function carregarAfirmacoes(): Afirmacao[] {
  afirmacoesCarregadas ??= validarAfirmacoes(dados)
  return afirmacoesCarregadas.map((a) => ({ ...a }))
}

let reservaCarregada: Afirmacao[] | undefined

export function carregarReserva(): Afirmacao[] {
  reservaCarregada ??= dadosReserva.map((item, i) => {
    const resultado = esquemaAfirmacao.safeParse(item)
    if (!resultado.success) {
      const problemas = resultado.error.issues
        .map(({ path, message }) => (path.length ? `[${path.join('.')}] ${message}` : message))
        .join('; ')
      throw new Error(`Reserva inválida: [${i}] ${problemas}`)
    }
    return resultado.data
  })
  return reservaCarregada.map((a) => ({ ...a }))
}

export function embaralhar<T>(itens: readonly T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
