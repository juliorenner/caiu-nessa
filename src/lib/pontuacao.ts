import type { Afirmacao, Respostas, Veredito } from '@/lib/afirmacoes'

export interface Resultado {
  acertos: number
  total: number
  acertosEsquerda: number
  acertosDireita: number
  acreditadasEsquerda: number // respondeu 'verdadeiro' numa afirmação falsa ou enganosa
  acreditadasDireita: number
  desconfiadasEsquerda: number // respondeu 'falso' ou 'enganoso' numa afirmação verdadeira
  desconfiadasDireita: number
  grauErradoEsquerda: number // confundiu 'falso' com 'enganoso', ou o contrário
  grauErradoDireita: number
  // composição da rodada, independente das respostas
  verdadeirasEsquerda: number
  verdadeirasDireita: number
  naoVerdadeirasEsquerda: number // falsas ou enganosas
  naoVerdadeirasDireita: number
}

export function calcularResultado(afirmacoes: Afirmacao[], respostas: Respostas): Resultado {
  const resultado: Resultado = {
    acertos: 0,
    total: afirmacoes.length,
    acertosEsquerda: 0,
    acertosDireita: 0,
    acreditadasEsquerda: 0,
    acreditadasDireita: 0,
    desconfiadasEsquerda: 0,
    desconfiadasDireita: 0,
    grauErradoEsquerda: 0,
    grauErradoDireita: 0,
    verdadeirasEsquerda: 0,
    verdadeirasDireita: 0,
    naoVerdadeirasEsquerda: 0,
    naoVerdadeirasDireita: 0,
  }
  for (const a of afirmacoes) {
    const resposta = respostas[a.id]
    const daEsquerda = a.lado === 'esquerda'
    if (a.veredito === 'verdadeiro') {
      if (daEsquerda) resultado.verdadeirasEsquerda++
      else resultado.verdadeirasDireita++
    } else if (daEsquerda) resultado.naoVerdadeirasEsquerda++
    else resultado.naoVerdadeirasDireita++
    if (resposta === a.veredito) {
      resultado.acertos++
      if (daEsquerda) resultado.acertosEsquerda++
      else resultado.acertosDireita++
    } else if (resposta === undefined) {
      // resposta ausente: erro, sem classificação
    } else if (resposta === 'verdadeiro') {
      if (daEsquerda) resultado.acreditadasEsquerda++
      else resultado.acreditadasDireita++
    } else if (a.veredito === 'verdadeiro') {
      if (daEsquerda) resultado.desconfiadasEsquerda++
      else resultado.desconfiadasDireita++
    } else if (ehQuase(a.veredito, resposta)) {
      if (daEsquerda) resultado.grauErradoEsquerda++
      else resultado.grauErradoDireita++
    }
  }
  return resultado
}

export function ehQuase(veredito: Veredito, resposta: Veredito): boolean {
  return (veredito === 'falso' && resposta === 'enganoso') || (veredito === 'enganoso' && resposta === 'falso')
}
