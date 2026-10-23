// Threads de revisão do cubic numa PR do bot: a única porta do agente de correção para o GitHub.
// Uso: npx tsx scripts/threads-da-revisao.ts listar <pr>
//      npx tsx scripts/threads-da-revisao.ts responder <thread id> <texto>
//      npx tsx scripts/threads-da-revisao.ts resolver <thread id>
// `listar` devolve só threads abertas cujo primeiro comentário é do cubic, e só os comentários do cubic
// dentro delas: texto de qualquer outra conta nunca chega ao agente.
import { execFileSync } from 'node:child_process'

const REVISOR = 'cubic-dev-ai'
const [, , comando, ...args] = process.argv

function graphql(query: string, variaveis: Record<string, string | number>): unknown {
  const flags = Object.entries(variaveis).flatMap(([k, v]) => (typeof v === 'number' ? ['-F', `${k}=${v}`] : ['-f', `${k}=${v}`]))
  return JSON.parse(execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`, ...flags], { encoding: 'utf-8' }))
}

interface Comentario { author: { login: string } | null; body: string }
interface Thread { id: string; isResolved: boolean; path: string; line: number | null; comments: { nodes: Comentario[] } }

function listar(pr: number): void {
  const [owner, name] = (process.env.GH_REPO ?? 'juliorenner/caiu-nessa').split('/')
  const dados = graphql(
    `query($owner: String!, $name: String!, $pr: Int!) { repository(owner: $owner, name: $name) { pullRequest(number: $pr) {
      reviewThreads(first: 100) { nodes { id isResolved path line comments(first: 20) { nodes { author { login } body } } } } } } }`,
    { owner, name, pr },
  ) as { data: { repository: { pullRequest: { reviewThreads: { nodes: Thread[] } } } } }
  const threads = dados.data.repository.pullRequest.reviewThreads.nodes
    .filter((t) => !t.isResolved && t.comments.nodes[0]?.author?.login === REVISOR)
    .map((t) => ({
      id: t.id,
      path: t.path,
      line: t.line,
      comentarios: t.comments.nodes.filter((c) => c.author?.login === REVISOR).map((c) => c.body),
    }))
  console.log(JSON.stringify(threads, null, 2))
}

function responder(thread: string, texto: string): void {
  const corpo = `${texto}\n\n_🤖 resposta automática da revisão de fatos_`
  graphql(
    `mutation($t: ID!, $b: String!) { addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $t, body: $b}) { comment { id } } }`,
    { t: thread, b: corpo },
  )
  console.log(`respondida ${thread}`)
}

function resolver(thread: string): void {
  graphql(`mutation($t: ID!) { resolveReviewThread(input: {threadId: $t}) { thread { isResolved } } }`, { t: thread })
  console.log(`resolvida ${thread}`)
}

if (comando === 'listar' && args[0]) listar(Number(args[0]))
else if (comando === 'responder' && args[0] && args[1]) responder(args[0], args.slice(1).join(' '))
else if (comando === 'resolver' && args[0]) resolver(args[0])
else {
  console.error('uso: listar <pr> | responder <thread id> <texto> | resolver <thread id>')
  process.exitCode = 2
}
