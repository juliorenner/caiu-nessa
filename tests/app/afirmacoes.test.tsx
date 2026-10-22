import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Afirmacoes from '@/app/afirmacoes/page'
import { ResultadoFinal } from '@/components/ResultadoFinal'
import { carregarAfirmacoes, carregarReserva } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'

describe('página /afirmacoes', () => {
  it('lista as 12 afirmações em jogo, na ordem do JSON, cada uma com o link da checagem', () => {
    const afirmacoes = carregarAfirmacoes()
    render(<Afirmacoes />)

    expect(screen.getByRole('heading', { level: 1, name: 'As afirmações do jogo' })).toBeInTheDocument()
    const secao = screen.getByRole('region', { name: 'Em jogo agora' })
    const cards = within(secao).getAllByRole('article')
    expect(cards).toHaveLength(12)

    cards.forEach((card, i) => {
      const a = afirmacoes[i]
      expect(within(card).getByText(a.texto)).toBeInTheDocument()
      expect(within(card).getByText(`Quem disse: ${a.autor}`)).toBeInTheDocument()
      const [ano, mes, dia] = a.data_checagem.split('-')
      const link = within(card).getByRole('link', {
        name: `Ver a checagem (${a.fonte_nome}, ${dia}/${mes}/${ano})`,
      })
      const href = link.getAttribute('href') ?? ''
      expect(href.startsWith('https://')).toBe(true)
      expect(href).toBe(a.fonte_url)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('mostra os três rótulos de veredito', () => {
    render(<Afirmacoes />)
    for (const rotulo of ['Verdade', 'Mentira', 'Enganoso']) {
      expect(screen.getAllByText(rotulo).length).toBeGreaterThan(0)
    }
  })

  it('separa as seções "Em jogo agora" e "Na reserva"', () => {
    render(<Afirmacoes />)
    expect(screen.getByRole('heading', { level: 2, name: 'Em jogo agora' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Na reserva' })).toBeInTheDocument()
  })

  it('lista todas as afirmações, em jogo e na reserva, cada uma com o link da sua checagem', () => {
    const todas = [...carregarAfirmacoes(), ...carregarReserva()]
    render(<Afirmacoes />)

    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(todas.length)
    cards.forEach((card, i) => {
      expect(within(card).getByText(todas[i].texto)).toBeInTheDocument()
      expect(within(card).getByText(`Quem disse: ${todas[i].autor}`)).toBeInTheDocument()
      expect(within(card).getByText(`“${todas[i].citacao}”`)).toBeInTheDocument()
      expect(within(card).getByRole('link')).toHaveAttribute('href', todas[i].fonte_url)
    })
  })

  it('mostra a observação dos itens da reserva que a têm; nenhum item em jogo tem observação', () => {
    expect(carregarAfirmacoes().filter((a) => a.observacao !== undefined)).toEqual([])
    const reserva = carregarReserva()
    const comObservacao = reserva.filter((a) => a.observacao !== undefined)
    expect(comObservacao.length).toBeGreaterThan(0)
    render(<Afirmacoes />)
    const cards = within(screen.getByRole('region', { name: 'Na reserva' })).getAllByRole('article')
    reserva.forEach((a, i) => {
      if (a.observacao) expect(within(cards[i]).getByText(a.observacao)).toBeInTheDocument()
    })
  })
})

describe('ResultadoFinal', () => {
  it('tem um link para /afirmacoes', () => {
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
    render(<ResultadoFinal dados={dados} />)
    expect(screen.getByRole('link', { name: 'Ver todas as afirmações e suas fontes' })).toHaveAttribute(
      'href',
      '/afirmacoes',
    )
  })
})
