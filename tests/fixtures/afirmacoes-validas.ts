import type { Afirmacao, Lado, Respostas } from '@/lib/afirmacoes'

function criar(id: string, lado: Lado, veredito: boolean): Afirmacao {
  return {
    id,
    texto: `Afirmação de teste ${id}`,
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
  criar('e1', 'esquerda', true),
  criar('e2', 'esquerda', true),
  criar('e3', 'esquerda', true),
  criar('e4', 'esquerda', false),
  criar('e5', 'esquerda', false),
  criar('e6', 'esquerda', false),
  criar('d1', 'direita', true),
  criar('d2', 'direita', true),
  criar('d3', 'direita', true),
  criar('d4', 'direita', false),
  criar('d5', 'direita', false),
  criar('d6', 'direita', false),
]

export const todasCertas: Respostas = Object.fromEntries(
  afirmacoesValidas.map((a) => [a.id, a.veredito]),
)
