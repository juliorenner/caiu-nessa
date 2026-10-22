import type { Resultado } from '@/lib/pontuacao'

export interface Avaliacao {
  titulo: string
  texto: string
  vies: string | null
}

const NAO_VERDADEIRAS_POR_LADO = 4
const NAO_VERDADEIRAS = NAO_VERDADEIRAS_POR_LADO * 2
const VERDADEIRAS_POR_LADO = 2
const VERDADEIRAS = VERDADEIRAS_POR_LADO * 2

type Eixo = 'acreditou' | 'desconfiou' | 'grau'

export function porcentagem(parte: number, todo: number): number {
  if (todo === 0) return 0
  return Math.round((parte / todo) * 100)
}

// O tipo de erro mais frequente; empates: acreditou > desconfiou > grau.
function eixoDominante(a: number, d: number, g: number): Eixo {
  if (a >= d && a >= g) return 'acreditou'
  if (d >= g) return 'desconfiou'
  return 'grau'
}

function textoDoEixo(eixo: Eixo, a: number, d: number, g: number, caiuFeio: boolean): string {
  if (eixo === 'acreditou') {
    const texto = `Você acreditou em ${porcentagem(a, NAO_VERDADEIRAS)}% das afirmações falsas ou enganosas.`
    return caiuFeio ? `${texto} Hora de desconfiar mais.` : texto
  }
  if (eixo === 'desconfiou') {
    const texto = `Você desconfiou de ${porcentagem(d, VERDADEIRAS)}% das verdades.`
    return caiuFeio ? `${texto} Nem tudo é mentira.` : texto
  }
  const texto = `Você percebeu o que não era verdade, mas errou o grau em ${g} delas: trocou mentira por enganoso, ou o contrário.`
  return caiuFeio ? `${texto} Vale conferir quais.` : texto
}

function viesDoEixo(eixo: Eixo, r: Resultado): string | null {
  if (eixo === 'acreditou') {
    if (r.acreditadasEsquerda + r.acreditadasDireita === 0) return null
    const e = porcentagem(r.acreditadasEsquerda, NAO_VERDADEIRAS_POR_LADO)
    const d = porcentagem(r.acreditadasDireita, NAO_VERDADEIRAS_POR_LADO)
    return `Você acreditou em ${e}% das falsas ou enganosas da esquerda e ${d}% das da direita.`
  }
  if (eixo === 'desconfiou') {
    if (r.desconfiadasEsquerda + r.desconfiadasDireita === 0) return null
    const e = porcentagem(r.desconfiadasEsquerda, VERDADEIRAS_POR_LADO)
    const d = porcentagem(r.desconfiadasDireita, VERDADEIRAS_POR_LADO)
    return `Você desconfiou de ${e}% das verdades da esquerda e ${d}% das da direita.`
  }
  if (r.grauErradoEsquerda + r.grauErradoDireita === 0) return null
  return `Você errou o grau em ${r.grauErradoEsquerda} afirmações da esquerda e ${r.grauErradoDireita} da direita.`
}

export function gerarAvaliacao(r: Resultado): Avaliacao {
  if (r.acertos === 12) {
    return { titulo: 'Imune', texto: 'Você não caiu em nenhuma. Nem as falsas te pegaram.', vies: null }
  }
  const a = r.acreditadasEsquerda + r.acreditadasDireita
  const d = r.desconfiadasEsquerda + r.desconfiadasDireita
  const g = r.grauErradoEsquerda + r.grauErradoDireita
  const eixo = eixoDominante(a, d, g)
  const vies = viesDoEixo(eixo, r)

  if (r.acertos >= 9) {
    return { titulo: 'Quase imune', texto: 'Você caiu em poucas, mas caiu. Vale conferir quais.', vies }
  }
  if (r.acertos >= 5) {
    return { titulo: 'Abre o olho', texto: textoDoEixo(eixo, a, d, g, false), vies }
  }
  return { titulo: 'Caiu feio', texto: textoDoEixo(eixo, a, d, g, true), vies }
}
