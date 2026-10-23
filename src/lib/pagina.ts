// Leitura de uma página de checagem para a revisão de fatos: devolve o texto legível, inteiro, com os
// rótulos que ficam só em atributos (o Aos Fatos marca a fala com data-stamp="falso" e desenha o selo via
// CSS) trazidos para o texto como [SELO: FALSO]. Só aceita as agências da lista (`fonteEhPermitida`).
import { fonteEhPermitida } from './afirmacoes'

const ENTIDADES: Record<string, string> = {
  '&nbsp;': ' ',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
}

// Sem regex sobre <script>/<style> (CodeQL js/bad-tag-filter): tira os blocos por índice de tag.
function semBlocos(html: string, tag: 'script' | 'style'): string {
  const partes: string[] = []
  let i = 0
  const abre = `<${tag}`
  const fecha = `</${tag}>`
  for (;;) {
    const a = html.toLowerCase().indexOf(abre, i)
    if (a < 0) break
    partes.push(html.slice(i, a))
    const f = html.toLowerCase().indexOf(fecha, a)
    if (f < 0) return partes.join('')
    i = f + fecha.length
  }
  partes.push(html.slice(i))
  return partes.join('')
}

export function textoLegivel(html: string): string {
  const semCodigo = semBlocos(semBlocos(html, 'script'), 'style')
  return semCodigo
    .replace(/<[^>]*\bdata-stamp="([^"]+)"[^>]*>/gi, (_, selo: string) => `\n[SELO: ${selo.toUpperCase()}]\n`)
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/blockquote|\/tr)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|quot|#39|apos|amp|lt|gt);/g, (e) => ENTIDADES[e] ?? e)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export async function lerPagina(url: string): Promise<string> {
  if (!fonteEhPermitida(url)) throw new Error(`fora das agências aceitas: ${url}`)
  const resposta = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; caiu-nessa-revisao)', accept: 'text/html' },
  })
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status} em ${url}`)
  return textoLegivel(await resposta.text())
}
