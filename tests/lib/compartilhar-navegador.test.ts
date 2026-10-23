import { describe, expect, it, vi } from 'vitest'
import { buscarArquivo, compartilhar } from '@/lib/compartilhar-navegador'

const url = 'https://caiunessa.com.br/r/4-12-3-caiu-feio-aeaqeeaeeqea'
const base = { texto: 'Fiz 4/12', textoComUrl: `Fiz 4/12\n${url}`, url, titulo: 'Caiu Nessa?' }
const arquivo = new File(['png'], 'caiu-nessa-placar.png', { type: 'image/png' })

function navegador(n: Partial<Record<'share' | 'canShare' | 'writeText', unknown>>) {
  return {
    share: n.share,
    canShare: n.canShare,
    clipboard: n.writeText ? { writeText: n.writeText } : undefined,
  } as unknown as Navigator
}

describe('compartilhar, modo link', () => {
  it('com share: texto sem URL, url e título, sem files (mesmo com arquivo e canShare)', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const nav = navegador({ share, canShare: vi.fn().mockReturnValue(true) })
    expect(await compartilhar({ ...base, modo: 'link', arquivo, nav })).toBe('folha')
    expect(share).toHaveBeenCalledWith({ text: base.texto, url: base.url, title: base.titulo })
  })

  it('sem modo: link por padrão', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    expect(await compartilhar({ ...base, arquivo: null, nav: navegador({ share }) })).toBe('folha')
    expect(share).toHaveBeenCalledWith({ text: base.texto, url: base.url, title: base.titulo })
  })

  it('chama share na hora, antes de qualquer espera', () => {
    const share = vi.fn().mockReturnValue(new Promise(() => {}))
    void compartilhar({ ...base, modo: 'link', arquivo: null, nav: navegador({ share }) })
    expect(share).toHaveBeenCalledTimes(1)
  })

  it('AbortError: cancelado, sem copiar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(new DOMException('fechou', 'AbortError'))
    expect(await compartilhar({ ...base, modo: 'link', arquivo: null, nav: navegador({ share, writeText }) })).toBe('cancelado')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('AbortError como Error comum (polyfill): também cancelado', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('fechou'), { name: 'AbortError' }))
    expect(await compartilhar({ ...base, modo: 'link', arquivo: null, nav: navegador({ share, writeText }) })).toBe('cancelado')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('outra falha do share: copia o texto com a URL', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError'))
    expect(await compartilhar({ ...base, modo: 'link', arquivo: null, nav: navegador({ share, writeText }) })).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith(base.textoComUrl)
  })

  it('sem share: copia o texto com a URL; clipboard recusa ou não existe: falhou', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await compartilhar({ ...base, modo: 'link', arquivo, nav: navegador({ writeText }) })).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith(base.textoComUrl)
    const recusa = vi.fn().mockRejectedValue(new Error('negado'))
    expect(await compartilhar({ ...base, modo: 'link', arquivo, nav: navegador({ writeText: recusa }) })).toBe('falhou')
    expect(await compartilhar({ ...base, modo: 'link', arquivo, nav: navegador({}) })).toBe('falhou')
  })

  it('sem textoComUrl: copia o texto', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const { textoComUrl: _, ...semTextoComUrl } = base
    expect(await compartilhar({ ...semTextoComUrl, arquivo: null, nav: navegador({ writeText }) })).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith(base.texto)
  })
})

describe('compartilhar, modo imagem', () => {
  it('canShare aceita e há arquivo: share com files e texto com URL, sem url', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const canShare = vi.fn().mockReturnValue(true)
    expect(await compartilhar({ ...base, modo: 'imagem', arquivo, nav: navegador({ share, canShare }) })).toBe('folha')
    expect(canShare).toHaveBeenCalledWith({ files: [arquivo] })
    expect(share).toHaveBeenCalledWith({ files: [arquivo], text: base.textoComUrl, title: base.titulo })
  })

  it('sem arquivo, canShare recusa ou não existe: indisponivel, nada chamado', async () => {
    for (const [canShare, a] of [[vi.fn().mockReturnValue(false), arquivo], [vi.fn().mockReturnValue(true), null], [undefined, arquivo]] as const) {
      const share = vi.fn().mockResolvedValue(undefined)
      const writeText = vi.fn().mockResolvedValue(undefined)
      expect(await compartilhar({ ...base, modo: 'imagem', arquivo: a, nav: navegador({ share, canShare, writeText }) })).toBe('indisponivel')
      expect(share).not.toHaveBeenCalled()
      expect(writeText).not.toHaveBeenCalled()
    }
  })

  it('sem share: indisponivel', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const nav = navegador({ canShare: vi.fn().mockReturnValue(true), writeText })
    expect(await compartilhar({ ...base, modo: 'imagem', arquivo, nav })).toBe('indisponivel')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('AbortError: cancelado', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('fechou', 'AbortError'))
    const nav = navegador({ share, canShare: vi.fn().mockReturnValue(true) })
    expect(await compartilhar({ ...base, modo: 'imagem', arquivo, nav })).toBe('cancelado')
  })

  it('outra falha: falhou, sem copiar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError'))
    const nav = navegador({ share, canShare: vi.fn().mockReturnValue(true), writeText })
    expect(await compartilhar({ ...base, modo: 'imagem', arquivo, nav })).toBe('falhou')
    expect(writeText).not.toHaveBeenCalled()
  })
})

describe('buscarArquivo', () => {
  it('devolve um File PNG com o nome pedido', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['png']) })
    const f = await buscarArquivo('/cartao?a=1', 'caiu-nessa-placar.png', fetchFn)
    expect(fetchFn).toHaveBeenCalledWith('/cartao?a=1')
    expect(f).toBeInstanceOf(File)
    expect(f?.name).toBe('caiu-nessa-placar.png')
    expect(f?.type).toBe('image/png')
  })

  it('null quando a resposta não é ok ou a rede falha', async () => {
    expect(await buscarArquivo('/x', 'a.png', vi.fn().mockResolvedValue({ ok: false, status: 400 }))).toBeNull()
    expect(await buscarArquivo('/x', 'a.png', vi.fn().mockRejectedValue(new TypeError('rede')))).toBeNull()
  })
})
