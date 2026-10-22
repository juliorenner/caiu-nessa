import { z } from 'zod'

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

const inteiro = z.coerce.number().int().min(0)

export const parametrosSchema: z.ZodType<{ a: number; t: 6 | 12; c: number; f: Faixa; g: string }> = z
  .object({
    a: inteiro,
    t: z.coerce.number().pipe(z.union([z.literal(6), z.literal(12)])),
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
