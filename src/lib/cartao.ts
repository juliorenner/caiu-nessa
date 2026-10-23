import { z } from 'zod'
import { TAMANHOS_ACEITOS } from '@/lib/rodadas'

export type Casa = 'acerto' | 'erro' | 'quase'

// Slug da faixa (parâmetro `f` do cartão) → título exibido.
export const FAIXAS = {
  imune: 'Imune',
  'quase-imune': 'Quase imune',
  'abre-o-olho': 'Abre o olho',
  'caiu-feio': 'Caiu feio',
} as const

export type Faixa = keyof typeof FAIXAS

export function slugDaFaixa(titulo: string): Faixa {
  const slug = (Object.keys(FAIXAS) as Faixa[]).find(s => FAIXAS[s] === titulo)
  if (!slug) throw new Error(`faixa desconhecida: ${titulo}`)
  return slug
}

export const LETRA: Record<Casa, 'a' | 'e' | 'q'> = { acerto: 'a', erro: 'e', quase: 'q' }

const CASA_DA_LETRA: Record<string, Casa> = { a: 'acerto', e: 'erro', q: 'quase' }

export function casasParaLetras(casas: Casa[]): string {
  return casas.map(casa => LETRA[casa]).join('')
}

export function letrasParaCasas(g: string): Casa[] {
  return [...g].map(letra => {
    const casa = CASA_DA_LETRA[letra]
    if (!casa) throw new Error(`letra de casa desconhecida: ${letra}`)
    return casa
  })
}

export type Parametros = { a: number; t: number; c: number; f: Faixa; g: string }

const inteiro = z.coerce.number().int().min(0)

export const parametrosSchema: z.ZodType<Parametros> = z
  .object({
    a: inteiro,
    t: z.coerce.number().int().refine(t => TAMANHOS_ACEITOS.includes(t)),
    c: inteiro,
    f: z.enum(Object.keys(FAIXAS) as [Faixa, ...Faixa[]]),
    g: z.string().regex(/^[aeq]+$/),
  })
  .refine(p => p.a <= p.t, { path: ['a'] })
  // Quem caiu errou (e errar o grau não é cair): caídas não passam das letras 'e'.
  .refine(p => p.c <= [...p.g].filter(letra => letra === 'e').length, {
    path: ['c'],
    message: 'c maior que o número de erros em g',
  })
  .refine(p => p.g.length === p.t, { path: ['g'] })
  .refine(p => [...p.g].filter(letra => letra === 'a').length === p.a, { path: ['g'] })

export function urlDoCartao(p: { acertos: number; total: number; caiu: number; faixa: Faixa; casas: Casa[] }): string {
  const query = new URLSearchParams({
    a: String(p.acertos),
    t: String(p.total),
    c: String(p.caiu),
    f: p.faixa,
    g: casasParaLetras(p.casas),
  })
  return `/cartao?${query.toString()}`
}

type Resultado = { acertos: number; total: number; caiu: number; faixa: Faixa; casas: Casa[] }

// Código do resultado: {a}-{t}-{c}-{f}-{g}. A faixa tem hífens; g só tem a, e, q.
export function codigoDoResultado(p: Resultado): string {
  return `${p.acertos}-${p.total}-${p.caiu}-${p.faixa}-${casasParaLetras(p.casas)}`
}

const CODIGO = /^(\d+)-(\d+)-(\d+)-([a-z-]+)-([aeq]+)$/

export function parametrosDoCodigo(codigo: string): Parametros | null {
  const partes = CODIGO.exec(codigo)
  if (!partes) return null
  const [, a, t, c, f, g] = partes
  const lido = parametrosSchema.safeParse({ a, t, c, f, g })
  return lido.success ? lido.data : null
}

export function urlDoResultado(p: Resultado): string {
  return `/r/${codigoDoResultado(p)}`
}
