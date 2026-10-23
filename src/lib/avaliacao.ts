import type { Resultado } from '@/lib/pontuacao'

export interface Avaliacao {
  titulo: string
  texto: string
  vies: string | null
}

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

function textoDoEixo(eixo: Eixo, r: Resultado, a: number, d: number, g: number, caiuFeio: boolean): string {
  if (eixo === 'acreditou') {
    const texto = `Você acreditou em ${porcentagem(a, r.naoVerdadeirasEsquerda + r.naoVerdadeirasDireita)}% das afirmações falsas ou enganosas.`
    return caiuFeio ? `${texto} Hora de desconfiar mais.` : texto
  }
  if (eixo === 'desconfiou') {
    const texto = `Você desconfiou de ${porcentagem(d, r.verdadeirasEsquerda + r.verdadeirasDireita)}% das verdades.`
    return caiuFeio ? `${texto} Nem tudo é mentira.` : texto
  }
  const texto = `Você percebeu o que não era verdade, mas errou o grau em ${g === 1 ? 'uma' : g} delas: trocou mentira por enganoso, ou o contrário.`
  return caiuFeio ? `${texto} Vale conferir quais.` : texto
}

function viesDoEixo(eixo: Eixo, r: Resultado): string | null {
  if (eixo === 'acreditou') {
    if (r.acreditadasEsquerda + r.acreditadasDireita === 0) return null
    const e = porcentagem(r.acreditadasEsquerda, r.naoVerdadeirasEsquerda)
    const d = porcentagem(r.acreditadasDireita, r.naoVerdadeirasDireita)
    return `Você acreditou em ${e}% das falsas ou enganosas da esquerda e ${d}% das da direita.`
  }
  if (eixo === 'desconfiou') {
    if (r.desconfiadasEsquerda + r.desconfiadasDireita === 0) return null
    const e = porcentagem(r.desconfiadasEsquerda, r.verdadeirasEsquerda)
    const d = porcentagem(r.desconfiadasDireita, r.verdadeirasDireita)
    return `Você desconfiou de ${e}% das verdades da esquerda e ${d}% das da direita.`
  }
  if (r.grauErradoEsquerda + r.grauErradoDireita === 0) return null
  return `Você errou o grau em ${r.grauErradoEsquerda} ${r.grauErradoEsquerda === 1 ? 'afirmação' : 'afirmações'} da esquerda e ${r.grauErradoDireita} da direita.`
}

// Faixas proporcionais ao tamanho da rodada (Imune / Quase imune / Abre o olho): 8 → 8/6/4, 6 → 6/5/3, 12 → 12/9/5.
export function gerarAvaliacao(r: Resultado): Avaliacao {
  if (r.acertos === r.total) {
    return { titulo: 'Imune', texto: 'Você não caiu em nenhuma. Nem as falsas te pegaram.', vies: null }
  }
  const a = r.acreditadasEsquerda + r.acreditadasDireita
  const d = r.desconfiadasEsquerda + r.desconfiadasDireita
  const g = r.grauErradoEsquerda + r.grauErradoDireita
  const eixo = eixoDominante(a, d, g)
  const vies = viesDoEixo(eixo, r)

  if (r.acertos >= Math.ceil(0.75 * r.total)) {
    return { titulo: 'Quase imune', texto: 'Você caiu em poucas, mas caiu. Vale conferir quais.', vies }
  }
  if (r.acertos >= Math.ceil(0.4 * r.total)) {
    return { titulo: 'Abre o olho', texto: textoDoEixo(eixo, r, a, d, g, false), vies }
  }
  return { titulo: 'Caiu feio', texto: textoDoEixo(eixo, r, a, d, g, true), vies }
}
