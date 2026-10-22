import type { Resultado } from '@/lib/pontuacao'

export interface Avaliacao {
  titulo: string
  texto: string
  vies: string
}

const NAO_VERDADEIRAS_POR_LADO = 4
const NAO_VERDADEIRAS = NAO_VERDADEIRAS_POR_LADO * 2

export function porcentagem(parte: number, todo: number): number {
  if (todo === 0) return 0
  return Math.round((parte / todo) * 100)
}

export function gerarAvaliacao(r: Resultado): Avaliacao {
  const p = porcentagem(r.acreditadasEsquerda + r.acreditadasDireita, NAO_VERDADEIRAS)
  const e = porcentagem(r.acreditadasEsquerda, NAO_VERDADEIRAS_POR_LADO)
  const d = porcentagem(r.acreditadasDireita, NAO_VERDADEIRAS_POR_LADO)
  const vies = `Você acreditou em ${e}% das falsas ou enganosas da esquerda e ${d}% das da direita.`

  if (r.acertos === 12) {
    return { titulo: 'Imune', texto: 'Você não caiu em nenhuma. Nem as falsas te pegaram.', vies }
  }
  if (r.acertos >= 9) {
    return { titulo: 'Quase imune', texto: 'Você caiu em poucas, mas caiu. Vale conferir quais.', vies }
  }
  if (r.acertos >= 5) {
    return { titulo: 'Abre o olho', texto: `Você acreditou em ${p}% das afirmações falsas ou enganosas.`, vies }
  }
  return {
    titulo: 'Caiu feio',
    texto: `Você acreditou em ${p}% das afirmações falsas ou enganosas. Hora de desconfiar mais.`,
    vies,
  }
}
