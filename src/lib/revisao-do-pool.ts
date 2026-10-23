import { z } from 'zod'
import { type Afirmacao, type Lado, validarPool } from '@/lib/afirmacoes'

// Limites de volume de uma revisão automática do pool: ficam aqui, não no prompt do agente.
export const LIMITES_DA_REVISAO = { novasPorRodada: 6, novasPorLado: 3 } as const
export type LimitesDaRevisao = { readonly novasPorRodada: number; readonly novasPorLado: number }

const FORMATO_DE_ID = /^[0-9a-f]{8}$/
const NOME_DO_LADO: Record<Lado, string> = { esquerda: 'à esquerda', direita: 'à direita' }

// O pool de antes (a main) pode ser de um esquema anterior (sem `alcance`, por exemplo): dele só se exigem `id` e `lado`.
export type ItemDeAntes = { id: string; lado: Lado } & Record<string, unknown>
const esquemaDeAntes = z.array(z.looseObject({ id: z.string().min(1), lado: z.enum(['esquerda', 'direita']) }))

// Devolve os itens como vieram (sem reordenar campos), para a comparação campo a campo com o pool de depois.
export function lerPoolDeAntes(dados: unknown): ItemDeAntes[] {
  const resultado = esquemaDeAntes.safeParse(dados)
  if (!resultado.success) {
    const detalhe = resultado.error.issues.map(({ path, message }) => `[${path.join('.')}] ${message}`).join('; ')
    throw new Error(`Afirmações inválidas: ${detalhe}`)
  }
  return dados as ItemDeAntes[]
}

function validarOuProblema<T>(validar: (dados: unknown) => T[], dados: unknown): { pool: T[] } | { problema: string } {
  try {
    return { pool: validar(dados) }
  } catch (erro) {
    return { problema: erro instanceof Error ? erro.message : String(erro) }
  }
}

// Compara o pool de antes (a main) com o de depois (a revisão). Devolve a lista de problemas; vazia = ok.
// Nenhum item pode sumir (sair do jogo é marcar `observacao`), nenhum muda de lado, ids novos têm 8 hexadecimais
// e o volume de novas respeita os limites. Outras mudanças em itens existentes passam: quem as julga é a revisão da PR.
export function compararPools(antes: unknown, depois: unknown, limites: LimitesDaRevisao = LIMITES_DA_REVISAO): string[] {
  const a = validarOuProblema(lerPoolDeAntes, antes)
  if ('problema' in a) return [`pool de antes: ${a.problema}`]
  const d = validarOuProblema(validarPool, depois)
  if ('problema' in d) return [d.problema]

  const problemas: string[] = []
  const idsDepois = new Set(d.pool.map((x) => x.id))
  for (const { id } of a.pool) if (!idsDepois.has(id)) problemas.push(`removido: ${id}`)

  const ladoAntes = new Map(a.pool.map((x) => [x.id, x.lado]))
  for (const x of d.pool) {
    const lado = ladoAntes.get(x.id)
    if (lado !== undefined && lado !== x.lado) problemas.push(`lado mudou: ${x.id}`)
  }

  const novas = d.pool.filter((x) => !ladoAntes.has(x.id))
  for (const { id } of novas) if (!FORMATO_DE_ID.test(id)) problemas.push(`id inválido: ${id}`)

  if (novas.length > limites.novasPorRodada) problemas.push(`${novas.length} novas, limite ${limites.novasPorRodada}`)
  for (const lado of ['esquerda', 'direita'] as const) {
    const n = novas.filter((x) => x.lado === lado).length
    if (n > limites.novasPorLado) problemas.push(`${n} novas ${NOME_DO_LADO[lado]}, limite ${limites.novasPorLado}`)
  }
  return problemas
}

// Quantas novas e quantas existentes mudaram em algum campo: o resumo do script.
export function resumirRevisao(antes: readonly { id: string }[], depois: readonly Afirmacao[]): { novas: number; alteradas: number } {
  const porId = new Map(antes.map((x) => [x.id, JSON.stringify(x)]))
  let novas = 0
  let alteradas = 0
  for (const x of depois) {
    const original = porId.get(x.id)
    if (original === undefined) novas++
    else if (original !== JSON.stringify(x)) alteradas++
  }
  return { novas, alteradas }
}
