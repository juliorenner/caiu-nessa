import type { Afirmacao, Respostas, Veredito } from '@/lib/afirmacoes'

export interface Resultado {
  acertos: number
  total: number
  acertosEsquerda: number
  acertosDireita: number
  acreditadasEsquerda: number // respondeu 'verdadeiro' numa afirmação falsa ou enganosa
  acreditadasDireita: number
}

export function calcularResultado(afirmacoes: Afirmacao[], respostas: Respostas): Resultado {
  const resultado: Resultado = {
    acertos: 0,
    total: afirmacoes.length,
    acertosEsquerda: 0,
    acertosDireita: 0,
    acreditadasEsquerda: 0,
    acreditadasDireita: 0,
  }
  for (const a of afirmacoes) {
    const resposta = respostas[a.id]
    const daEsquerda = a.lado === 'esquerda'
    if (resposta === a.veredito) {
      resultado.acertos++
      if (daEsquerda) resultado.acertosEsquerda++
      else resultado.acertosDireita++
    } else if (resposta === 'verdadeiro') {
      if (daEsquerda) resultado.acreditadasEsquerda++
      else resultado.acreditadasDireita++
    }
  }
  return resultado
}

export function ehQuase(veredito: Veredito, resposta: Veredito): boolean {
  return (veredito === 'falso' && resposta === 'enganoso') || (veredito === 'enganoso' && resposta === 'falso')
}
