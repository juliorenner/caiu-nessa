// Capturas de tela para conferir o layout: `node scripts/capturas.mjs [--saida <dir>]` depois de `npm run build`.
// Sobe `next start` numa porta livre, com o mesmo ambiente do playwright.config.ts, mas com um PGlite
// descartável: cada captura do resultado grava uma jogada, e o limite de 5 jogadas por minuto por IP
// barraria a última logo depois de um `npm run e2e`. Fotografa home, quiz (cartão e veredito) e resultado
// no celular (390×844) e no desktop (1280×800), no tema claro e no noite, com movimento reduzido.
import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { mkdir, mkdtemp } from 'node:fs/promises'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { chromium } from '@playwright/test'
import { TOTAL_AFIRMACOES } from '../src/lib/rodadas.ts'

const { values } = parseArgs({ options: { saida: { type: 'string', default: 'capturas' } } })
const saida = path.resolve(values.saida)

const TELAS = [
  { nome: 'celular', viewport: { width: 390, height: 844 } },
  { nome: 'desktop', viewport: { width: 1280, height: 800 } },
]
const TEMAS = [
  { nome: 'claro', colorScheme: 'light' },
  { nome: 'noite', colorScheme: 'dark' },
]

function portaLivre() {
  return new Promise((resolve, reject) => {
    const servidor = net.createServer()
    servidor.unref()
    servidor.on('error', reject)
    servidor.listen(0, () => {
      const { port } = servidor.address()
      servidor.close(() => resolve(port))
    })
  })
}

async function esperarNoAr(url, processo) {
  const limite = Date.now() + 120_000
  while (Date.now() < limite) {
    if (processo.exitCode !== null) throw new Error(`next start saiu com código ${processo.exitCode}`)
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`${url} não respondeu em 120 s`)
}

async function capturar(navegador, base, tela, tema) {
  const contexto = await navegador.newContext({
    baseURL: base,
    viewport: tela.viewport,
    colorScheme: tema.colorScheme,
    reducedMotion: 'reduce',
  })
  const pagina = await contexto.newPage()
  const foto = (nome) => pagina.screenshot({ path: path.join(saida, `${tela.nome}-${tema.nome}-${nome}.png`) })

  await pagina.goto('/')
  await foto('home')

  await pagina.goto('/quiz')
  await pagina.locator('[data-casa]').first().waitFor()
  await foto('quiz-cartao')

  await pagina.getByRole('button', { name: /verdade/i }).click()
  await pagina.getByRole('dialog').waitFor()
  await foto('quiz-veredito')

  for (let i = 0; i < TOTAL_AFIRMACOES; i++) {
    if (i > 0) await pagina.getByRole('button', { name: /verdade/i }).click()
    await pagina.getByRole('button', { name: /^(Próxima|Ver meu resultado)$/ }).click()
  }
  await pagina.locator('[data-placar]').waitFor()
  await foto('resultado')

  await contexto.close()
}

const porta = await portaLivre()
const base = `http://localhost:${porta}`
const banco = await mkdtemp(path.join(os.tmpdir(), 'capturas-pglite-'))
const servidor = spawn('npx', ['next', 'start', '-p', String(porta)], {
  env: { ...process.env, DATABASE_URL: `file:${banco}`, IP_HASH_SALT: 'e2e', NEXT_PUBLIC_SITE_URL: base },
  stdio: ['ignore', 'ignore', 'inherit'],
  detached: true,
})

// detached: o npx abre o next como filho; matar o grupo derruba os dois. ESRCH: o grupo já saiu
// (o next caiu antes); engolir aqui deixa o erro de verdade aparecer e a limpeza seguir.
function derrubarServidor() {
  try {
    process.kill(-servidor.pid, 'SIGTERM')
  } catch (erro) {
    if (erro.code !== 'ESRCH') throw erro
  }
}

function limparBanco() {
  rmSync(banco, { recursive: true, force: true })
}

// Ctrl+C (ou um kill) no meio das capturas: derruba o servidor e apaga o banco antes de sair.
for (const sinal of ['SIGINT', 'SIGTERM']) {
  process.once(sinal, () => {
    derrubarServidor()
    limparBanco()
    process.exit(sinal === 'SIGINT' ? 130 : 143)
  })
}

let navegador
try {
  await esperarNoAr(base, servidor)
  await mkdir(saida, { recursive: true })
  navegador = await chromium.launch()
  for (const tela of TELAS) {
    for (const tema of TEMAS) {
      await capturar(navegador, base, tela, tema)
      console.log(`${tela.nome} ${tema.nome}: ok`)
    }
  }
  console.log(`Capturas em ${saida}`)
} finally {
  try {
    await navegador?.close()
  } finally {
    derrubarServidor()
    if (servidor.exitCode === null && servidor.signalCode === null) await new Promise((r) => servidor.once('exit', r))
    limparBanco()
  }
}
