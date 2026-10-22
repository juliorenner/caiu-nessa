import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Quiz from '@/components/Quiz'
import type { RespostaResultado } from '@/lib/resultado-api'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'

const identidade = <T,>(itens: T[]) => itens

const respostaOk: RespostaResultado = {
  resultado: {
    acertos: 4,
    total: 12,
    acertosEsquerda: 2,
    acertosDireita: 2,
    acreditadasEsquerda: 4,
    acreditadasDireita: 4,
  },
  avaliacao: { titulo: 'Caiu feio', texto: 'Texto da avaliação.', vies: 'Texto do viés.' },
  estatisticas: null,
  percentilAbaixo: null,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Quiz', () => {
  it('percorre as 12 afirmações, mostra veredito e link da checagem, e envia todas as respostas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => respostaOk })
    vi.stubGlobal('fetch', fetchMock)
    render(<Quiz afirmacoes={afirmacoesValidas} erroPorAfirmacao={{ e1: 37 }} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      expect(screen.getByText(`Afirmação ${i + 1} de 12`)).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(3)
      await user.click(screen.getByRole('button', { name: 'VERDADE' }))
      expect(screen.getByRole('link', { name: /Ver a checagem/ })).toHaveAttribute('target', '_blank')
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/resultado')
    const corpo = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(Object.keys(corpo.respostas).sort()).toEqual(afirmacoesValidas.map(a => a.id).sort())
    expect(Object.values(corpo.respostas).every(v => v === 'verdadeiro')).toBe(true)
    expect(await screen.findByText(/Você é um dos primeiros a jogar/)).toBeInTheDocument()
    expect(screen.getByText('4 de 12')).toBeInTheDocument()
  })

  it('sem embaralharFn, mostra as afirmações na ordem recebida', async () => {
    const user = userEvent.setup()
    const invertida = [...afirmacoesValidas].reverse()
    render(<Quiz afirmacoes={invertida} erroPorAfirmacao={null} />)
    for (const a of invertida.slice(0, 3)) {
      expect(screen.getByText(a.texto)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'VERDADE' }))
      await user.click(screen.getByRole('button', { name: 'Próxima' }))
    }
  })

  it('mostra "Quase" quando o jogador confunde mentira com enganoso', async () => {
    const enganosaPrimeiro = [...afirmacoesValidas].sort((a, b) => (a.id === 'e5' ? -1 : b.id === 'e5' ? 1 : 0))
    expect(enganosaPrimeiro[0].veredito).toBe('enganoso')
    render(<Quiz afirmacoes={enganosaPrimeiro} erroPorAfirmacao={null} embaralharFn={identidade} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'MENTIRA' }))
    expect(
      screen.getByText('Quase: você desconfiou, mas a checagem classificou como Enganoso.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Enganoso')).toBeInTheDocument()
  })

  it('mostra "Você caiu nessa." e "Era verdade." nos erros comuns', async () => {
    const user = userEvent.setup()
    // e1 é verdadeira; e3 é falsa
    const ordem = ['e1', 'e3'].map(id => afirmacoesValidas.find(a => a.id === id)!)
    const resto = afirmacoesValidas.filter(a => !['e1', 'e3'].includes(a.id))
    render(<Quiz afirmacoes={[...ordem, ...resto]} erroPorAfirmacao={null} embaralharFn={identidade} />)
    await user.click(screen.getByRole('button', { name: 'MENTIRA' }))
    expect(screen.getByText('Era verdade.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    await user.click(screen.getByRole('button', { name: 'VERDADE' }))
    expect(screen.getByText('Você caiu nessa.')).toBeInTheDocument()
  })

  it('mostra "% das pessoas erraram esta" só quando há estatística para a afirmação', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <Quiz afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />,
    )
    await user.click(screen.getByRole('button', { name: 'VERDADE' }))
    expect(screen.getByText('Você acertou.')).toBeInTheDocument()
    expect(screen.queryByText(/das pessoas erraram esta/)).not.toBeInTheDocument()
    unmount()

    render(<Quiz afirmacoes={afirmacoesValidas} erroPorAfirmacao={{ e1: 37 }} embaralharFn={identidade} />)
    await user.click(screen.getByRole('button', { name: 'VERDADE' }))
    expect(screen.getByText('37% das pessoas erraram esta.')).toBeInTheDocument()
  })

  it('mostra erro com nova tentativa, e a mensagem própria do 429', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ erro: 'muitas_jogadas' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => respostaOk })
    vi.stubGlobal('fetch', fetchMock)
    render(<Quiz afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'VERDADE' }))
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    expect(await screen.findByText('Não conseguimos salvar seu resultado. Tente de novo.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(
      await screen.findByText('Calma aí: muitas jogadas em pouco tempo. Tente de novo em um minuto.'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Caiu feio')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
