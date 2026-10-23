import { PARES, VEREDITOS, type Afirmacao, type Lado, type Respostas, type Veredito } from '@/lib/afirmacoes'
import { COMPOSICAO_PRIMEIRA } from '@/lib/rodadas'

function criar(id: string, lado: Lado, veredito: Veredito): Afirmacao {
  return {
    id,
    texto: `Afirmação de teste ${id}`,
    citacao: `Citação original de teste ${id}`,
    lado,
    autor: `Autor de teste ${id}`,
    veredito,
    explicacao: `Explicação de teste ${id}`,
    fonte_nome: 'Aos Fatos',
    fonte_url: `https://aosfatos.org/noticias/teste-${id}`,
    data_checagem: '2026-10-01',
  }
}

// Pool mínimo (2 por par); também é uma rodada histórica de 12.
export const afirmacoesValidas: Afirmacao[] = [
  criar('e1', 'esquerda', 'verdadeiro'),
  criar('e2', 'esquerda', 'verdadeiro'),
  criar('e3', 'esquerda', 'falso'),
  criar('e4', 'esquerda', 'falso'),
  criar('e5', 'esquerda', 'enganoso'),
  criar('e6', 'esquerda', 'enganoso'),
  criar('d1', 'direita', 'verdadeiro'),
  criar('d2', 'direita', 'verdadeiro'),
  criar('d3', 'direita', 'falso'),
  criar('d4', 'direita', 'falso'),
  criar('d5', 'direita', 'enganoso'),
  criar('d6', 'direita', 'enganoso'),
]

export const todasCertas: Respostas = Object.fromEntries(
  afirmacoesValidas.map((a) => [a.id, a.veredito]),
)

// Rodada extra de 6: o primeiro item de cada par (lado, veredito), na ordem de PARES.
export const rodadaDeSeis: Afirmacao[] = PARES.map(
  ({ lado, veredito }) => afirmacoesValidas.find((a) => a.lado === lado && a.veredito === veredito)!,
)

// Respostas todas certas para uma rodada.
export function respostasCertas(rodada: readonly Afirmacao[]): Respostas {
  return Object.fromEntries(rodada.map((a) => [a.id, a.veredito]))
}

// Primeira rodada de 8: os primeiros itens de cada par na quantidade de COMPOSICAO_PRIMEIRA (e1, e3, e4, e5, d1, d3, d4, d5).
export const rodadaDeOito: Afirmacao[] = (['esquerda', 'direita'] as const).flatMap((lado) =>
  VEREDITOS.flatMap((veredito) =>
    afirmacoesValidas.filter((a) => a.lado === lado && a.veredito === veredito).slice(0, COMPOSICAO_PRIMEIRA[veredito]),
  ),
)
