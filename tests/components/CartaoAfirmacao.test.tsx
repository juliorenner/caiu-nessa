import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CartaoAfirmacao, tamanhoDoTexto } from '@/components/CartaoAfirmacao'
import { PilhaDeCartoes } from '@/components/PilhaDeCartoes'
import type { AfirmacaoNoQuiz } from '@/components/tipos'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'

const semLado = ({ lado: _lado, ...resto }: (typeof afirmacoesValidas)[number]): AfirmacaoNoQuiz => resto
const afirmacao = semLado(afirmacoesValidas[0])
const proxima = semLado(afirmacoesValidas[1])

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 300,
    height: 400,
    top: 0,
    left: 0,
    right: 300,
    bottom: 400,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect)
})
afterEach(() => vi.restoreAllMocks())

const ponteiro = (x: number, y: number) => ({ pointerId: 1, button: 0, clientX: x, clientY: y })

function cartao() {
  return screen.getByRole('group', { name: 'Afirmação' })
}

describe('CartaoAfirmacao', () => {
  it('arrastar para a direita além do limiar chama onResposta(verdadeiro)', () => {
    const onResposta = vi.fn()
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={onResposta} reduzirMovimento={false} semente={0} />)
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(140, 12))
    fireEvent.pointerUp(cartao(), ponteiro(140, 12))
    expect(onResposta).toHaveBeenCalledExactlyOnceWith('verdadeiro')
  })

  it('mostra o selo Mentira enquanto arrasta para a esquerda', () => {
    const { container } = render(
      <CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={0} />,
    )
    fireEvent.pointerDown(cartao(), ponteiro(200, 10))
    fireEvent.pointerMove(cartao(), ponteiro(120, 10))
    const selo = container.querySelector<HTMLElement>('span[data-selo="falso"]')
    expect(selo).not.toBeNull()
    expect(selo).toHaveTextContent('Mentira')
    expect(Number(selo!.style.opacity)).toBeGreaterThan(0)
    expect(cartao().style.transform).toContain('translate(-80px, 0px)')
  })

  it('toque sem arrasto não responde e não mostra selo', () => {
    const onResposta = vi.fn()
    const { container } = render(
      <CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={onResposta} reduzirMovimento={false} semente={0} />,
    )
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(13, 12))
    expect(container.querySelector('[data-selo]')).toBeNull()
    fireEvent.pointerUp(cartao(), ponteiro(13, 12))
    expect(onResposta).not.toHaveBeenCalled()
  })

  it('fase respondido ignora gestos e mantém o selo da resposta', () => {
    const onResposta = vi.fn()
    const { container } = render(
      <CartaoAfirmacao afirmacao={afirmacao} fase="respondido" respostaDada="enganoso" onResposta={onResposta} reduzirMovimento={false} semente={0} />,
    )
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(200, 10))
    fireEvent.pointerUp(cartao(), ponteiro(200, 10))
    expect(onResposta).not.toHaveBeenCalled()
    const selo = container.querySelector<HTMLElement>('span[data-selo]')
    expect(selo).toHaveAttribute('data-selo', 'enganoso')
    expect(selo!.style.opacity).toBe('1')
    expect(cartao().style.transform).toBe('translateY(-40px) rotate(-6deg)')
    expect(cartao()).toHaveClass('transition-transform')
  })

  it('arrasto não tem transição: o cartão segue o dedo', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={0} />)
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(60, 10))
    expect(cartao()).not.toHaveClass('transition-transform')
    expect(cartao().style.transform).toContain('rotate(')
  })

  it('soltar aquém do limiar volta ao centro com mola curta (transição só fora do arrasto)', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={0} />)
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(60, 10))
    expect(cartao()).not.toHaveClass('transition-transform')
    fireEvent.pointerUp(cartao(), ponteiro(60, 10))
    expect(cartao()).toHaveClass('transition-transform', 'duration-200', 'ease-out')
    expect(cartao().style.transform).toBe('translate(0px, 0px) rotate(0deg)')
  })

  it('reduzirMovimento: soltar aquém do limiar não anima', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento semente={0} />)
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(60, 10))
    fireEvent.pointerUp(cartao(), ponteiro(60, 10))
    expect(cartao()).not.toHaveClass('transition-transform')
  })

  it('enganoso saindo: voa para cima ainda inclinado', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="saindo" respostaDada="enganoso" onResposta={vi.fn()} reduzirMovimento={false} semente={0} />)
    expect(cartao().style.transform).toBe('translateY(-120%) rotate(-6deg)')
  })

  it('reduzirMovimento: enganoso respondido sem transform', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="respondido" respostaDada="enganoso" onResposta={vi.fn()} reduzirMovimento semente={0} />)
    expect(cartao().style.transform).toBe('')
  })

  it('dicas de gesto ficam nas bordas do cartão, fora da árvore acessível', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={() => {}} reduzirMovimento semente={0} />)
    for (const t of ['← Mentira', '↑ Cheira mal', 'Verdade →']) expect(screen.getByText(t)).toHaveAttribute('aria-hidden', 'true')
  })

  it('tamanhoDoTexto degrada por comprimento', () => {
    expect(tamanhoDoTexto('a'.repeat(60))).toBe('text-2xl lg:text-[32px]')
    expect(tamanhoDoTexto('a'.repeat(61))).toBe('text-xl lg:text-[28px]')
    expect(tamanhoDoTexto('a'.repeat(90))).toBe('text-xl lg:text-[28px]')
    expect(tamanhoDoTexto('a'.repeat(91))).toBe('text-lg lg:text-2xl')
    expect(tamanhoDoTexto('a'.repeat(160))).toBe('text-lg lg:text-2xl')
    expect(tamanhoDoTexto('a'.repeat(161))).toBe('text-base lg:text-xl')
  })

  it('saindo: classe de transição e voo para fora no eixo da resposta', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="saindo" respostaDada="falso" onResposta={vi.fn()} reduzirMovimento={false} semente={0} />)
    expect(cartao()).toHaveClass('transition-transform')
    expect(cartao().style.transform).toContain('translateX(-120%)')
  })

  it('reduzirMovimento: arrasto translada sem rotate', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento semente={0} />)
    fireEvent.pointerDown(cartao(), ponteiro(10, 10))
    fireEvent.pointerMove(cartao(), ponteiro(60, 10))
    expect(cartao().style.transform).toBe('translate(50px, 0px)')
  })

  it('reduzirMovimento: respondido sem transform, sem rotate e sem transição', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="respondido" respostaDada="verdadeiro" onResposta={vi.fn()} reduzirMovimento semente={0} />)
    expect(cartao().style.transform).toBe('')
    expect(cartao()).not.toHaveClass('transition-transform')
  })

  it('reduzirMovimento: sem classes de transição e sem rotate', () => {
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="saindo" respostaDada="verdadeiro" onResposta={vi.fn()} reduzirMovimento semente={0} />)
    expect(cartao()).not.toHaveClass('transition-transform')
    expect(cartao().style.transform).not.toContain('rotate(')
  })
})

describe('PilhaDeCartoes', () => {
  it('pilha: o próximo cartão está atrás, sem texto e aria-hidden', () => {
    const { container } = render(
      <PilhaDeCartoes atual={afirmacao} proxima={proxima} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={0} />,
    )
    const fundo = container.querySelector<HTMLElement>('[data-verso]')
    expect(fundo).not.toBeNull()
    expect(fundo).toHaveAttribute('aria-hidden', 'true')
    expect(fundo).toHaveClass('scale-95', 'opacity-60')
    expect(fundo).toBeEmptyDOMElement()
    expect(fundo!.compareDocumentPosition(cartao()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText(afirmacao.texto)).toBeInTheDocument()
    expect(screen.queryByText(proxima.texto)).toBeNull()
  })

  it('pilha: só o cartão atual tem ícones; o verso não', () => {
    const { container } = render(
      <PilhaDeCartoes atual={afirmacao} proxima={proxima} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={3} />,
    )
    expect(container.querySelector('[data-verso] [data-icones-cartao]')).toBeNull()
    expect(cartao().querySelector('[data-icones-cartao]')).not.toBeNull()
  })

  it('pilha: sem próxima, sem cartão de fundo', () => {
    const { container } = render(
      <PilhaDeCartoes atual={afirmacao} proxima={null} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={0} />,
    )
    expect(container.querySelector('[data-verso]')).toBeNull()
  })
})

describe('CartaoAfirmacao: ícones', () => {
  it('texto curto: camada com 3 ícones, antes do texto', () => {
    expect(tamanhoDoTexto(afirmacao.texto)).not.toBe('text-base lg:text-xl')
    render(<CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={0} />)
    const camada = cartao().querySelector('[data-icones-cartao]')
    expect(camada).not.toBeNull()
    expect(cartao().firstElementChild).toBe(camada)
    expect(camada!.querySelectorAll('svg')).toHaveLength(3)
  })

  it('texto longo (> 160): 3 ícones, só nas vagas extremas', () => {
    const longa = { ...afirmacao, texto: 'Uma afirmação bem comprida. '.repeat(7) }
    expect(longa.texto.length).toBeGreaterThan(160)
    render(<CartaoAfirmacao afirmacao={longa} fase="ativo" respostaDada={null} onResposta={vi.fn()} reduzirMovimento={false} semente={5} />)
    expect(cartao().querySelectorAll('[data-icones-cartao] svg')).toHaveLength(3)
  })
})
