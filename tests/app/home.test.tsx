import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Home from '@/app/page'
import { FocoNoComecar } from '@/components/FocoNoComecar'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('home em telas largas', () => {
  it('Começar tem id e a tecla Enter (o nome acessível não muda)', () => {
    render(<Home />)
    const comecar = screen.getByRole('link', { name: 'Começar' })
    expect(comecar).toHaveAttribute('id', 'comecar')
    const kbd = comecar.querySelector('kbd')
    expect(kbd).toHaveTextContent('Enter')
    expect(kbd).toHaveAttribute('aria-hidden', 'true')
  })

  it('legenda das setas com teclas e o mouse', () => {
    const { container } = render(<Home />)
    const teclas = [...container.querySelectorAll('kbd')].map((k) => k.textContent)
    expect(teclas).toEqual(expect.arrayContaining(['←', '↑', '→']))
    expect(screen.getByText('ou arraste com o mouse')).toBeInTheDocument()
  })

  it('a prévia do cartão é decorativa', () => {
    render(<Home />)
    expect(screen.getByText('Ninguém cai em fake news.').closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('a dica de toque some em lg', () => {
    render(<Home />)
    expect(screen.getByText('Arraste o cartão ou toque')).toHaveClass('lg:hidden')
  })

  it('o link "Como escolhemos" aparece uma vez por tamanho', () => {
    render(<Home />)
    const links = screen.getAllByRole('link', { name: 'Como escolhemos as afirmações' })
    expect(links).toHaveLength(2)
    expect(links.filter((l) => l.classList.contains('lg:hidden'))).toHaveLength(1)
    expect(links.filter((l) => l.classList.contains('hidden') && l.classList.contains('lg:inline'))).toHaveLength(1)
  })
})

describe('FocoNoComecar', () => {
  function montar(largo: boolean) {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: largo && q === '(min-width: 1024px)', media: q }))
    render(
      <>
        <a id="alvo" href="/quiz">
          Começar
        </a>
        <FocoNoComecar alvoId="alvo" />
      </>,
    )
  }

  it('em lg dá foco ao alvo', async () => {
    await act(async () => montar(true))
    expect(document.activeElement).toBe(document.getElementById('alvo'))
  })

  it('abaixo de lg não mexe no foco', async () => {
    await act(async () => montar(false))
    expect(document.activeElement).toBe(document.body)
  })

  it('em lg, Enter com o foco fora do link segue o link mesmo assim', async () => {
    await act(async () => montar(true))
    const alvo = document.getElementById('alvo') as HTMLAnchorElement
    const clique = vi.fn((e: Event) => e.preventDefault())
    alvo.addEventListener('click', clique)
    document.body.focus()
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(clique).toHaveBeenCalledTimes(1)
  })

  it('em lg, Enter num campo ou botão não dispara o atalho', async () => {
    await act(async () => montar(true))
    const alvo = document.getElementById('alvo') as HTMLAnchorElement
    const clique = vi.fn((e: Event) => e.preventDefault())
    alvo.addEventListener('click', clique)
    const botao = document.createElement('button')
    document.body.appendChild(botao)
    fireEvent.keyDown(botao, { key: 'Enter' })
    expect(clique).not.toHaveBeenCalled()
  })

  it('abaixo de lg, Enter não faz nada', async () => {
    await act(async () => montar(false))
    const alvo = document.getElementById('alvo') as HTMLAnchorElement
    const clique = vi.fn((e: Event) => e.preventDefault())
    alvo.addEventListener('click', clique)
    fireEvent.keyDown(document.body, { key: 'Enter' })
    expect(clique).not.toHaveBeenCalled()
  })
})
