import { z } from 'zod'
import { fonteEhPermitida } from '@/lib/fontes'

// Sugestão de afirmação e relato de problema: cada envio vira uma issue pública no GitHub.
// Não pedimos nome nem e-mail; o formulário avisa que o texto é público.
export const MAX_CONTEXTO = 280
export const MIN_DESCRICAO = 10
export const MAX_DESCRICAO = 1000

export const TELAS = ['Início', 'Jogo (cartões)', 'Fim de jogo', 'As afirmações', 'Como escolhemos', 'Outra'] as const

// `site` é o campo-armadilha: invisível para pessoas, preenchido por robôs. Precisa vir vazio.
const armadilha = z.literal('').optional()

export const contribuicaoSchema = z.discriminatedUnion('tipo', [
  z.strictObject({
    tipo: z.literal('sugestao'),
    // A mesma regra das fontes do banco: só checagens das agências aceitas.
    url: z.string().trim().max(500).refine(fonteEhPermitida),
    contexto: z.string().trim().max(MAX_CONTEXTO).optional(),
    site: armadilha,
  }),
  z.strictObject({
    tipo: z.literal('problema'),
    descricao: z.string().trim().min(MIN_DESCRICAO).max(MAX_DESCRICAO),
    tela: z.enum(TELAS).optional(),
    site: armadilha,
  }),
])

export type Contribuicao = z.infer<typeof contribuicaoSchema>

export interface NovaIssue {
  title: string
  body: string
  labels: string[]
}

// Texto livre dentro de um bloco de código: não vira menção (@alguém), link nem HTML na issue.
// A cerca é maior que qualquer sequência de crases do texto, para ele não conseguir fechá-la.
export function blocoDeCodigo(texto: string): string {
  const maior = Math.max(0, ...(texto.match(/`+/g) ?? []).map(s => s.length))
  const cerca = '`'.repeat(Math.max(3, maior + 1))
  return `${cerca}text\n${texto}\n${cerca}`
}

function resumir(texto: string, max: number): string {
  const linha = texto.replace(/\s+/g, ' ').trim()
  return linha.length > max ? `${linha.slice(0, max - 1)}…` : linha
}

const RODAPE = '_Enviado pelo formulário do site (anônimo)._'

export function issueDaContribuicao(c: Contribuicao): NovaIssue {
  if (c.tipo === 'sugestao') {
    const { hostname, pathname } = new URL(c.url)
    const partes = ['**Checagem sugerida**', blocoDeCodigo(c.url)]
    if (c.contexto) partes.push('**Contexto**', blocoDeCodigo(c.contexto))
    partes.push(RODAPE)
    return {
      title: `Sugestão: ${resumir(`${hostname.replace(/^www\./, '')}${pathname}`, 80)}`,
      body: partes.join('\n\n'),
      labels: ['sugestão'],
    }
  }
  const partes = ['**O que aconteceu**', blocoDeCodigo(c.descricao)]
  if (c.tela) partes.push(`**Tela:** ${c.tela}`)
  partes.push(RODAPE)
  return { title: `Problema: ${resumir(c.descricao, 70)}`, body: partes.join('\n\n'), labels: ['bug'] }
}
