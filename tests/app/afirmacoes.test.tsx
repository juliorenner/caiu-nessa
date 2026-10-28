import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Afirmacoes from '@/app/afirmacoes/page'
import { ResultadoFinal } from '@/components/ResultadoFinal'
import { carregarPool, foraDoJogo, jogaveis } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'
import { COMPOSICAO_EXTRA, COMPOSICAO_PRIMEIRA, TOTAL_AFIRMACOES, tamanhoDa } from '@/lib/rodadas'

const renderizar = async (vista?: string) =>
  render(await Afirmacoes({ searchParams: Promise.resolve(vista ? { vista } : {}) }))

describe('página /afirmacoes', () => {
  it('explica que cada rodada é sorteada do conjunto', async () => {
    await renderizar()
    expect(screen.getByRole('heading', { level: 1, name: 'As afirmações do jogo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('font-letreiro')
    expect(
      screen.getByText(
        `Cada rodada é sorteada deste conjunto: a primeira tem ${TOTAL_AFIRMACOES} afirmações, as seguintes ${tamanhoDa(COMPOSICAO_EXTRA)}, sempre com o mesmo número de cada lado e o mesmo perfil de vereditos nos dois lados.`,
      ),
    ).toBeInTheDocument()
  })

  it('separa as seções "No jogo" e "Fora do jogo"', async () => {
    await renderizar()
    expect(screen.getByRole('heading', { level: 2, name: 'No jogo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Fora do jogo' })).toBeInTheDocument()
  })

  it('agrupa os jogáveis por lado, na ordem do pool', async () => {
    const pool = carregarPool()
    await renderizar()
    const noJogo = screen.getByRole('region', { name: 'No jogo' })
    for (const [lado, titulo] of [
      ['esquerda', 'Ditas ou espalhadas pela esquerda'],
      ['direita', 'Ditas ou espalhadas pela direita'],
    ] as const) {
      const grupo = within(noJogo).getByRole('region', { name: titulo })
      expect(within(grupo).getByRole('heading', { level: 3, name: titulo })).toBeInTheDocument()
      const esperadas = jogaveis(pool).filter((a) => a.lado === lado)
      const cards = within(grupo).getAllByRole('article')
      expect(cards).toHaveLength(esperadas.length)
      cards.forEach((card, i) => expect(within(card).getByText(esperadas[i].texto)).toBeInTheDocument())
    }
  })

  it('lista cada item do pool uma vez, com o link da sua checagem', async () => {
    const pool = carregarPool()
    await renderizar()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(pool.length)
    // O texto de cada card é lido uma vez: procurar cada afirmação com queryByText em cada card estourava o tempo.
    const textos = cards.map((c) => c.textContent ?? '')
    for (const a of pool) {
      const card = cards[textos.findIndex((t) => t.includes(a.texto))]
      expect(card, a.id).toBeDefined()
      expect(within(card!).getByText(`Quem disse: ${a.autor}`)).toBeInTheDocument()
      expect(within(card!).getByText(`“${a.citacao}”`)).toBeInTheDocument()
      const [ano, mes, dia] = a.data_checagem.split('-')
      const link = within(card!).getByRole('link', { name: `Ver a checagem (${a.fonte_nome}, ${dia}/${mes}/${ano})` })
      expect(link).toHaveAttribute('href', a.fonte_url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('mostra o selo de alcance de cada item', async () => {
    // Uma passada só: com 180 itens, procurar cada texto dentro de cada card estourava o tempo do teste.
    const pool = carregarPool()
    await renderizar()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(pool.length)
    const esperado = new Map<number, number>()
    for (const a of pool) esperado.set(a.alcance, (esperado.get(a.alcance) ?? 0) + 1)
    const encontrado = new Map<number, number>()
    for (const card of cards) {
      const selos = within(card).getAllByText(/^Alcance [123]$/)
      expect(selos).toHaveLength(1)
      const n = Number(selos[0].textContent!.replace('Alcance ', ''))
      encontrado.set(n, (encontrado.get(n) ?? 0) + 1)
    }
    expect(encontrado).toEqual(esperado)
  })

  it('mostra os três rótulos de veredito', async () => {
    await renderizar()
    for (const rotulo of ['Verdade', 'Mentira', 'Enganoso']) {
      expect(screen.getAllByText(rotulo).length).toBeGreaterThan(0)
    }
  })

  it('itens com observacao aparecem só em "Fora do jogo", com a observação', async () => {
    // O pool pode não ter nenhum item fora do jogo (todos voltaram em 2026-10-23); aí a seção fica vazia.
    const fora = foraDoJogo(carregarPool())
    await renderizar()
    const noJogo = screen.getByRole('region', { name: 'No jogo' })
    const cards = within(screen.getByRole('region', { name: 'Fora do jogo' })).queryAllByRole('article')
    expect(cards).toHaveLength(fora.length)
    fora.forEach((a, i) => {
      expect(within(cards[i]).getByText(a.texto)).toBeInTheDocument()
      expect(within(cards[i]).getByText(a.observacao!)).toBeInTheDocument()
      expect(within(noJogo).queryByText(a.texto)).not.toBeInTheDocument()
    })
  })
})

const POR_LADO = TOTAL_AFIRMACOES / 2
const dados: RespostaResultado = {
  resultado: {
    acertos: 4,
    total: TOTAL_AFIRMACOES,
    acertosEsquerda: 2,
    acertosDireita: 2,
    acreditadasEsquerda: POR_LADO,
    acreditadasDireita: POR_LADO,
    desconfiadasEsquerda: 0,
    desconfiadasDireita: 0,
    grauErradoEsquerda: 0,
    grauErradoDireita: 0,
    verdadeirasEsquerda: COMPOSICAO_PRIMEIRA.verdadeiro,
    verdadeirasDireita: COMPOSICAO_PRIMEIRA.verdadeiro,
    naoVerdadeirasEsquerda: POR_LADO - COMPOSICAO_PRIMEIRA.verdadeiro,
    naoVerdadeirasDireita: POR_LADO - COMPOSICAO_PRIMEIRA.verdadeiro,
  },
  avaliacao: { titulo: 'Caiu feio', texto: 'Texto.', vies: null },
  estatisticas: null,
  percentilAbaixo: null,
  estatisticasIndisponiveis: false,
}

const primeira = {
  dados,
  rodada: 1,
  acumulado: { acertos: 4, total: TOTAL_AFIRMACOES },
  casas: [...Array<'acerto'>(4).fill('acerto'), ...Array<'erro'>(TOTAL_AFIRMACOES - 4).fill('erro')],
}

describe('ResultadoFinal', () => {
  it('com estatísticas, mostra a comparação com as outras pessoas', async () => {
    const comEstatisticas = {
      ...dados,
      estatisticas: { totalJogadas: 120, histograma: [], erroPorAfirmacao: {}, mediaEsquerda: 0, mediaDireita: 0 },
      percentilAbaixo: 37,
    }
    render(<ResultadoFinal {...primeira} dados={comEstatisticas} onContinuar={async () => 'fim'} />)
    expect(screen.getByText('Você acertou mais que 37% das pessoas.')).toBeInTheDocument()
  })

  it('tem um link para /afirmacoes', async () => {
    render(<ResultadoFinal {...primeira} onContinuar={async () => 'fim'} />)
    expect(screen.getByRole('link', { name: 'Ver todas as afirmações e suas fontes' })).toHaveAttribute(
      'href',
      '/afirmacoes',
    )
  })

  it('rodada 1 mostra comparação e Continuar jogando', async () => {
    render(<ResultadoFinal {...primeira} onContinuar={async () => 'fim'} />)
    expect(screen.getByText(`4/${TOTAL_AFIRMACOES}`)).toBeInTheDocument()
    // Leitor de tela ouve "4 de N", não "4 barra N".
    expect(screen.getByText(`4/${TOTAL_AFIRMACOES}`)).toHaveAttribute('aria-hidden')
    expect(screen.getByText(`4 de ${TOTAL_AFIRMACOES}`)).toHaveClass('sr-only')
    expect(screen.getByText('Fim de jogo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Caiu feio' })).toBeInTheDocument()
    // Sem 100 jogadas ainda não há comparação: a caixa não aparece, nem um aviso no lugar.
    expect(screen.queryByText(/das pessoas|primeiros a jogar|não está disponível/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Na partida/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar jogando' })).toBeEnabled()
    expect(screen.getAllByRole('link', { name: 'Jogar de novo' }).map(l => l.getAttribute('href'))).toEqual(['/quiz', '/quiz'])
    expect(screen.getByRole('button', { name: 'Mais opções de compartilhar' })).toBeInTheDocument()
    expect(screen.queryByText(/Acertei/)).not.toBeInTheDocument()
  })

  it('Sorteando… enquanto espera', async () => {
    let resolver: (r: 'ok' | 'fim' | 'falha') => void = () => {}
    const onContinuar = vi.fn(() => new Promise<'ok' | 'fim' | 'falha'>(r => (resolver = r)))
    render(<ResultadoFinal {...primeira} onContinuar={onContinuar} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Continuar jogando' }))
    const botao = screen.getByRole('button', { name: 'Sorteando…' })
    expect(botao).toBeDisabled()
    expect(botao).toHaveAttribute('aria-busy', 'true')
    await act(async () => resolver('fim'))
    expect(screen.getByText('Acabaram as afirmações por enquanto. Volte depois: a lista cresce.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Continuar jogando|Sorteando/ })).not.toBeInTheDocument()
    expect(onContinuar).toHaveBeenCalledTimes(1)
  })
})

describe('página /afirmacoes: vista em tabela', () => {
  it('troca por link: cartões por padrão, ?vista=tabela mostra a tabela com uma linha por afirmação', async () => {
    const pool = carregarPool()
    await renderizar()
    expect(screen.getByRole('link', { name: 'Cartões' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Tabela' })).toHaveAttribute('href', '/afirmacoes?vista=tabela')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    cleanup()
    await renderizar('tabela')
    expect(screen.getByRole('link', { name: 'Tabela' })).toHaveAttribute('aria-current', 'page')
    const tabela = screen.getByRole('table', { name: /Afirmações do jogo/ })
    expect(within(tabela.querySelector('thead')!).getAllByRole('columnheader').map(c => c.textContent)).toEqual([
      'Afirmação',
      'Quem disse',
      'Veredito',
      'Checagem',
      'Data',
    ])
    // Cabeçalho + 3 linhas de grupo + uma por afirmação.
    expect(within(tabela).getAllByRole('row')).toHaveLength(1 + 3 + pool.length)
    const primeira = jogaveis(pool).find(a => a.lado === 'esquerda')!
    expect(within(tabela).getByText(primeira.texto)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: 'No jogo' })).not.toBeInTheDocument()
    expect(within(tabela).getByRole('columnheader', { name: 'Fora do jogo' })).toBeInTheDocument()
    expect(foraDoJogo(pool).length).toBeGreaterThan(0)
  })
})
