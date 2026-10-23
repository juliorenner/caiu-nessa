import { describe, expect, it, vi, afterEach } from 'vitest'
import { lerPagina, textoLegivel } from '@/lib/pagina'

describe('textoLegivel', () => {
  it('tira script e style, quebra linha em blocos e decodifica entidades', () => {
    const html =
      '<html><head><style>p{color:red}</style><script>var x="<p>não</p>"</script></head>' +
      '<body><p class="a">Primeira &amp; <b>segunda</b></p><div>terceira&nbsp;linha</div></body></html>'
    expect(textoLegivel(html)).toBe('Primeira & segunda\nterceira linha')
  })

  it('traz o selo do atributo data-stamp para o texto, em caixa alta', () => {
    const html =
      '<p><span>Eu acho que tem eventos climáticos extremos.</span></p>' +
      '<blockquote data-stamp="falso" class="x"><p>Uma revisão de 88.125 artigos…</p></blockquote>'
    expect(textoLegivel(html)).toBe(
      'Eu acho que tem eventos climáticos extremos.\n[SELO: FALSO]\nUma revisão de 88.125 artigos…',
    )
  })
})

describe('lerPagina', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('recusa domínio fora das agências sem buscar nada', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(lerPagina('https://exemplo.com/x')).rejects.toThrow('fora das agências aceitas')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('busca uma página aceita e devolve o texto legível', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<p>Checagem <b>FALSO</b></p>', { status: 200 })),
    )
    await expect(lerPagina('https://www.aosfatos.org/noticias/x/')).resolves.toBe('Checagem FALSO')
  })

  it('falha com o status quando a página não responde ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    await expect(lerPagina('https://www.aosfatos.org/noticias/x/')).rejects.toThrow('HTTP 404')
  })
})
