import { getDb } from '@/db/client'
import { processarEvento } from '@/lib/evento-api'
import { eventoSchema } from '@/lib/eventos'

export const dynamic = 'force-dynamic'

function obterSalt(): string {
  const salt = process.env.IP_HASH_SALT
  if (!salt) throw new Error('IP_HASH_SALT não definida')
  return salt
}

export async function POST(req: Request) {
  let corpo: unknown
  try {
    corpo = await req.json()
  } catch {
    return new Response(null, { status: 400 })
  }
  // Valida antes de abrir o banco: pedido inválido é 400 mesmo com o banco fora do ar.
  if (!eventoSchema.safeParse(corpo).success) return new Response(null, { status: 400 })
  const { status } = await processarEvento(corpo, req.headers, { db: await getDb(), salt: obterSalt() })
  return new Response(null, { status })
}
