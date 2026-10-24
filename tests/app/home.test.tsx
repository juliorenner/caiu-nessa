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
    const emLg = links.filter((l) => !l.classList.contains('lg:hidden'))
    expect(emLg).toHaveLength(1)
    expect(emLg[0].parentElement).toHaveClass('hidden', 'lg:flex')
  })

  it('define "Cheira mal" uma vez por tamanho, visível para leitor de tela', () => {
    render(<Home />)
    const linhas = screen.getAllByText('Cheira mal = verdade pela metade: exagero, falta de contexto ou número torto')
    expect(linhas).toHaveLength(2)
    expect(linhas.filter((l) => l.classList.contains('lg:hidden'))).toHaveLength(1)
    expect(linhas.filter((l) => l.classList.contains('hidden') && l.classList.contains('lg:block'))).toHaveLength(1)
    for (const l of linhas) expect(l.closest('[aria-hidden]')).toBeNull()
  })

  it('o link do GitHub (ícone + texto) aparece uma vez por tamanho, ao lado do "Como escolhemos"', () => {
    render(<Home />)
    const links = screen.getAllByRole('link', { name: 'Código aberto' })
    expect(links).toHaveLength(2)
    for (const l of links) {
      expect(l).toHaveAttribute('href', 'https://github.com/juliorenner/caiu-nessa')
      expect(l.querySelector('svg')).not.toBeNull()
      expect(l).toHaveTextContent('Código aberto')
    }
    expect(links.filter((l) => l.classList.contains('lg:hidden'))).toHaveLength(1)
    const emLg = links.filter((l) => !l.classList.contains('lg:hidden'))
    expect(emLg).toHaveLength(1)
    expect(emLg[0].parentElement).toHaveClass('hidden', 'lg:flex')
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

describe('home: afirmações e "Nos ajude a melhorar"', () => {
  it('link para todas as afirmações uma vez por tamanho (no cartão no celular, ao lado do Começar em lg)', () => {
    render(<Home />)
    const links = screen.getAllByRole('link', { name: 'Ver todas as afirmações e suas fontes' })
    expect(links.map(l => l.getAttribute('href'))).toEqual(['/afirmacoes', '/afirmacoes'])
    expect(links[0]).toHaveClass('lg:hidden')
  })

  it('painel com sugerir e reportar', () => {
    render(<Home />)
    const painel = screen.getByRole('navigation', { name: 'Nos ajude a melhorar' })
    expect(painel).toContainElement(screen.getByRole('link', { name: /Sugerir uma afirmação que está faltando/ }))
    expect(screen.getByRole('link', { name: /Sugerir uma afirmação/ })).toHaveAttribute('href', '/sugerir')
    expect(screen.getByRole('link', { name: /Teve algum problema\? Reporte aqui/ })).toHaveAttribute('href', '/relatar')
  })
})
