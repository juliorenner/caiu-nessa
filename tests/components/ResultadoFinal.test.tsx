import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ResultadoFinal } from '@/components/ResultadoFinal'
import type { Casa } from '@/lib/cartao'
import { gradeDeCasas, NOME_ARQUIVO } from '@/lib/compartilhar'
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
const texto = `Fiz 4/12 no Caiu Nessa? e caí em 3. E você?\n${gradeDeCasas(casas)}\ncaiunessa.com.br`

function renderizar() {
  return render(
    <ResultadoFinal dados={dados} rodada={1} acumulado={{ acertos: 4, total: 12 }} casas={casas} onContinuar={async () => 'fim'} />,
  )
}

const aviso = () => document.querySelector('p[aria-live="polite"]')
const botao = () => screen.getByRole('button', { name: 'Compartilhar placar' })
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
    expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['Compartilhar placar', 'Continuar jogando'])
    expect(screen.getAllByRole('link').map(l => l.textContent)).toEqual([
      'Baixar imagem para os stories',
      'Jogar de novo',
      'Como escolhemos as afirmações',
      'Ver todas as afirmações e suas fontes',
    ])
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

  it('imagem pré-buscada e canShare aceita: share com files, texto e título', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    expect(share).toHaveBeenCalledTimes(1)
    const [dadosShare] = share.mock.calls[0]
    expect(dadosShare.files).toHaveLength(1)
    expect(dadosShare.files[0]).toBeInstanceOf(File)
    expect(dadosShare.files[0].name).toBe(NOME_ARQUIVO)
    expect(dadosShare.text).toBe(texto)
    expect(dadosShare.title).toBe(TITULO)
  })

  it('imagem ainda chegando: share na hora com texto e url, sem files', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: vi.fn().mockReturnValue(true) })
    renderizar()
    fireEvent.click(botao())
    expect(share).toHaveBeenCalledWith({ text: texto, url: SITE_URL, title: TITULO })
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

  it('share falha por outro motivo: copia o texto e mostra Texto copiado', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share: vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError')), writeText })
    renderizar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Texto copiado'))
    expect(writeText).toHaveBeenCalledWith(texto)
  })

  it('share recusou o arquivo: o próximo toque vai sem files', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValueOnce(new DOMException('negado', 'NotAllowedError')).mockResolvedValue(undefined)
    stubNavegador({ share, canShare: () => true, writeText })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Texto copiado'))
    expect(share.mock.calls[0][0]).toHaveProperty('files')
    fireEvent.click(botao())
    expect(share).toHaveBeenCalledTimes(2)
    expect(share.mock.calls[1][0]).not.toHaveProperty('files')
    expect(share.mock.calls[1][0]).toMatchObject({ text: texto, url: SITE_URL })
  })

  it('sem share: copia, mostra Texto copiado por 2 s', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ writeText })
    renderizar()
    await assentar()
    vi.useFakeTimers()
    fireEvent.click(botao())
    await act(async () => {})
    expect(writeText).toHaveBeenCalledWith(texto)
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
    stubNavegador({ share, canShare: () => true, writeText: vi.fn().mockRejectedValue(new Error('negado')) })
    renderizar()
    await assentar()
    fireEvent.click(botao())
    await waitFor(() => expect(aviso()).toHaveTextContent('Não deu para copiar'))
    fireEvent.click(botao())
    await assentar()
    expect(share).toHaveBeenCalledTimes(2)
    expect(aviso()).toHaveTextContent(/^$/)
  })

  it('link Baixar imagem para os stories baixa o cartão', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    const link = screen.getByRole('link', { name: 'Baixar imagem para os stories' })
    expect(link).toHaveAttribute('download', NOME_ARQUIVO)
    expect(link.getAttribute('href')).toMatch(/^\/cartao\?a=/)
  })

  it('ordem: Compartilhar placar, Baixar imagem, Continuar jogando; Jogar de novo é link e a linha Acertei sai', async () => {
    stubNavegador({})
    renderizar()
    await assentar()
    const compartilharBtn = botao()
    const baixar = screen.getByRole('link', { name: 'Baixar imagem para os stories' })
    const continuar = screen.getByRole('button', { name: 'Continuar jogando' })
    expect(compartilharBtn.compareDocumentPosition(baixar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(baixar.compareDocumentPosition(continuar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Jogar de novo' })).toHaveAttribute('href', '/quiz')
    expect(screen.queryByText(/Acertei/)).not.toBeInTheDocument()
  })
})
