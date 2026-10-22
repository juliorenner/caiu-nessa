import { getDb } from '@/db/client'
import { carregarAfirmacoes } from '@/lib/afirmacoes'
import { processarResultado } from '@/lib/resultado-api'

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
    return Response.json({ erro: 'respostas_invalidas' }, { status: 400 })
  }
  const { status, body } = await processarResultado(corpo, req.headers, {
    db: await getDb(),
    afirmacoes: carregarAfirmacoes(),
    salt: obterSalt(),
  })
  return Response.json(body, { status })
}
