import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuizPage from '@/app/quiz/page'
import { tamanhoDoTexto } from '@/components/CartaoAfirmacao'
import Quiz from '@/components/Quiz'
import { ARIA_BOTAO_RESPOSTA, ROTULO_BOTAO } from '@/components/rotulos'
import { carregarPool, ehRodadaBalanceada, jogaveis, type Veredito } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'
import { afirmacoesValidas, rodadaDeSeis } from '../fixtures/afirmacoes-validas'

const identidade = <T,>(itens: T[]) => itens

// Primeira rodada, sem acumulado; continuar não é exercitado aqui.
const daRodada = { rodada: 1, acumuladoAnterior: { acertos: 0, total: 0 }, onContinuar: async () => 'fim' as const }

const respostaOk: RespostaResultado = {
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
  avaliacao: { titulo: 'Caiu feio', texto: 'Texto da avaliação.', vies: 'Texto do viés.' },
  estatisticas: null,
  percentilAbaixo: null,
  estatisticasIndisponiveis: false,
}

// A página do quiz busca estatísticas no banco; aqui basta "sem estatísticas".
vi.mock('@/db/client', () => ({ getDb: async () => ({}) }))
vi.mock('@/lib/estatisticas', () => ({ obterEstatisticas: async () => null }))

function movimentoReduzido(reduzir: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: reduzir }))
}

// Por padrão os testes rodam com movimento reduzido: as transições acontecem na hora.
beforeEach(() => movimentoReduzido(true))

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const ponteiro = (x: number, y: number) => ({ pointerId: 1, button: 0, clientX: x, clientY: y })
const porId = (ids: string[]) => [
  ...ids.map(id => afirmacoesValidas.find(a => a.id === id)!),
  ...afirmacoesValidas.filter(a => !ids.includes(a.id)),
]
const contador = (container: HTMLElement) => container.querySelector('[data-contador]')
// Cheira mal tem nome acessível próprio; os outros usam o rótulo visível.
const nomeDoBotao = (v: Veredito) => ARIA_BOTAO_RESPOSTA[v] ?? ROTULO_BOTAO[v]

describe('Quiz', () => {
  it('percorre as 12 afirmações, mostra veredito e link da checagem, e envia todas as respostas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => respostaOk })
    vi.stubGlobal('fetch', fetchMock)
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={{ e1: 37 }} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      expect(screen.getByText(`Ficha ${String(i + 1).padStart(2, '0')}/12`)).toBeInTheDocument()
      expect(screen.getAllByRole('button')).toHaveLength(3)
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      expect(screen.getByRole('link', { name: /Ver a checagem/ })).toHaveAttribute('target', '_blank')
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    // A tela de placar também busca a imagem dos stories; aqui conta só o envio.
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/resultado')).toHaveLength(1)
    expect(fetchMock.mock.calls[0][0]).toBe('/api/resultado')
    const corpo = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(Object.keys(corpo.respostas).sort()).toEqual(afirmacoesValidas.map(a => a.id).sort())
    expect(Object.values(corpo.respostas).every(v => v === 'verdadeiro')).toBe(true)
    expect(await screen.findByText(/Você é um dos primeiros a jogar/)).toBeInTheDocument()
    expect(screen.getByText('4/12')).toBeInTheDocument()
    expect(screen.getByText('Texto do viés.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Compartilhar placar' })).toBeInTheDocument()
    // Uma casa por afirmação, na ordem jogada: tudo "Verdade" acerta só as verdadeiras.
    const casas = afirmacoesValidas.map(a => (a.veredito === 'verdadeiro' ? 'a' : 'e')).join('')
    expect(screen.getByRole('link', { name: 'Baixar imagem para os stories' }).getAttribute('href')).toContain(`g=${casas}`)
  })

  it('esconde autor e citação na pergunta; mostra os dois no feedback', async () => {
    const [primeira] = afirmacoesValidas
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    expect(screen.getByText(primeira.texto)).toBeInTheDocument()
    expect(screen.queryByText(/Quem disse/)).not.toBeInTheDocument()
    expect(screen.queryByText(primeira.autor, { exact: false })).not.toBeInTheDocument()
    expect(screen.queryByText(primeira.citacao, { exact: false })).not.toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.getByText(`Quem disse: ${primeira.autor}`)).toBeInTheDocument()
    expect(screen.getByText(`“${primeira.citacao}”`)).toBeInTheDocument()
  })

  it('sem embaralharFn, mostra as afirmações na ordem recebida', async () => {
    const user = userEvent.setup()
    const invertida = [...afirmacoesValidas].reverse()
    render(<Quiz {...daRodada} afirmacoes={invertida} erroPorAfirmacao={null} />)
    for (const a of invertida.slice(0, 3)) {
      expect(screen.getByText(a.texto)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      await user.click(screen.getByRole('button', { name: 'Próxima' }))
    }
  })

  it('mostra "Quase" quando o jogador confunde mentira com enganoso', async () => {
    const enganosaPrimeiro = [...afirmacoesValidas].sort((a, b) => (a.id === 'e5' ? -1 : b.id === 'e5' ? 1 : 0))
    expect(enganosaPrimeiro[0].veredito).toBe('enganoso')
    render(<Quiz {...daRodada} afirmacoes={enganosaPrimeiro} erroPorAfirmacao={null} embaralharFn={identidade} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Mentira' }))
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
    render(<Quiz {...daRodada} afirmacoes={[...ordem, ...resto]} erroPorAfirmacao={null} embaralharFn={identidade} />)
    await user.click(screen.getByRole('button', { name: 'Mentira' }))
    expect(screen.getByText('Era verdade.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.getByText('Você caiu nessa.')).toBeInTheDocument()
  })

  it('mostra "% das pessoas erraram esta" só quando há estatística para a afirmação', async () => {
    const user = userEvent.setup()
    const { unmount } = render(
      <Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />,
    )
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.getByText('Você acertou.')).toBeInTheDocument()
    expect(screen.queryByText(/das pessoas erraram esta/)).not.toBeInTheDocument()
    unmount()

    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={{ e1: 37 }} embaralharFn={identidade} />)
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.getByText('37% das pessoas erraram esta.')).toBeInTheDocument()
  })

  it('mostra erro com nova tentativa, e a mensagem própria do 429', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: false, status: 429, json: async () => ({ erro: 'muitas_jogadas' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => respostaOk })
    vi.stubGlobal('fetch', fetchMock)
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    expect(await screen.findByText('Não conseguimos salvar seu resultado. Tente de novo.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(
      await screen.findByText('Calma aí: muitas jogadas em pouco tempo. Tente de novo em um minuto.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('alert').className).toMatch(/border-tinta/)
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Caiu feio')).toBeInTheDocument()
    // A tela de placar também busca a imagem dos stories; aqui contam só os envios.
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/resultado')).toHaveLength(3)
  })

  it('no 400 não oferece repetir o mesmo envio: mostra erro e link para jogar de novo', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 400, json: async () => ({ erro: 'respostas_invalidas' }) })
    vi.stubGlobal('fetch', fetchMock)
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    expect(await screen.findByText('Não conseguimos salvar seu resultado.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar de novo' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Jogar de novo' })).toHaveAttribute('href', '/quiz')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sem movimento reduzido, o painel abre 300 ms depois da resposta; com movimento reduzido, na hora', () => {
    vi.useFakeTimers()
    movimentoReduzido(false)
    const { unmount } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    fireEvent.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    unmount()

    movimentoReduzido(true)
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    fireEvent.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('responde por gesto e abre o painel', () => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 300, height: 400, top: 0, left: 0, right: 300, bottom: 400, x: 0, y: 0, toJSON: () => ({}),
    } as DOMRect)
    render(<Quiz {...daRodada} afirmacoes={porId(['e3'])} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const cartao = screen.getByRole('group', { name: 'Afirmação' })
    fireEvent.pointerDown(cartao, ponteiro(200, 10))
    fireEvent.pointerMove(cartao, ponteiro(40, 12))
    fireEvent.pointerUp(cartao, ponteiro(40, 12))
    const painel = screen.getByRole('dialog')
    expect(painel).toHaveTextContent('Mentira')
    expect(painel).toHaveTextContent('Você acertou.')
  })

  it('placar começa em 00 e conta acertos quando o painel abre', async () => {
    const user = userEvent.setup()
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    expect(contador(container)).toHaveTextContent('Placar 00')
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(contador(container)).toHaveTextContent('Placar 01')
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    // A segunda afirmação da fixture (e2) também é verdadeira.
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(contador(container)).toHaveTextContent('Placar 02')
  })

  it('botões na ordem dos gestos, com ícone', () => {
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const nomes = screen.getAllByRole('button').map(b => b.getAttribute('aria-label') ?? b.textContent)
    expect(nomes).toEqual(['Mentira', 'Isso me cheira mal: enganoso', 'Verdade'])
    expect(screen.getAllByRole('button').every(b => b.querySelector('svg'))).toBe(true)
  })

  it('a ficha do jogo traz a urna, decorativa, sem esconder o rótulo', () => {
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const svg = container.querySelector('[data-ficha] svg')
    expect(svg).not.toBeNull()
    expect(svg!.closest('[aria-hidden]')).not.toBeNull()
    expect(screen.getByText('Ficha 01/12')).toBeInTheDocument()
  })

  it('carimbos de progresso acompanham acerto e erro', async () => {
    const user = userEvent.setup()
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const casas = () => [...container.querySelectorAll('[data-casa]')].map(c => c.getAttribute('data-casa'))
    await user.click(screen.getByRole('button', { name: nomeDoBotao(afirmacoesValidas[0].veredito) }))
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(casas().slice(0, 3)).toEqual(['acerto', 'atual', 'pendente'])
    await user.click(screen.getByRole('button', { name: 'Mentira' }))
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(casas().slice(0, 4)).toEqual(['acerto', 'erro', 'atual', 'pendente'])
    expect(container.querySelectorAll('[data-casa]')).toHaveLength(12)
  })

  it('conteúdo escurece enquanto o painel está aberto', async () => {
    const user = userEvent.setup()
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    expect(container.querySelector('[data-conteudo]')!.className).not.toMatch(/brightness/)
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(container.querySelector('[data-conteudo]')!.className).toMatch(/brightness/)
  })

  it('ignora resposta durante a animação', () => {
    vi.useFakeTimers()
    movimentoReduzido(false)
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    fireEvent.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(screen.getByRole('button', { name: 'Mentira' })).toHaveAttribute('aria-disabled', 'true')
    // O cartão ainda desliza: o contador só muda quando o painel abre.
    expect(contador(container)).toHaveTextContent('Placar 00')
    const casas = () => [...container.querySelectorAll('[data-casa]')].map(c => c.getAttribute('data-casa'))
    expect(casas()[0]).toBe('atual')
    fireEvent.click(screen.getByRole('button', { name: 'Mentira' }))
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    act(() => vi.advanceTimersByTime(300))
    expect(screen.getByText('Você acertou.')).toBeInTheDocument()
    expect(contador(container)).toHaveTextContent('Placar 01')
    expect(casas()[0]).toBe('acerto')
    for (let i = 0; i < 12; i++) {
      if (i > 0) {
        fireEvent.click(screen.getByRole('button', { name: 'Verdade' }))
        act(() => vi.advanceTimersByTime(300))
      }
      fireEvent.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
      act(() => vi.advanceTimersByTime(300))
    }
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const corpo = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(corpo.respostas.e1).toBe('verdadeiro')
  })

  it('duas entradas no mesmo tick registram só a primeira', () => {
    movimentoReduzido(true)
    render(<Quiz {...daRodada} afirmacoes={porId(['e1', 'e5'])} erroPorAfirmacao={null} embaralharFn={identidade} />)
    act(() => {
      screen.getByRole('button', { name: 'Verdade' }).click()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true }))
    })
    expect(screen.getByRole('dialog')).toHaveTextContent('Você acertou.')
  })

  it('setas do teclado respondem só na pergunta', async () => {
    const user = userEvent.setup()
    const { container } = render(<Quiz {...daRodada} afirmacoes={porId(['e1', 'e5'])} erroPorAfirmacao={null} embaralharFn={identidade} />)
    expect(fireEvent.keyDown(window, { key: 'ArrowDown' })).toBe(true)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(fireEvent.keyDown(window, { key: 'ArrowLeft' })).toBe(false)
    expect(screen.getByText('Era verdade.')).toBeInTheDocument()
    // Painel aberto: setas não respondem de novo.
    expect(fireEvent.keyDown(window, { key: 'ArrowRight' })).toBe(true)
    expect(screen.getByText('Era verdade.')).toBeInTheDocument()
    expect(contador(container)).toHaveTextContent('Placar 00')
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(screen.getByText('Você acertou.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(contador(container)).toHaveTextContent('Placar 02')
  })

  it('painel é obrigatório: próximo cartão só depois de Próxima', async () => {
    const user = userEvent.setup()
    const [primeira, segunda] = afirmacoesValidas
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    await user.click(screen.getByRole('button', { name: 'Mentira' }))
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Ficha 01/12')).toBeInTheDocument()
    expect(screen.getByText(primeira.texto)).toBeInTheDocument()
    expect(screen.queryByText(segunda.texto)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Ficha 02/12')).toBeInTheDocument()
    expect(screen.getByText(segunda.texto)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  })

  it('tela do quiz não excede a viewport (320×568) com a afirmação mais longa', async () => {
    const todas = [...carregarPool(), ...afirmacoesValidas]
    const maisLonga = todas.reduce((a, b) => (b.texto.length > a.texto.length ? b : a))
    const { container } = render(
      <Quiz {...daRodada} afirmacoes={[maisLonga, ...afirmacoesValidas.slice(1)]} erroPorAfirmacao={null} embaralharFn={identidade} />,
    )
    const raiz = container.firstElementChild as HTMLElement
    for (const c of ['flex', 'h-dvh', 'flex-col', 'box-border', 'overflow-y-auto']) expect(raiz).toHaveClass(c)
    expect(raiz).not.toHaveClass('overflow-hidden')
    const texto = screen.getByText(maisLonga.texto)
    expect(texto).toHaveClass(tamanhoDoTexto(maisLonga.texto))
    expect(['text-lg', 'text-base']).toContain(tamanhoDoTexto(maisLonga.texto))
    for (const botao of ['Verdade', 'Mentira', 'Isso me cheira mal: enganoso'])
      expect(screen.getByRole('button', { name: botao })).toHaveClass('min-h-14')

    const pagina = render(await QuizPage())
    const main = pagina.container.querySelector('main')!
    expect(main.className).not.toMatch(/(^|\s)(py|pt|pb|h|min-h)-/)
  })

  it('QuizPage entrega 12 afirmações jogáveis, sem lado, balanceadas por par', async () => {
    const pagina = await QuizPage()
    const { inicial: afirmacoes } = pagina.props.children.props as { inicial: Record<string, unknown>[] }
    expect(afirmacoes).toHaveLength(12)
    expect(afirmacoes.every((a) => !('lado' in a))).toBe(true)
    const porId = new Map(jogaveis(carregarPool()).map((a) => [a.id, a]))
    const completas = afirmacoes.map((a) => porId.get(a.id as string)!)
    expect(completas.every(Boolean)).toBe(true)
    expect(new Set(completas.map((a) => a.id)).size).toBe(12)
    expect(ehRodadaBalanceada(completas)).toBe(true)
  })

  it('cabeçalho usa o tamanho da rodada (6)', () => {
    render(<Quiz {...daRodada} rodada={2} afirmacoes={rodadaDeSeis} erroPorAfirmacao={null} embaralharFn={identidade} />)
    expect(screen.getByText('Ficha 01/06')).toBeInTheDocument()
    // A posição já é lida pelo sr-only "Afirmação 1 de 6": a ficha não a anuncia de novo.
    expect(screen.getByText('Ficha 01/06')).toHaveAttribute('aria-hidden')
    expect(screen.getByText(/Rodada 2/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '6')
  })

  it('conteúdo do quiz fica inert enquanto o painel está aberto, e o painel não', async () => {
    const user = userEvent.setup()
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const conteudo = container.querySelector('[data-conteudo]')!
    expect(conteudo).not.toHaveAttribute('inert')
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    expect(conteudo).toHaveAttribute('inert')
    const painel = screen.getByRole('dialog')
    expect(painel.closest('[inert]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Próxima' })).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(conteudo).not.toHaveAttribute('inert')
  })

  it('foco volta para a raiz do quiz quando o painel fecha', async () => {
    const user = userEvent.setup()
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    await user.click(screen.getByRole('button', { name: 'Verdade' }))
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    const raiz = container.firstElementChild as HTMLElement
    expect(document.activeElement).toBe(raiz)
    expect(raiz).toHaveAttribute('tabindex', '-1')
  })

  it('botão escolhido ganha destaque e os outros esmaecem enquanto o painel está aberto', async () => {
    vi.useFakeTimers()
    movimentoReduzido(false)
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const verdade = screen.getByRole('button', { name: 'Verdade' })
    const mentira = screen.getByRole('button', { name: 'Mentira' })
    expect(verdade).not.toHaveClass('translate-y-[5px]')
    fireEvent.click(verdade)
    expect(verdade).toHaveClass('translate-y-[5px]')
    expect(verdade).not.toHaveClass('opacity-35')
    expect(mentira).toHaveClass('opacity-35')
    act(() => vi.advanceTimersByTime(300))
    expect(verdade).toHaveClass('translate-y-[5px]')
  })

  it('contador some na tela de resultado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => respostaOk }))
    const { container } = render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    expect(await screen.findByText('Caiu feio')).toBeInTheDocument()
    expect(contador(container)).toBeNull()
    expect(container.querySelector('.h-dvh')).toBeNull()
  })

  it('quando as estatísticas falham, diz que a comparação está indisponível em vez de "um dos primeiros"', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...respostaOk, estatisticasIndisponiveis: true }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    expect(
      await screen.findByText('A comparação com os outros jogadores não está disponível agora.'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Você é um dos primeiros a jogar/)).not.toBeInTheDocument()
  })

  it('sem viés (vies null), não mostra o parágrafo do viés', async () => {
    const semVies: RespostaResultado = { ...respostaOk, avaliacao: { ...respostaOk.avaliacao, vies: null } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => semVies }))
    render(<Quiz {...daRodada} afirmacoes={afirmacoesValidas} erroPorAfirmacao={null} embaralharFn={identidade} />)
    const user = userEvent.setup()
    for (let i = 0; i < 12; i++) {
      await user.click(screen.getByRole('button', { name: 'Verdade' }))
      await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
    }
    const secao = (await screen.findByText('Texto da avaliação.')).closest('section')!
    expect(secao.querySelectorAll('p.text-stone-700')).toHaveLength(0)
    expect(screen.queryByText('Texto do viés.')).not.toBeInTheDocument()
  })
})
