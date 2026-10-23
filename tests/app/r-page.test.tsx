import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
vi.mock('next/navigation', () => ({ notFound: () => notFound() }))

import Pagina, { generateMetadata } from '@/app/r/[codigo]/page'

const CODIGO = '4-12-3-caiu-feio-aeaqeeaeeqea'
const params = (codigo: string) => Promise.resolve({ codigo })

beforeEach(() => {
  notFound.mockClear()
})

describe('página /r/[codigo]', () => {
  it('mostra o placar do amigo, a faixa, a grade e o botão Começar', async () => {
    render(await Pagina({ params: params(CODIGO) }))
    expect(screen.getByText('Placar de um amigo')).toBeInTheDocument()
    expect(screen.getByText('Rodada de 12')).toBeInTheDocument()
    expect(screen.getByText('4/12')).toHaveAttribute('aria-hidden')
    expect(screen.getByText('4 de 12')).toHaveClass('sr-only')
    expect(screen.getByRole('heading', { level: 1, name: 'Caiu feio' })).toBeInTheDocument()
    expect(screen.getByText('Caiu em 3 das falsas ou enganosas.')).toBeInTheDocument()
    const grade = screen.getByRole('list', { name: 'Acertos e erros na ordem jogada' })
    const casas = grade.querySelectorAll('li[data-casa]')
    expect(casas).toHaveLength(12)
    expect([...casas].map(c => c.getAttribute('data-casa')!.charAt(0)).join('')).toBe('aeaqeeaeeqea')
    expect(casas[3]).toHaveTextContent('quase')
    expect(screen.getByRole('link', { name: 'Começar' })).toHaveAttribute('href', '/quiz')
    expect(screen.getByRole('link', { name: 'Como escolhemos as afirmações' })).toHaveAttribute(
      'href',
      '/como-escolhemos',
    )
  })

  it('diz que não caiu em nenhuma quando c = 0', async () => {
    render(await Pagina({ params: params('6-6-0-imune-aaaaaa') }))
    expect(screen.getByText('Rodada de 6')).toBeInTheDocument()
    expect(screen.getByText('Não caiu em nenhuma.')).toBeInTheDocument()
  })

  it('código inválido chama notFound', async () => {
    await expect(Pagina({ params: params('4-12-9-caiu-feio-aeaqeeaeeqea') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})

describe('generateMetadata de /r/[codigo]', () => {
  it('usa título, descrição e a imagem da rota', async () => {
    const m = await generateMetadata({ params: params(CODIGO) })
    const titulo = 'Alguém fez 4/12 no Caiu Nessa?'
    const descricao =
      'Caiu em 3 das falsas ou enganosas. E você? 12 afirmações da eleição: verdade, mentira ou cheira mal.'
    expect(m).toEqual({
      title: titulo,
      description: descricao,
      openGraph: { title: titulo, description: descricao, images: [`/r/${CODIGO}/opengraph-image`] },
      twitter: { card: 'summary_large_image', title: titulo, description: descricao },
    })
  })

  // O convite é para quem recebe: a primeira rodada dele é sempre de 12.
  it('c = 0 vira "Não caiu em nenhuma."', async () => {
    const m = await generateMetadata({ params: params('6-6-0-imune-aaaaaa') })
    expect(m.description).toBe(
      'Não caiu em nenhuma. E você? 12 afirmações da eleição: verdade, mentira ou cheira mal.',
    )
  })

  it('código inválido chama notFound', async () => {
    await expect(generateMetadata({ params: params('nada') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
