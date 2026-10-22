import { describe, expect, it, vi } from 'vitest'
import { buscarArquivo, compartilhar } from '@/lib/compartilhar-navegador'

const base = { texto: 'Fiz 4/12', url: 'https://caiunessa.com.br', titulo: 'Caiu Nessa?' }
const arquivo = new File(['png'], 'caiu-nessa-placar.png', { type: 'image/png' })

function navegador(n: Partial<Record<'share' | 'canShare' | 'writeText', unknown>>) {
  return {
    share: n.share,
    canShare: n.canShare,
    clipboard: n.writeText ? { writeText: n.writeText } : undefined,
  } as unknown as Navigator
}

describe('compartilhar', () => {
  it('com arquivo aceito: share com files, texto e título, sem url', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const nav = navegador({ share, canShare: vi.fn().mockReturnValue(true) })
    expect(await compartilhar({ ...base, arquivo, nav })).toBe('folha')
    expect(share).toHaveBeenCalledWith({ files: [arquivo], text: base.texto, title: base.titulo })
  })

  it('arquivo recusado pelo canShare, ausente ou sem canShare: share só com texto e url', async () => {
    for (const [canShare, a] of [[vi.fn().mockReturnValue(false), arquivo], [vi.fn().mockReturnValue(true), null], [undefined, arquivo]] as const) {
      const share = vi.fn().mockResolvedValue(undefined)
      expect(await compartilhar({ ...base, arquivo: a, nav: navegador({ share, canShare }) })).toBe('folha')
      expect(share).toHaveBeenCalledWith({ text: base.texto, url: base.url, title: base.titulo })
    }
  })

  it('chama share na hora, antes de qualquer espera', () => {
    const share = vi.fn().mockReturnValue(new Promise(() => {}))
    void compartilhar({ ...base, arquivo: null, nav: navegador({ share }) })
    expect(share).toHaveBeenCalledTimes(1)
  })

  it('AbortError: cancelado, sem copiar', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(new DOMException('fechou', 'AbortError'))
    expect(await compartilhar({ ...base, arquivo: null, nav: navegador({ share, writeText }) })).toBe('cancelado')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('AbortError como Error comum (polyfill): também cancelado', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('fechou'), { name: 'AbortError' }))
    expect(await compartilhar({ ...base, arquivo: null, nav: navegador({ share, writeText }) })).toBe('cancelado')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('outra falha do share: copia o texto', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    const share = vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError'))
    expect(await compartilhar({ ...base, arquivo: null, nav: navegador({ share, writeText }) })).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith(base.texto)
  })

  it('sem share: copia; clipboard recusa ou não existe: falhou', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await compartilhar({ ...base, arquivo, nav: navegador({ writeText }) })).toBe('copiado')
    expect(writeText).toHaveBeenCalledWith(base.texto)
    const recusa = vi.fn().mockRejectedValue(new Error('negado'))
    expect(await compartilhar({ ...base, arquivo, nav: navegador({ writeText: recusa }) })).toBe('falhou')
    expect(await compartilhar({ ...base, arquivo, nav: navegador({}) })).toBe('falhou')
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
