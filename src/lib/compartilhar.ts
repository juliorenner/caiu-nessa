import type { Casa } from '@/lib/cartao'
import { DOMINIO } from '@/lib/site'

export const NOME_ARQUIVO = 'caiu-nessa-placar.png'

const EMOJI: Record<Casa, string> = { acerto: '✅', erro: '❌', quase: '🤔' }

// Uma casa por afirmação na ordem jogada, 6 por linha.
export function gradeDeCasas(casas: Casa[]): string {
  const linhas: string[] = []
  for (let i = 0; i < casas.length; i += 6) {
    linhas.push(casas.slice(i, i + 6).map(casa => EMOJI[casa]).join(''))
  }
  return linhas.join('\n')
}

export function textoDeCompartilhar(p: { acertos: number; total: number; caiu: number; casas: Casa[] }): string {
  const caiu = p.caiu === 0 ? 'não caí em nenhuma' : `caí em ${p.caiu}`
  return [`Fiz ${p.acertos}/${p.total} no Caiu Nessa? e ${caiu}. E você?`, gradeDeCasas(p.casas), DOMINIO].join('\n')
}
