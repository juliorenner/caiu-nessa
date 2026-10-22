import { PHASE_PRODUCTION_BUILD } from 'next/constants'
import { getDb } from '@/db/client'
import { carregarAfirmacoes } from '@/lib/afirmacoes'
import { processarResultado } from '@/lib/resultado-api'

export const dynamic = 'force-dynamic'

// `next build` avalia o módulo para coletar a configuração da rota; só aí o salt pode faltar.
const salt = process.env.IP_HASH_SALT ?? ''
if (!salt && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
  throw new Error('IP_HASH_SALT não definida')
}

export async function POST(req: Request) {
  let corpo: unknown
  try {
    corpo = await req.json()
  } catch {
    return Response.json({ erro: 'respostas_invalidas' }, { status: 400 })
  }
  const { status, body } = await processarResultado(corpo, req.headers, {
    db: getDb(),
    afirmacoes: carregarAfirmacoes(),
    salt,
  })
  return Response.json(body, { status })
}
