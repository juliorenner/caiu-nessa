// Fluxo dos botões Compartilhar placar (link) e Mandar para os stories (imagem). Detecção por recurso, não por aparelho.
export type Desfecho = 'folha' | 'copiado' | 'falhou' | 'cancelado' | 'indisponivel'

// Pelo nome, não por instanceof: polyfills e erros embrulhados chegam como Error comum.
function fechouAFolha(erro: unknown): boolean {
  return (erro as { name?: unknown } | null)?.name === 'AbortError'
}

// `share` é chamado antes de qualquer await: iOS Safari e Chrome só aceitam enquanto o toque é "fresco".
// `link`: a URL vai só em `url` (nunca duplicada no texto); sem share, copia o texto com a URL.
// `imagem`: o arquivo com o texto com a URL; sem suporte a arquivos, 'indisponivel' (a tela oferece baixar).
// `modo` e `textoComUrl` têm padrão ('link' e `texto`) só enquanto ResultadoFinal não passa os dois.
export async function compartilhar(p: {
  modo?: 'link' | 'imagem'
  texto: string
  textoComUrl?: string
  url: string
  titulo: string
  arquivo: File | null
  nav?: Navigator
}): Promise<Desfecho> {
  const nav = p.nav ?? globalThis.navigator
  const textoComUrl = p.textoComUrl ?? p.texto
  if (p.modo === 'imagem') {
    const files = p.arquivo ? [p.arquivo] : null
    if (!files || typeof nav.share !== 'function' || !nav.canShare?.({ files })) return 'indisponivel'
    try {
      await nav.share({ files, text: textoComUrl, title: p.titulo })
      return 'folha'
    } catch (erro) {
      return fechouAFolha(erro) ? 'cancelado' : 'falhou'
    }
  }
  if (typeof nav.share === 'function') {
    try {
      await nav.share({ text: p.texto, url: p.url, title: p.titulo })
      return 'folha'
    } catch (erro) {
      // A pessoa fechou a folha: silêncio. Qualquer outra falha cai para copiar.
      if (fechouAFolha(erro)) return 'cancelado'
    }
  }
  try {
    // Sem clipboard (contexto inseguro, navegador antigo), o acesso lança e conta como falha.
    await nav.clipboard.writeText(textoComUrl)
    return 'copiado'
  } catch {
    return 'falhou'
  }
}

// A imagem dos stories, buscada ao montar a tela de placar; null em qualquer falha.
export async function buscarArquivo(url: string, nome: string, fetchFn?: typeof fetch): Promise<File | null> {
  try {
    const resposta = await (fetchFn ? fetchFn(url) : fetch(url))
    if (!resposta.ok) return null
    return new File([await resposta.blob()], nome, { type: 'image/png' })
  } catch {
    return null
  }
}
