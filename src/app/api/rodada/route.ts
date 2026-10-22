import { getDb } from '@/db/client'
import { carregarPool } from '@/lib/afirmacoes'
import { corpoRodadaSchema, processarRodada } from '@/lib/rodada-api'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  let corpo: unknown
  try {
    corpo = await req.json()
  } catch {
    return Response.json({ erro: 'pedido_invalido' }, { status: 400 })
  }
  // Valida antes de abrir o banco: pedido inválido é 400 mesmo com o banco fora do ar.
  if (!corpoRodadaSchema.safeParse(corpo).success) return Response.json({ erro: 'pedido_invalido' }, { status: 400 })
  const { status, body } = await processarRodada(corpo, { db: await getDb(), pool: carregarPool() })
  return Response.json(body, { status })
}
