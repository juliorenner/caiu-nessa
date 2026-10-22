import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Afirmacoes from '@/app/afirmacoes/page'
import { ResultadoFinal } from '@/components/ResultadoFinal'
import { carregarAfirmacoes } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'

describe('página /afirmacoes', () => {
  it('lista as 12 afirmações em jogo, na ordem do JSON, cada uma com o link da checagem', () => {
    const afirmacoes = carregarAfirmacoes()
    render(<Afirmacoes />)

    expect(screen.getByRole('heading', { level: 1, name: 'As afirmações do jogo' })).toBeInTheDocument()
    const cards = screen.getAllByRole('article')
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

  it('aponta a reserva de afirmações no repositório', () => {
    render(<Afirmacoes />)
    expect(screen.getByRole('link', { name: 'repositório' })).toHaveAttribute(
      'href',
      'https://github.com/juliorenner/caiu-nessa/blob/main/src/data/afirmacoes-reserva.json',
    )
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
