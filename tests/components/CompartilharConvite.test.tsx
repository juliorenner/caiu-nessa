import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CompartilharConvite } from '@/components/CompartilharConvite'
import { NOME_ARQUIVO_CONVITE, textoDeChamado, urlDoWhatsApp } from '@/lib/compartilhar'
import { SITE_URL, TITULO } from '@/lib/site'

const URL_CONVITE = `${SITE_URL}/jogue`
const aviso = () => document.querySelector('p[aria-live="polite"]')
const assentar = () => act(() => new Promise(r => setTimeout(r, 0)))
const eventosEnviados = () =>
  vi
    .mocked(fetch)
    .mock.calls.filter(([url]) => url === '/api/evento')
    .map(([, init]) => JSON.parse(String(init?.body)))

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
})

describe('CompartilharConvite (home)', () => {
  it('sem mostrar o cartão: WhatsApp com o texto da home e o link /jogue, Baixar o convite', async () => {
    stubNavegador({})
    render(<CompartilharConvite />)
    await assentar()
    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByRole('link', { name: 'Mandar no WhatsApp' })).toHaveAttribute('href', urlDoWhatsApp(textoDeChamado(URL_CONVITE)))
    const baixar = screen.getByRole('link', { name: 'Baixar imagem para os stories' })
    expect(baixar).toHaveAttribute('href', '/convite')
    expect(baixar).toHaveAttribute('download', NOME_ARQUIVO_CONVITE)
    // Sem suporte a arquivos: nem Instagram, nem busca da imagem.
    expect(screen.queryByRole('button', { name: 'Mandar para o Instagram' })).toBeNull()
    expect(vi.mocked(fetch).mock.calls.filter(([url]) => url === '/convite')).toHaveLength(0)
  })

  it('Mais: share com o texto da home e /jogue, e registra com tela home', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share })
    render(<CompartilharConvite />)
    await assentar()
    fireEvent.click(screen.getByRole('button', { name: 'Mais opções de compartilhar' }))
    await waitFor(() => expect(eventosEnviados()).toHaveLength(1))
    expect(share).toHaveBeenCalledWith({ text: textoDeChamado(), url: URL_CONVITE, title: TITULO })
    expect(eventosEnviados()).toEqual([
      { tipo: 'compartilhar', dados: { modo: 'link', resultado: 'folha', cartao: 'convite', tela: 'home' } },
    ])
  })

  it('Instagram: busca o convite ao montar e manda só o arquivo', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    stubNavegador({ share, canShare: () => true })
    render(<CompartilharConvite />)
    await assentar()
    fireEvent.click(screen.getByRole('button', { name: 'Mandar para o Instagram' }))
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1))
    const [{ files }] = share.mock.calls[0]
    expect(Object.keys(share.mock.calls[0][0])).toEqual(['files'])
    expect(files[0].name).toBe(NOME_ARQUIVO_CONVITE)
    expect(aviso()).toHaveTextContent(/^$/)
  })

  it('WhatsApp e Baixar registram clique com tela home', async () => {
    stubNavegador({})
    render(<CompartilharConvite />)
    await assentar()
    for (const nome of ['Mandar no WhatsApp', 'Baixar imagem para os stories']) {
      const link = screen.getByRole('link', { name: nome })
      link.addEventListener('click', e => e.preventDefault())
      fireEvent.click(link)
    }
    expect(eventosEnviados()).toEqual([
      { tipo: 'compartilhar', dados: { modo: 'whatsapp', resultado: 'clique', cartao: 'convite', tela: 'home' } },
      { tipo: 'compartilhar', dados: { modo: 'baixar', resultado: 'clique', cartao: 'convite', tela: 'home' } },
    ])
  })
})
