import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PainelVeredito } from '@/components/PainelVeredito'
import type { AfirmacaoNoQuiz } from '@/components/tipos'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'

const semLado = ({ lado: _lado, ...resto }: (typeof afirmacoesValidas)[number]): AfirmacaoNoQuiz => resto
const afirmacao = semLado(afirmacoesValidas[0])

afterEach(cleanup)

function renderizar(extra: Partial<Parameters<typeof PainelVeredito>[0]> = {}) {
  const onFechar = vi.fn()
  render(
    <PainelVeredito
      afirmacao={afirmacao}
      respostaDada={afirmacao.veredito}
      erroPct={42}
      ultima={false}
      onFechar={onFechar}
      reduzirMovimento={false}
      {...extra}
    />,
  )
  return { onFechar }
}

const painel = () => screen.getByRole('dialog', { name: 'Veredito da afirmação' })

describe('PainelVeredito', () => {
  it('mostra selo, mensagem, autor, citação, explicação, % erraram e link', () => {
    renderizar()
    expect(painel()).toHaveAttribute('aria-modal', 'true')
    expect(painel()).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Você acertou.')).toBeInTheDocument()
    expect(screen.getByText(`Quem disse: ${afirmacao.autor}`)).toBeInTheDocument()
    expect(screen.getByText(`“${afirmacao.citacao}”`)).toBeInTheDocument()
    expect(screen.getByText(afirmacao.explicacao)).toBeInTheDocument()
    expect(screen.getByText('42% das pessoas erraram esta.')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: `Ver a checagem (${afirmacao.fonte_nome})` })
    expect(link).toHaveAttribute('href', afirmacao.fonte_url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(document.querySelector('[data-backdrop]')).toBeInTheDocument()
  })

  it('sem erroPct não mostra a linha de % erraram', () => {
    renderizar({ erroPct: null })
    expect(screen.queryByText(/das pessoas erraram/)).not.toBeInTheDocument()
  })

  it('foco vai para o botão de avanço ao abrir (Próxima e Ver meu resultado)', () => {
    renderizar()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Próxima' }))
    cleanup()
    renderizar({ ultima: true })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Ver meu resultado' }))
  })

  it('painel limita a altura e só o conteúdo rola; o botão fica fora da rolagem', () => {
    renderizar()
    expect(painel()).toHaveClass('max-h-[85dvh]', 'overflow-hidden')
    const conteudo = painel().querySelector('[data-conteudo-painel]')!
    expect(conteudo).toHaveClass('overflow-y-auto', 'min-h-0', 'flex-1')
    expect(conteudo.contains(screen.getByRole('button', { name: /Próxima|Ver meu resultado/ }))).toBe(false)
  })

  it('painel tem aria-label "Veredito da afirmação"', () => {
    renderizar()
    expect(painel()).toHaveAttribute('aria-label', 'Veredito da afirmação')
  })

  it('Tab a partir do último elemento volta ao primeiro (foco contido)', () => {
    renderizar()
    const link = screen.getByRole('link')
    const botao = screen.getByRole('button', { name: 'Próxima' })
    botao.focus()
    fireEvent.keyDown(botao, { key: 'Tab' })
    expect(document.activeElement).toBe(link)
    fireEvent.keyDown(link, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(botao)
  })

  it('Próxima chama onFechar', () => {
    const { onFechar } = renderizar()
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(onFechar).toHaveBeenCalledTimes(1)
  })

  it('arrastar a alça para baixo além de 80 px fecha', () => {
    const { onFechar } = renderizar()
    const alca = document.querySelector('[data-alca]') as HTMLElement
    fireEvent.pointerDown(alca, { pointerId: 1, clientY: 100 })
    fireEvent.pointerUp(alca, { pointerId: 1, clientY: 150 })
    expect(onFechar).not.toHaveBeenCalled()
    fireEvent.pointerDown(alca, { pointerId: 1, clientY: 100 })
    fireEvent.pointerUp(alca, { pointerId: 1, clientY: 190 })
    expect(onFechar).toHaveBeenCalledTimes(1)
  })

  it('Escape não fecha', () => {
    const { onFechar } = renderizar()
    fireEvent.keyDown(painel(), { key: 'Escape' })
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(document.querySelector('[data-backdrop]') as HTMLElement)
    expect(onFechar).not.toHaveBeenCalled()
    expect(painel()).toBeInTheDocument()
  })

  it('última mostra "Ver meu resultado"', () => {
    renderizar({ ultima: true })
    expect(screen.getByRole('button', { name: 'Ver meu resultado' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Próxima' })).not.toBeInTheDocument()
  })

  it('reduzirMovimento sem classe de transição', () => {
    renderizar({ reduzirMovimento: true })
    expect(painel()).not.toHaveClass('transition-transform')
    expect(painel()).toHaveClass('translate-y-0')
    cleanup()
    renderizar()
    expect(painel()).toHaveClass('transition-transform')
  })

  it('trava a rolagem da página enquanto aberto e restaura o valor anterior', () => {
    document.body.style.overflow = 'auto'
    renderizar()
    expect(document.body.style.overflow).toBe('hidden')
    cleanup()
    expect(document.body.style.overflow).toBe('auto')
    document.body.style.overflow = ''
  })

  it('entra de baixo: começa com translate-y-full', () => {
    renderizar()
    expect(painel()).toHaveClass('translate-y-full')
  })

  it('foco no botão não rola o painel (preventScroll)', () => {
    const focar = vi.spyOn(HTMLElement.prototype, 'focus')
    renderizar()
    expect(focar).toHaveBeenCalledWith({ preventScroll: true })
    focar.mockRestore()
  })

  it('a alça tem área de toque de 48 px e o diálogo é descrito pela mensagem', () => {
    renderizar()
    expect(document.querySelector('[data-alca]')).toHaveClass('min-h-12', 'touch-none')
    const descricao = document.getElementById(painel().getAttribute('aria-describedby') ?? '')
    expect(descricao).toHaveTextContent('Você acertou.')
  })

  it('selo do painel usa a palavra da checagem, em estilo carimbo', () => {
    render(<PainelVeredito afirmacao={{ ...afirmacao, veredito: 'enganoso' }} respostaDada="enganoso" erroPct={null} ultima={false} onFechar={() => {}} reduzirMovimento />)
    const selo = screen.getByText('Enganoso')
    expect(selo).toHaveClass('font-letreiro')
    expect(selo.className).toMatch(/border-cheira/)
  })

  it('painel: superfície branca, borda de cima e sombra dupla papel/tinta, cantos retos', () => {
    renderizar()
    expect(painel()).toHaveClass(
      'bg-superficie',
      'text-tinta',
      'border-t-[3px]',
      'border-tinta',
      'shadow-[0_-8px_0_var(--color-papel),0_-12px_0_var(--color-tinta)]',
      'rounded-none',
    )
    expect(painel()).not.toHaveClass('rounded-t-3xl')
    expect(screen.getByText('Você acertou.')).toHaveClass('text-lg', 'font-bold')
    expect(screen.getByText(`“${afirmacao.citacao}”`)).toHaveClass('border-l-[3px]', 'border-tinta')
  })

  it('pointercancel na alça não fecha', () => {
    const { onFechar } = renderizar()
    const alca = document.querySelector('[data-alca]') as HTMLElement
    fireEvent.pointerDown(alca, { pointerId: 1, clientY: 100 })
    fireEvent.pointerCancel(alca, { pointerId: 1, clientY: 300 })
    fireEvent.pointerUp(alca, { pointerId: 1, clientY: 300 })
    expect(onFechar).not.toHaveBeenCalled()
  })
})
