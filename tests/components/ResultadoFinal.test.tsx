import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResultadoFinal } from '@/components/ResultadoFinal'
import type { Casa } from '@/lib/cartao'
import { NOME_ARQUIVO } from '@/lib/compartilhar'
import type { RespostaResultado } from '@/lib/resultado-api'
import { SITE_URL, TITULO } from '@/lib/site'

const dados: RespostaResultado = {
  resultado: {
    acertos: 4,
    total: 12,
    acertosEsquerda: 2,
    acertosDireita: 2,
    acreditadasEsquerda: 2,
    acreditadasDireita: 1,
    desconfiadasEsquerda: 0,
    desconfiadasDireita: 0,
    grauErradoEsquerda: 0,
    grauErradoDireita: 0,
    verdadeirasEsquerda: 2,
    verdadeirasDireita: 2,
    naoVerdadeirasEsquerda: 4,
    naoVerdadeirasDireita: 4,
  },
  avaliacao: { titulo: 'Caiu feio', texto: 'Texto.', vies: null },
  estatisticas: null,
  percentilAbaixo: null,
  estatisticasIndisponiveis: false,
}

const casas: Casa[] = ['acerto', 'erro', 'acerto', 'acerto', 'erro', 'quase', 'erro', 'acerto', 'erro', 'erro', 'quase', 'erro']
const texto = 'Fiz 4/12 no Caiu Nessa? e caí em 3. E você?'
const urlResultado = `${SITE_URL}/r/4-12-3-caiu-feio-aeaaeqeaeeqe`
const textoComUrl = `${texto}\n${urlResultado}`

function renderizar() {
  return render(
    <ResultadoFinal dados={dados} rodada={1} acumulado={{ acertos: 4, total: 12 }} casas={casas} onContinuar={async () => 'fim'} />,
  )
}

const aviso = () => document.querySelector('p[aria-live="polite"]')
const botao = () => screen.getByRole('button', { name: 'Mais opções de compartilhar' })
const stories = () => screen.getByRole('button', { name: 'Mandar para o Instagram' })
// Deixa o fetch pré-buscado resolver e o estado assentar.
const assentar = () => act(() => new Promise(r => setTimeout(r, 0)))

function stubNavegador(n: { share?: unknown; canShare?: unknown; writeText?: unknown }) {
  vi.stubGlobal('navigator', {
    share: n.share,
    canShare: n.canShare,
    clipboard: n.writeText ? { writeText: n.writeText } : undefined,
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['png']) }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('ResultadoFinal: político em marca-d\'água', () => {
  it('desenho decorativo, sem toque, e a ficha sem ícone', () => {
    stubNavegador({})
    const { container } = renderizar()
    const marca = container.querySelector('[aria-hidden].pointer-events-none')
    expect(marca).not.toBeNull()
    expect(marca!.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('[data-ficha] svg')).toBeNull()
    // Sem canShare não há Instagram. Os rótulos visíveis são curtos; o nome completo vai no aria-label.
    expect(screen.getAllByRole('button').map(b => b.getAttribute('aria-label') ?? b.textContent)).toEqual([
      'Mais opções de compartilhar',
      'Continuar jogando',
    ])
    expect(screen.getAllByRole('link').map(l => l.getAttribute('aria-label') ?? l.textContent)).toEqual([
      'Mandar no WhatsApp',
      'Baixar imagem para os stories',
      'Jogar de novo',
      'Jogar de novo',
      'Como escolhemos as afirmações',
      'Ver todas as afirmações e suas fontes',
    ])
  })
})

describe('ResultadoFinal: suas respostas', () => {
  it('sem respostas, não há lista', () => {
    stubNavegador({})
    const { container } = renderizar()
    expect(container.querySelector('details')).toBeNull()
  })

  it('com respostas, a lista vem depois de "Continuar jogando" no DOM', () => {
    stubNavegador({})
    const { container } = render(
      <ResultadoFinal
        dados={dados}
        rodada={1}
        acumulado={{ acertos: 4, total: 12 }}
        casas={casas}
        respostas={[{ id: 'a1', texto: 'Uma afirmação.', veredito: 'falso', casa: 'erro' }]}
        onContinuar={async () => 'fim'}
      />,
    )
    const details = container.querySelector('details')!
    expect(details.querySelector('summary')).toHaveTextContent('Suas respostas (4 de 12)')
    const continuar = screen.getByRole('button', { name: 'Continuar jogando' })
    expect(continuar.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('"Jogar de novo" e os links de fim de tela aparecem uma vez por tamanho', () => {
    stubNavegador({})
    renderizar()
    const jogar = screen.getAllByRole('link', { name: 'Jogar de novo' })
    expect(jogar).toHaveLength(2)
    expect(jogar.filter(l => l.classList.contains('lg:hidden'))).toHaveLength(1)
    expect(jogar.filter(l => l.classList.contains('max-lg:hidden') && l.classList.contains('lg:border-dashed'))).toHaveLength(1)
    for (const nome of ['Como escolhemos as afirmações', 'Ver todas as afirmações e suas fontes']) {
      expect(screen.getByRole('link', { name: nome })).toHaveClass('lg:hidden')
    }
  })
})

describe('ResultadoFinal: compartilhar', () => {
  it('busca a imagem dos stories ao montar', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetch).mock.calls[0][0]).toMatch(/^\/cartao\?a=4&t=12&c=3&f=caiu-feio&g=aeaaeqeaeeqe$/)
  })

  it('Mais (compartilhar): share com texto, url do resultado e título, sem files', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    expect(share).toHaveBeenCalledTimes(1)
    expect(share).toHaveBeenCalledWith({ text: texto, url: urlResultado, title: TITULO })
  })

  it('Mais (compartilhar) chama share na hora, com a imagem ainda chegando', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share })
    renderizar()
    fireEvent.click(botao())
    expect(share).toHaveBeenCalledWith({ text: texto, url: urlResultado, title: TITULO })
  })

  it('AbortError: nada no aviso', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share: vi.fn().mockRejectedValue(new DOMException('fechou', 'AbortError')), writeText })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    await assentar()
    expect(aviso()).toHaveTextContent(/^$/)
    expect(writeText).not.toHaveBeenCalled()
  })

  it('share falha por outro motivo: copia o texto com a URL e mostra Texto copiado', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share: vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError')), writeText })
    renderizar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Texto copiado'))
    expect(writeText).toHaveBeenCalledWith(textoComUrl)
  })

  it('sem share: copia o texto com a URL, mostra Texto copiado por 2 s', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ writeText })
    renderizar()
    await assentar()
    vi.useFakeTimers()
    fireEvent.click(botao())
    await act(async () => {})
    expect(writeText).toHaveBeenCalledWith(textoComUrl)
    expect(aviso()).toHaveTextContent('Texto copiado')
    act(() => vi.advanceTimersByTime(1999))
    expect(aviso()).toHaveTextContent('Texto copiado')
    act(() => vi.advanceTimersByTime(1))
    expect(aviso()).toHaveTextContent(/^$/)
  })

  it('clipboard recusa: Não deu para copiar', async () => {
    stubNavegador({ writeText: vi.fn().mockRejectedValue(new Error('negado')) })
    renderizar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Não deu para copiar'))
  })

  it('folha abre depois de Não deu para copiar: o aviso some', async () => {
    const share = vi.fn().mockRejectedValueOnce(new DOMException('negado', 'NotAllowedError')).mockResolvedValue(undefined)
    stubNavegador({ share, writeText: vi.fn().mockRejectedValue(new Error('negado')) })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Não deu para copiar'))
    fireEvent.click(botao())
    await assentar()
    expect(share).toHaveBeenCalledTimes(2)
    expect(aviso()).toHaveTextContent(/^$/)
  })

  it('canShare aceita arquivos e imagem pré-buscada: Instagram manda files e o texto com a URL', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    await assentar()
    fireEvent.click(stories())
    expect(share).toHaveBeenCalledTimes(1)
    const [dadosShare] = share.mock.calls[0]
    expect(dadosShare.files).toHaveLength(1)
    expect(dadosShare.files[0]).toBeInstanceOf(File)
    expect(dadosShare.files[0].name).toBe(NOME_ARQUIVO)
    expect(dadosShare.text).toBe(textoComUrl)
    expect(dadosShare.title).toBe(TITULO)
    expect(dadosShare).not.toHaveProperty('url')
  })

  it('sem canShare: Instagram não aparece', async () => {
    stubNavegador({ share: vi.fn() })
    renderizar()
    await assentar()
    expect(screen.queryByRole('button', { name: 'Mandar para o Instagram' })).not.toBeInTheDocument()
  })

  it('canShare lança: Instagram não aparece', async () => {
    stubNavegador({
      share: vi.fn(),
      canShare: () => {
        throw new Error('quebrou')
      },
    })
    renderizar()
    await assentar()
    expect(screen.queryByRole('button', { name: 'Mandar para o Instagram' })).not.toBeInTheDocument()
  })

  it('imagem ainda carregando: Instagram avisa e não chama share', async () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    await assentar()
    fireEvent.click(stories())
    await waitFor(() => expect(aviso()).toHaveTextContent('Imagem ainda carregando…'))
    expect(share).not.toHaveBeenCalled()
  })

  it('busca da imagem falhou: Instagram avisa que não carregou', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede')))
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    await assentar()
    fireEvent.click(stories())
    await waitFor(() => expect(aviso()).toHaveTextContent('Não deu para carregar a imagem'))
    expect(share).not.toHaveBeenCalled()
  })

  it('aviso de carregando some quando a imagem chega', async () => {
    let resolver: (v: unknown) => void = () => {}
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(r => (resolver = r))))
    stubNavegador({ share: vi.fn().mockResolvedValue(undefined), canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    await assentar()
    fireEvent.click(stories())
    await waitFor(() => expect(aviso()).toHaveTextContent('Imagem ainda carregando…'))
    await act(async () => {
      resolver({ ok: true, blob: async () => new Blob(['png']) })
    })
    await waitFor(() => expect(aviso()).toHaveTextContent(''))
  })

  it('stories recusado: Não deu para mandar a imagem, sem copiar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError'))
    stubNavegador({ share, canShare: () => true, writeText })
    renderizar()
    await assentar()
    fireEvent.click(stories())
    await waitFor(() => expect(aviso()).toHaveTextContent('Não deu para mandar a imagem'))
    expect(writeText).not.toHaveBeenCalled()
  })

  it('link Baixar imagem para os stories baixa o cartão', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    const link = screen.getByRole('link', { name: 'Baixar imagem para os stories' })
    expect(link).toHaveAttribute('download', NOME_ARQUIVO)
    expect(link.getAttribute('href')).toMatch(/^\/cartao\?a=/)
  })

  it('ordem: WhatsApp, Instagram, Baixar, Mais, aviso, Continuar jogando; Jogar de novo é link e a linha Acertei sai', async () => {
    stubNavegador({ share: vi.fn(), canShare: () => true })
    renderizar()
    await assentar()
    const whatsapp = screen.getByRole('link', { name: 'Mandar no WhatsApp' })
    const instagram = stories()
    const baixar = screen.getByRole('link', { name: 'Baixar imagem para os stories' })
    const mais = botao()
    const continuar = screen.getByRole('button', { name: 'Continuar jogando' })
    const p = aviso()!
    const segue = (a: Element, b: Element) => expect(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    segue(whatsapp, instagram)
    segue(instagram, baixar)
    segue(baixar, mais)
    segue(mais, p)
    segue(p, continuar)
    expect(screen.getByText('Compartilhar')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Jogar de novo' }).map(l => l.getAttribute('href'))).toEqual(['/quiz', '/quiz'])
    expect(screen.queryByText(/Acertei/)).not.toBeInTheDocument()
  })

  it('WhatsApp: link wa.me com o texto e a URL do resultado, em nova aba', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    const link = screen.getByRole('link', { name: 'Mandar no WhatsApp' })
    expect(link).toHaveAttribute('href', `https://wa.me/?text=${encodeURIComponent(textoComUrl)}`)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

describe('ResultadoFinal: registra cada compartilhar', () => {
  // Corpos dos POSTs para /api/evento; o fetch da imagem pré-buscada fica de fora.
  const eventosEnviados = () =>
    vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => url === '/api/evento')
      .map(([, init]) => JSON.parse(String(init?.body)))

  it('Mais (compartilhar) copiado: registra link/copiado', async () => {
    stubNavegador({ writeText: vi.fn().mockResolvedValue(undefined) })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Texto copiado'))
    expect(eventosEnviados()).toEqual([{ tipo: 'compartilhar', dados: { modo: 'link', resultado: 'copiado' } }])
  })

  it('Instagram cancelado: registra imagem/cancelado e o aviso fica vazio', async () => {
    stubNavegador({ share: vi.fn().mockRejectedValue(new DOMException('fechou', 'AbortError')), canShare: () => true })
    renderizar()
    await assentar()
    fireEvent.click(stories())
    await waitFor(() => expect(eventosEnviados()).toHaveLength(1))
    expect(eventosEnviados()).toEqual([{ tipo: 'compartilhar', dados: { modo: 'imagem', resultado: 'cancelado' } }])
    expect(aviso()).toHaveTextContent(/^$/)
  })

  it('WhatsApp: registra whatsapp/clique', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    const link = screen.getByRole('link', { name: 'Mandar no WhatsApp' })
    link.addEventListener('click', e => e.preventDefault())
    fireEvent.click(link)
    expect(eventosEnviados()).toEqual([{ tipo: 'compartilhar', dados: { modo: 'whatsapp', resultado: 'clique' } }])
  })

  it('Baixar imagem para os stories: registra baixar/clique', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    const link = screen.getByRole('link', { name: 'Baixar imagem para os stories' })
    // jsdom não navega: o clique só precisa chegar ao handler.
    link.addEventListener('click', e => e.preventDefault())
    fireEvent.click(link)
    expect(eventosEnviados()).toEqual([{ tipo: 'compartilhar', dados: { modo: 'baixar', resultado: 'clique' } }])
  })
})
