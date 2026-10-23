// Leitura das métricas: `npm run metricas` com DATABASE_URL no ambiente.
// Mesma regra de src/db/client.ts: `file:<caminho>` abre um PGlite local (caminho relativo ao
// diretório atual), qualquer outro valor usa o Neon. Lê os tamanhos de rodada da configuração
// (src/lib/rodadas.ts; o Node tira os tipos ao importar), para não haver número copiado à mão.
import path from 'node:path'
import { COMPOSICAO_EXTRA, TAMANHOS_ACEITOS, tamanhoDa } from '../src/lib/rodadas.ts'

const TAMANHO_EXTRA = tamanhoDa(COMPOSICAO_EXTRA)
const TAMANHOS_PRIMEIRA = TAMANHOS_ACEITOS.filter((t) => t !== TAMANHO_EXTRA)
// O navegador só confirma que a folha abriu, o texto foi copiado ou um link (baixar, WhatsApp) foi tocado.
const RESULTADOS_QUE_CONTAM = ['folha', 'copiado', 'clique']

async function abrir(url) {
  if (url.startsWith('file:')) {
    const { PGlite } = await import('@electric-sql/pglite')
    const cliente = new PGlite(path.resolve(process.cwd(), url.slice('file:'.length)))
    return { consultar: async texto => (await cliente.query(texto)).rows, fechar: () => cliente.close() }
  }
  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(url)
  return { consultar: texto => sql.query(texto), fechar: async () => {} }
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL não definida')
  process.exit(1)
}

const banco = await abrir(url)
try {
  const [jogadas] = await banco.consultar(`
    select count(*)::int as total,
           (count(*) filter (where total in (${TAMANHOS_PRIMEIRA.join(', ')})))::int as primeiras,
           (count(*) filter (where total = ${TAMANHO_EXTRA}))::int as extras
    from jogadas`)
  const compartilhar = await banco.consultar(`
    select dados->>'modo' as modo, dados->>'resultado' as resultado, count(*)::int as n
    from eventos where tipo = 'compartilhar'
    group by 1, 2 order by 1, 2`)
  const estimados = compartilhar
    .filter(linha => RESULTADOS_QUE_CONTAM.includes(linha.resultado))
    .reduce((soma, linha) => soma + linha.n, 0)

  console.log('jogadas')
  console.log(`  total: ${jogadas.total}`)
  console.log(`  primeiras: ${jogadas.primeiras}`)
  console.log(`  extras: ${jogadas.extras}`)
  console.log('compartilhar (modo / resultado)')
  for (const linha of compartilhar) console.log(`  ${linha.modo} / ${linha.resultado}: ${linha.n}`)
  console.log(`compartilhamentos estimados: ${estimados}`)
} finally {
  await banco.fechar()
}
