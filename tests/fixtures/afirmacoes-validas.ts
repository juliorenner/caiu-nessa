import type { Afirmacao, Lado, Respostas, Veredito } from '@/lib/afirmacoes'

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
