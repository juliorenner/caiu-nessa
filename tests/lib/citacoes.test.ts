import { describe, expect, it } from 'vitest'
import { citacaoAparece, JANELA_DE_PALAVRAS, normalizarParaBusca, textoDoHtml } from '@/lib/citacoes'

describe('normalizarParaBusca', () => {
  it('tira acentos, caixa, aspas tipográficas, pontuação e espaços repetidos', () => {
    expect(normalizarParaBusca('  “Não é bem assim”, disse — à   noite! ')).toBe('nao e bem assim disse a noite')
  })
})

describe('textoDoHtml', () => {
  it('remove tags, scripts e estilos e decodifica entidades comuns', () => {
    const html = '<html><head><style>p{}</style><script>var x = "y"</script></head><body><p>Inflação de&nbsp;alimentos &quot;caiu&quot; &amp; subiu</p></body></html>'
    expect(textoDoHtml(html)).toBe('inflacao de alimentos caiu & subiu')
  })
})

describe('citacaoAparece', () => {
  const pagina = textoDoHtml('<p>Ele afirmou: “Nos quatro anos do governo deles, a inflação de alimentos estava em 56,17%.”</p>')
  it('janela padrão de 6 palavras', () => {
    expect(JANELA_DE_PALAVRAS).toBe(6)
  })
  it('acha a citação literal mesmo com aspas e acentos diferentes', () => {
    expect(citacaoAparece('nos quatro anos do governo deles, a inflacao de alimentos', pagina)).toBe(true)
  })
  it('acha por uma janela no meio, mesmo que o começo seja diferente', () => {
    expect(citacaoAparece('Olha, a inflação de alimentos estava em 56,17%', pagina)).toBe(true)
  })
  it('não acha paráfrase', () => {
    expect(citacaoAparece('A inflação dos alimentos no governo anterior chegou a 56%', pagina)).toBe(false)
  })
  it('citação curta precisa aparecer inteira; vazia nunca aparece', () => {
    expect(citacaoAparece('inflação de alimentos', pagina)).toBe(true)
    expect(citacaoAparece('inflação de bananas', pagina)).toBe(false)
    expect(citacaoAparece('', pagina)).toBe(false)
  })
})
