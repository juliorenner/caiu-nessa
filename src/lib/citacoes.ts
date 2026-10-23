// Conferência de citação contra o texto da página da agência: normaliza acentos, aspas e pontuação e
// procura uma janela de palavras consecutivas da citação. Serve de aviso, não de bloqueio: algumas
// páginas não entregam o texto num fetch simples, e citações antigas podem ser paráfrase.
export const JANELA_DE_PALAVRAS = 6

export function normalizarParaBusca(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’´`]/g, "'")
    .replace(/[.,;:!?…"'()\-–—]/g, '')
    .replace(/[ \s]+/g, ' ')
    .trim()
}

// Só tira as tags: o conteúdo de <script> e <style> fica como texto, o que não atrapalha uma busca por
// trecho (e o JSON-LD de muitas páginas até repete o texto da matéria). Filtrar <script> por regex é
// frágil e o CodeQL aponta (js/bad-tag-filter).
export function textoDoHtml(html: string): string {
  return normalizarParaBusca(
    html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, '&'),
  )
}

// true se alguma sequência de JANELA_DE_PALAVRAS palavras da citação aparece no texto (já normalizado por
// textoDoHtml). Citações mais curtas que a janela precisam aparecer inteiras.
export function citacaoAparece(citacao: string, textoNormalizado: string, janela: number = JANELA_DE_PALAVRAS): boolean {
  const palavras = normalizarParaBusca(citacao).split(' ').filter(Boolean)
  if (palavras.length === 0) return false
  if (palavras.length <= janela) return textoNormalizado.includes(palavras.join(' '))
  for (let i = 0; i + janela <= palavras.length; i++) {
    if (textoNormalizado.includes(palavras.slice(i, i + janela).join(' '))) return true
  }
  return false
}
