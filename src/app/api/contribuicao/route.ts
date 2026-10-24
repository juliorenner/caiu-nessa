import { getDb } from '@/db/client'
import { processarContribuicao } from '@/lib/contribuicao-api'
import { contribuicaoSchema } from '@/lib/contribuicao'
import { criadorDeIssues } from '@/lib/github-issues'

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
  if (!contribuicaoSchema.safeParse(corpo).success) return new Response(null, { status: 400 })
  const token = process.env.GITHUB_ISSUES_TOKEN
  const resposta = await processarContribuicao(corpo, req.headers, {
    db: await getDb(),
    salt: obterSalt(),
    criarIssue: token ? criadorDeIssues(token) : null,
  })
  if (resposta.status === 201) return Response.json(resposta.issue, { status: 201 })
  return new Response(null, { status: resposta.status })
}
