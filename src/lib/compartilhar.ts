export const NOME_ARQUIVO = 'caiu-nessa-placar.png'

// Link universal do WhatsApp com o texto já escrito: abre o app no celular e o WhatsApp Web no desktop.
// O texto leva a URL do resultado: é dela que o WhatsApp monta a prévia com o placar.
export function urlDoWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}

// Curto de propósito: o placar detalhado vai na imagem. O autor tirou a grade de emojis ("ficou muito comprido").
// Com `url` (absoluta, a do resultado), ela vem na segunda linha: é o texto que vai junto da imagem ou para o clipboard.
export function textoDeCompartilhar(p: { acertos: number; total: number; caiu: number; url?: string }): string {
  const caiu = p.caiu === 0 ? 'não caí em nenhuma' : `caí em ${p.caiu}`
  const frase = `Fiz ${p.acertos}/${p.total} no Caiu Nessa? e ${caiu}. E você?`
  return p.url ? [frase, p.url].join('\n') : frase
}

export const NOME_ARQUIVO_CONVITE = 'caiu-nessa-convite.png'

// Sem placar: para quem prefere chamar os amigos sem dizer quantas acertou ou errou.
export function textoDeConvite(url?: string): string {
  const frase = 'Já joguei o Caiu Nessa? Agora é sua vez: será que você cai?'
  return url ? [frase, url].join('\n') : frase
}

// O mesmo convite, da home: quem compartilha ali pode ainda não ter jogado, então sem "já joguei".
export function textoDeChamado(url?: string): string {
  const frase = 'Conhece o Caiu Nessa? É um quiz sobre o mundo político brasileiro: será que você cai?'
  return url ? [frase, url].join('\n') : frase
}

export const NOME_ARQUIVO_PERCENTIL = 'caiu-nessa-percentil.png'

// A comparação sem o placar: quanto foi bem, não quantas errou.
export function textoDePercentil(percentil: number, url?: string): string {
  const frase = `Acertei mais que ${percentil}% das pessoas no Caiu Nessa? Como será que você se sai?`
  return url ? [frase, url].join('\n') : frase
}
