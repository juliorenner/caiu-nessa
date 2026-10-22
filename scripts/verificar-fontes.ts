import { readFileSync } from 'node:fs'
import { afirmacaoSchema, validarAfirmacoes, type Afirmacao } from '../src/lib/afirmacoes'

function lerJson(caminho: string): unknown {
  return JSON.parse(readFileSync(new URL(caminho, import.meta.url), 'utf-8'))
}

const afirmacoes: Afirmacao[] = [
  ...validarAfirmacoes(lerJson('../src/data/afirmacoes.json')),
  ...(lerJson('../src/data/afirmacoes-reserva.json') as unknown[]).map((item) => afirmacaoSchema.parse(item)),
]

let falhou = false
for (const { id, fonte_url } of afirmacoes) {
  try {
    const resposta = await fetch(fonte_url, { method: 'GET', redirect: 'follow' })
    if (resposta.ok) {
      console.log(`OK ${id}`)
    } else {
      falhou = true
      console.log(`FALHOU ${id} ${resposta.status}`)
    }
  } catch (erro) {
    falhou = true
    console.log(`FALHOU ${id} ${erro instanceof Error ? erro.message : String(erro)}`)
  }
}

process.exit(falhou ? 1 : 0)
