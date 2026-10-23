// Valida uma revisão de src/data/afirmacoes.json contra a main: nada removido, ids novos no formato,
// volume de novas dentro do limite, pool válido. Uso: npx tsx scripts/validar-revisao.ts [BASE_REF=origin/main]
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { validarPool } from '../src/lib/afirmacoes'
import { compararPools, resumirRevisao } from '../src/lib/revisao-do-pool'

const CAMINHO = 'src/data/afirmacoes.json'
const base = process.env.BASE_REF ?? 'origin/main'

const antes: unknown = JSON.parse(execFileSync('git', ['show', `${base}:${CAMINHO}`], { encoding: 'utf-8' }))
const depois: unknown = JSON.parse(readFileSync(new URL(`../${CAMINHO}`, import.meta.url), 'utf-8'))

const problemas = compararPools(antes, depois)
if (problemas.length) {
  for (const p of problemas) console.log(`PROBLEMA ${p}`)
  process.exitCode = 1
} else {
  const { novas, alteradas } = resumirRevisao(validarPool(antes), validarPool(depois))
  console.log(`OK: ${novas} novas, ${alteradas} alteradas`)
}
