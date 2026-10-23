import { DOMINIO } from '@/lib/site'

export const NOME_ARQUIVO = 'caiu-nessa-placar.png'

// Curto de propósito: o placar detalhado vai na imagem. O autor tirou a grade de emojis ("ficou muito comprido").
export function textoDeCompartilhar(p: { acertos: number; total: number; caiu: number }): string {
  const caiu = p.caiu === 0 ? 'não caí em nenhuma' : `caí em ${p.caiu}`
  return [`Fiz ${p.acertos}/${p.total} no Caiu Nessa? e ${caiu}. E você?`, DOMINIO].join('\n')
}
