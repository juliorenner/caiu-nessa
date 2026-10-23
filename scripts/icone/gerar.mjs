// Recolore src/app/icon.svg (tinta sobre papel) e renderiza favicon.ico (16/32/48), apple-icon.png (180) e os ícones
// do manifesto (public/icone-192.png e icone-512.png) a partir dele.
// Idempotente: só grava o arquivo quando o conteúdo muda. Uso: node scripts/icone/gerar.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

let sharp
try {
  sharp = createRequire(import.meta.url)('sharp')
} catch {
  console.error('sharp não encontrado: rode npm ci (ele vem com o Next)')
  process.exit(1)
}

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const APP = join(RAIZ, 'src', 'app')
const PUBLIC = join(RAIZ, 'public')

const TROCAS = [
  [/#be123c/gi, '#1b1540'], // rosa antigo → tinta
  [/#fbf7ef/gi, '#fff3dc'], // papel antigo → fundo
]

function gravarSeMudou(caminho, conteudo) {
  let atual
  try {
    atual = readFileSync(caminho)
  } catch {
    atual = undefined
  }
  if (atual && Buffer.compare(atual, Buffer.from(conteudo)) === 0) return
  writeFileSync(caminho, conteudo)
  console.log(`gravado ${caminho.slice(RAIZ.length + 1)}`)
}

// O SVG tem viewBox de 64; a densidade renderiza a 4× o tamanho final antes de reduzir.
function rasterizar(svg, tamanho) {
  return sharp(svg, { density: 72 * (tamanho / 64) * 4 })
    .resize(tamanho, tamanho)
    .png()
    .toBuffer()
}

// ICO: cabeçalho de 6 bytes, uma entrada de 16 bytes por imagem, depois os PNGs na mesma ordem.
function montarIco(pngs) {
  const cabecalho = Buffer.alloc(6)
  cabecalho.writeUInt16LE(0, 0)
  cabecalho.writeUInt16LE(1, 2)
  cabecalho.writeUInt16LE(pngs.length, 4)
  let deslocamento = 6 + 16 * pngs.length
  const entradas = pngs.map(({ tamanho, png }) => {
    const entrada = Buffer.alloc(16)
    entrada.writeUInt8(tamanho, 0)
    entrada.writeUInt8(tamanho, 1)
    entrada.writeUInt8(0, 2)
    entrada.writeUInt8(0, 3)
    entrada.writeUInt16LE(1, 4)
    entrada.writeUInt16LE(32, 6)
    entrada.writeUInt32LE(png.length, 8)
    entrada.writeUInt32LE(deslocamento, 12)
    deslocamento += png.length
    return entrada
  })
  return Buffer.concat([cabecalho, ...entradas, ...pngs.map(({ png }) => png)])
}

const caminhoSvg = join(APP, 'icon.svg')
const svgTexto = TROCAS.reduce((texto, [de, para]) => texto.replace(de, para), readFileSync(caminhoSvg, 'utf8'))
gravarSeMudou(caminhoSvg, svgTexto)

const svg = Buffer.from(svgTexto)
const pngs = await Promise.all([16, 32, 48].map(async (tamanho) => ({ tamanho, png: await rasterizar(svg, tamanho) })))
gravarSeMudou(join(APP, 'favicon.ico'), montarIco(pngs))
gravarSeMudou(join(APP, 'apple-icon.png'), await rasterizar(svg, 180))
// Ícones do manifesto (adicionar à tela inicial): o SVG já tem o fundo papel com cantos arredondados.
for (const tamanho of [192, 512]) gravarSeMudou(join(PUBLIC, `icone-${tamanho}.png`), await rasterizar(svg, tamanho))
