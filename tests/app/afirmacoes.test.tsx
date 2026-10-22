import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Afirmacoes from '@/app/afirmacoes/page'
import { ResultadoFinal } from '@/components/ResultadoFinal'
import { carregarPool, foraDoJogo, jogaveis } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'

describe('página /afirmacoes', () => {
  it('explica que cada rodada é sorteada do conjunto', () => {
    render(<Afirmacoes />)
    expect(screen.getByRole('heading', { level: 1, name: 'As afirmações do jogo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('font-letreiro')
    expect(
      screen.getByText(
        'Cada rodada é sorteada deste conjunto: a primeira tem 12 afirmações, as seguintes 6, sempre com o mesmo número de cada lado e de cada veredito.',
      ),
    ).toBeInTheDocument()
  })

  it('separa as seções "No jogo" e "Fora do jogo"', () => {
    render(<Afirmacoes />)
    expect(screen.getByRole('heading', { level: 2, name: 'No jogo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Fora do jogo' })).toBeInTheDocument()
  })

  it('agrupa os jogáveis por lado, na ordem do pool', () => {
    const pool = carregarPool()
    render(<Afirmacoes />)
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

  it('lista cada item do pool uma vez, com o link da sua checagem', () => {
    const pool = carregarPool()
    render(<Afirmacoes />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(pool.length)
    for (const a of pool) {
      const card = cards.find((c) => within(c).queryByText(a.texto) !== null)
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

  it('mostra os três rótulos de veredito', () => {
    render(<Afirmacoes />)
    for (const rotulo of ['Verdade', 'Mentira', 'Enganoso']) {
      expect(screen.getAllByText(rotulo).length).toBeGreaterThan(0)
    }
  })

  it('itens com observacao aparecem só em "Fora do jogo", com a observação', () => {
    const fora = foraDoJogo(carregarPool())
    expect(fora.length).toBeGreaterThan(0)
    render(<Afirmacoes />)
    const noJogo = screen.getByRole('region', { name: 'No jogo' })
    const cards = within(screen.getByRole('region', { name: 'Fora do jogo' })).getAllByRole('article')
    expect(cards).toHaveLength(fora.length)
    fora.forEach((a, i) => {
      expect(within(cards[i]).getByText(a.texto)).toBeInTheDocument()
      expect(within(cards[i]).getByText(a.observacao!)).toBeInTheDocument()
      expect(within(noJogo).queryByText(a.texto)).not.toBeInTheDocument()
    })
  })
})

const dados: RespostaResultado = {
  resultado: {
    acertos: 4,
    total: 12,
    acertosEsquerda: 2,
    acertosDireita: 2,
    acreditadasEsquerda: 4,
    acreditadasDireita: 4,
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

const primeira = { dados, rodada: 1, acumulado: { acertos: 4, total: 12 } }

describe('ResultadoFinal', () => {
  it('tem um link para /afirmacoes', () => {
    render(<ResultadoFinal {...primeira} onContinuar={async () => 'fim'} />)
    expect(screen.getByRole('link', { name: 'Ver todas as afirmações e suas fontes' })).toHaveAttribute(
      'href',
      '/afirmacoes',
    )
  })

  it('rodada 1 mostra comparação e Continuar jogando', () => {
    render(<ResultadoFinal {...primeira} onContinuar={async () => 'fim'} />)
    expect(screen.getByText('4/12')).toBeInTheDocument()
    // Leitor de tela ouve "4 de 12", não "4 barra 12".
    expect(screen.getByText('4/12')).toHaveAttribute('aria-hidden')
    expect(screen.getByText('4 de 12')).toHaveClass('sr-only')
    expect(screen.getByText('Fim de jogo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Caiu feio' })).toBeInTheDocument()
    expect(screen.getByText(/Você é um dos primeiros a jogar/)).toBeInTheDocument()
    expect(screen.queryByText(/Na partida/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar jogando' })).toBeEnabled()
    expect(screen.getByRole('link', { name: 'Jogar de novo' })).toHaveAttribute('href', '/quiz')
    expect(screen.getByText('Acertei 4 de 12 no Caiu Nessa? caiunessa.com.br')).toBeInTheDocument()
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
