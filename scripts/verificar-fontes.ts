import { readFileSync } from 'node:fs'
import { jogaveis, validarPool, type Afirmacao } from '../src/lib/afirmacoes'

function lerJson(caminho: string): unknown {
  return JSON.parse(readFileSync(new URL(caminho, import.meta.url), 'utf-8'))
}

// Só os itens em jogo: um fora do jogo (com `observacao`) pode ter a checagem retirada do ar, e isso não é falha.
const afirmacoes: Afirmacao[] = jogaveis(validarPool(lerJson('../src/data/afirmacoes.json')))

let falhou = false
for (const { id, fonte_url } of afirmacoes) {
  try {
    const resposta = await fetch(fonte_url, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(30_000),
    })
    if (resposta.ok) {
      console.log(`OK ${id}`)
    } else {
      falhou = true
      console.log(`FALHOU ${id} ${resposta.status}`)
    }
    await resposta.body?.cancel()
  } catch (erro) {
    falhou = true
    const motivo =
      erro instanceof Error ? (erro.name === 'TimeoutError' ? 'timeout' : erro.name) : String(erro)
    console.log(`FALHOU ${id} ${motivo}`)
  }
}

process.exitCode = falhou ? 1 : 0
