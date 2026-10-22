// Fluxo do botão Compartilhar placar. Detecção por recurso, não por aparelho.
export type Desfecho = 'folha' | 'copiado' | 'falhou' | 'cancelado'

// `share` é chamado antes de qualquer await: iOS Safari e Chrome só aceitam enquanto o toque é "fresco".
export async function compartilhar(p: {
  texto: string
  url: string
  titulo: string
  arquivo: File | null
  nav?: Navigator
}): Promise<Desfecho> {
  const nav = p.nav ?? globalThis.navigator
  if (typeof nav.share === 'function') {
    const files = p.arquivo ? [p.arquivo] : null
    const dados: ShareData =
      files && nav.canShare?.({ files })
        ? { files, text: p.texto, title: p.titulo }
        : { text: p.texto, url: p.url, title: p.titulo }
    try {
      await nav.share(dados)
      return 'folha'
    } catch (erro) {
      // A pessoa fechou a folha: silêncio. Qualquer outra falha cai para copiar.
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado'
    }
  }
  try {
    // Sem clipboard (contexto inseguro, navegador antigo), o acesso lança e conta como falha.
    await nav.clipboard.writeText(p.texto)
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
