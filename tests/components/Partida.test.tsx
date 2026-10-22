import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Partida from '@/components/Partida'
import { semLado } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'
import { afirmacoesValidas, rodadaDeSeis } from '../fixtures/afirmacoes-validas'

// Embrulha o ResultadoFinal real só para guardar o onContinuar que ele recebe; a tela continua a de verdade.
const capturado = vi.hoisted(() => ({ onContinuar: null as null | (() => Promise<'ok' | 'fim' | 'falha'>) }))
vi.mock('@/components/ResultadoFinal', async importOriginal => {
  const real = await importOriginal<typeof import('@/components/ResultadoFinal')>()
  return {
    ...real,
    ResultadoFinal: (p: Parameters<typeof real.ResultadoFinal>[0]) => {
      capturado.onContinuar = p.onContinuar
      return <real.ResultadoFinal {...p} />
    },
  }
})

const inicial = afirmacoesValidas.map(semLado)
// Segunda rodada: 6 itens novos, clonados da rodada de seis com ids diferentes.
const segunda = rodadaDeSeis.map(a => semLado({ ...a, id: `${a.id}-r2`, texto: `${a.texto} (r2)` }))

function resultado(acertos: number, total: number): RespostaResultado {
  return {
    resultado: {
      acertos,
      total,
      acertosEsquerda: 0,
      acertosDireita: 0,
      acreditadasEsquerda: 0,
      acreditadasDireita: 0,
      desconfiadasEsquerda: 0,
      desconfiadasDireita: 0,
      grauErradoEsquerda: 0,
      grauErradoDireita: 0,
      verdadeirasEsquerda: 0,
      verdadeirasDireita: 0,
      naoVerdadeirasEsquerda: 0,
      naoVerdadeirasDireita: 0,
    },
    avaliacao: { titulo: 'Caiu feio', texto: 'Texto.', vies: null },
    estatisticas: null,
    percentilAbaixo: null,
    estatisticasIndisponiveis: false,
  }
}

const ok = (corpo: unknown) => ({ ok: true, status: 200, json: async () => corpo })

// Responde pelo URL: /api/resultado devolve 4 de 12 e depois 3 de 6; /api/rodada vem de `rodada`.
function mockFetch(rodada: () => Promise<unknown>) {
  const resultados = [resultado(4, 12), resultado(3, 6)]
  const fetchMock = vi.fn((url: string) =>
    url === '/api/resultado' ? Promise.resolve(ok(resultados.shift())) : rodada(),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const pedidosDeRodada = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls.filter(([url]) => url === '/api/rodada') as unknown as [string, RequestInit][]

async function jogar(user: ReturnType<typeof userEvent.setup>, total: number) {
  for (let i = 0; i < total; i++) {
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    await user.click(screen.getByRole('button', { name: i === total - 1 ? 'Ver meu resultado' : 'Próxima' }))
  }
}

beforeEach(() => {
  capturado.onContinuar = null
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Partida', () => {
  it('segunda rodada: pede /api/rodada com as 12 vistas, remonta o quiz com 6 e "Afirmação 1 de 6"', async () => {
    const fetchMock = mockFetch(async () => ok({ afirmacoes: segunda, erroPorAfirmacao: null }))
    render(<Partida inicial={inicial} erroPorAfirmacao={null} />)
    const user = userEvent.setup()
    await jogar(user, 12)
    await user.click(await screen.findByRole('button', { name: 'Continuar jogando' }))
    expect(await screen.findByText('Afirmação 1 de 6')).toBeInTheDocument()
    expect(document.querySelector('[data-contador]')).toHaveTextContent('Placar 00')
    // O botão clicado sumiu: o foco vai para a raiz do quiz, não para o body.
    expect(document.activeElement).toBe(document.querySelector('.h-dvh'))
    const pedidos = pedidosDeRodada(fetchMock)
    expect(pedidos).toHaveLength(1)
    expect(pedidos[0][1].method).toBe('POST')
    const corpo = JSON.parse(pedidos[0][1].body as string)
    expect([...corpo.vistas].sort()).toEqual(inicial.map(a => a.id).sort())
  })

  it('resultado da rodada 2 mostra "Rodada 2", "x/6" e "Na partida y/18", sem comparação', async () => {
    const fetchMock = mockFetch(async () => ok({ afirmacoes: segunda, erroPorAfirmacao: null }))
    render(<Partida inicial={inicial} erroPorAfirmacao={null} />)
    const user = userEvent.setup()
    await jogar(user, 12)
    await user.click(await screen.findByRole('button', { name: 'Continuar jogando' }))
    await screen.findByText('Afirmação 1 de 6')
    await jogar(user, 6)
    expect(await screen.findByText('3/6')).toBeInTheDocument()
    // "Rodada 2" aparece na ficha e como rótulo do placar.
    expect(screen.getAllByText('Rodada 2')).toHaveLength(2)
    expect(screen.getByText('Na partida 7/18')).toBeInTheDocument()
    expect(screen.queryByText(/Você é um dos primeiros a jogar/)).not.toBeInTheDocument()
    expect(screen.getByText('Acertei 7 de 18 no Caiu Nessa? caiunessa.com.br')).toBeInTheDocument()
    const envio = fetchMock.mock.calls.filter(([url]) => url === '/api/resultado')[1] as unknown as [string, RequestInit]
    expect(Object.keys(JSON.parse(envio[1].body as string).respostas).sort()).toEqual(segunda.map(a => a.id).sort())

    // A terceira rodada pede as 18 já vistas.
    await user.click(screen.getByRole('button', { name: 'Continuar jogando' }))
    const terceiro = JSON.parse(pedidosDeRodada(fetchMock)[1][1].body as string)
    expect(terceiro.vistas).toHaveLength(18)
  })

  it('fim do pool mostra a mensagem e mantém Jogar de novo', async () => {
    mockFetch(async () => ok({ afirmacoes: null, erroPorAfirmacao: null }))
    render(<Partida inicial={inicial} erroPorAfirmacao={null} />)
    const user = userEvent.setup()
    await jogar(user, 12)
    await user.click(await screen.findByRole('button', { name: 'Continuar jogando' }))
    expect(
      await screen.findByText('Acabaram as afirmações por enquanto. Volte depois: a lista cresce.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continuar jogando' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jogar de novo' })).toHaveAttribute('href', '/quiz')
    expect(screen.getByText('4/12')).toBeInTheDocument()
  })

  it('falha de rede mostra o alerta e o botão continua', async () => {
    mockFetch(async () => {
      throw new TypeError('rede')
    })
    render(<Partida inicial={inicial} erroPorAfirmacao={null} />)
    const user = userEvent.setup()
    await jogar(user, 12)
    await user.click(await screen.findByRole('button', { name: 'Continuar jogando' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Não deu para sortear. Tente de novo.')
    expect(screen.getByRole('button', { name: 'Continuar jogando' })).toBeEnabled()
  })

  it('botão Continuar desabilita no primeiro clique: o segundo clique não gera outro pedido', async () => {
    let liberar: () => void = () => {}
    const fetchMock = mockFetch(
      () => new Promise(r => (liberar = () => r(ok({ afirmacoes: segunda, erroPorAfirmacao: null })))),
    )
    render(<Partida inicial={inicial} erroPorAfirmacao={null} />)
    const user = userEvent.setup()
    await jogar(user, 12)
    const botao = await screen.findByRole('button', { name: 'Continuar jogando' })
    botao.click()
    botao.click()
    liberar()
    expect(await screen.findByText('Afirmação 1 de 6')).toBeInTheDocument()
    expect(pedidosDeRodada(fetchMock)).toHaveLength(1)
  })

  it('pedido em andamento: duas chamadas de continuar devolvem a mesma promessa e um só fetch', async () => {
    let liberar: () => void = () => {}
    const fetchMock = mockFetch(
      () => new Promise(r => (liberar = () => r(ok({ afirmacoes: segunda, erroPorAfirmacao: null })))),
    )
    render(<Partida inicial={inicial} erroPorAfirmacao={null} />)
    const user = userEvent.setup()
    await jogar(user, 12)
    await screen.findByRole('button', { name: 'Continuar jogando' })
    const continuar = capturado.onContinuar!
    // Direto no guard, sem passar pelo botão (que desabilita sozinho).
    let primeira!: Promise<'ok' | 'fim' | 'falha'>
    let segundaChamada!: Promise<'ok' | 'fim' | 'falha'>
    act(() => {
      primeira = continuar()
      segundaChamada = continuar()
    })
    expect(segundaChamada).toBe(primeira)
    expect(pedidosDeRodada(fetchMock)).toHaveLength(1)
    await act(async () => {
      liberar()
      expect(await primeira).toBe('ok')
    })
    expect(await screen.findByText('Afirmação 1 de 6')).toBeInTheDocument()
  })
})
