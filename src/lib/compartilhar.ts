export const NOME_ARQUIVO = 'caiu-nessa-placar.png'

// Curto de propósito: o placar detalhado vai na imagem. O autor tirou a grade de emojis ("ficou muito comprido").
// Com `url` (absoluta, a do resultado), ela vem na segunda linha: é o texto que vai junto da imagem ou para o clipboard.
export function textoDeCompartilhar(p: { acertos: number; total: number; caiu: number; url?: string }): string {
  const caiu = p.caiu === 0 ? 'não caí em nenhuma' : `caí em ${p.caiu}`
  const frase = `Fiz ${p.acertos}/${p.total} no Caiu Nessa? e ${caiu}. E você?`
  return p.url ? [frase, p.url].join('\n') : frase
}
