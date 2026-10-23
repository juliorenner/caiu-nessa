// Confere se a citação de cada afirmação aparece no texto da página da agência. Por padrão só os itens
// novos ou alterados em relação a BASE_REF (origin/main); com --todas, o pool inteiro. Sai com 0 sempre
// (é um aviso: ver src/lib/citacoes.ts), salvo com --estrito, que falha se alguma não aparecer.
// Uso: npx tsx scripts/conferir-citacoes.ts [--todas] [--estrito]
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { type Afirmacao, validarPool } from '../src/lib/afirmacoes'
import { citacaoAparece, textoDoHtml } from '../src/lib/citacoes'

const CAMINHO = 'src/data/afirmacoes.json'
const todas = process.argv.includes('--todas')
const estrito = process.argv.includes('--estrito')

const pool = validarPool(JSON.parse(readFileSync(new URL(`../${CAMINHO}`, import.meta.url), 'utf-8')))

function alteradas(): Afirmacao[] {
  const base = process.env.BASE_REF ?? 'origin/main'
  const antes = validarPool(JSON.parse(execFileSync('git', ['show', `${base}:${CAMINHO}`], { encoding: 'utf-8' })))
  const porId = new Map(antes.map((a) => [a.id, JSON.stringify(a)]))
  return pool.filter((a) => porId.get(a.id) !== JSON.stringify(a))
}

const itens = todas ? pool : alteradas()
const paginas = new Map<string, string | null>()
let semCitacao = 0
for (const a of itens) {
  if (!paginas.has(a.fonte_url)) {
    try {
      const resposta = await fetch(a.fonte_url, {
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; caiu-nessa/1.0)' },
        signal: AbortSignal.timeout(30_000),
      })
      paginas.set(a.fonte_url, resposta.ok ? textoDoHtml(await resposta.text()) : null)
    } catch {
      paginas.set(a.fonte_url, null)
    }
  }
  const texto = paginas.get(a.fonte_url)
  if (texto === null || texto === undefined) {
    semCitacao++
    console.log(`AVISO ${a.id} página não carregou: ${a.fonte_url}`)
  } else if (citacaoAparece(a.citacao, texto)) {
    console.log(`OK ${a.id}`)
  } else {
    semCitacao++
    console.log(`AVISO ${a.id} citação não encontrada na página: ${a.fonte_url}`)
  }
}
console.log(`${itens.length} conferidas, ${semCitacao} sem citação encontrada`)
process.exitCode = estrito && semCitacao > 0 ? 1 : 0
