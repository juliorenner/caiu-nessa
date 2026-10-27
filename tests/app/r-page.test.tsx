import { porLinha, TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { DESCRICAO } from '@/lib/site'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})
vi.mock('next/navigation', () => ({ notFound: () => notFound() }))

import Pagina, { generateMetadata } from '@/app/r/[codigo]/page'

// Uma rodada completa do tamanho atual: acerto, erro, acerto, quase, em ciclo.
const G = Array.from({ length: TOTAL_AFIRMACOES }, (_, i) => 'aeaq'[i % 4]).join('')
const A = [...G].filter(l => l === 'a').length
const CODIGO = `${A}-${TOTAL_AFIRMACOES}-1-caiu-feio-${G}`
const params = (codigo: string) => Promise.resolve({ codigo })

beforeEach(() => {
  notFound.mockClear()
})

describe('página /r/[codigo]', () => {
  it('explica o jogo antes do Começar', async () => {
    render(await Pagina({ params: Promise.resolve({ codigo: CODIGO }) }))
    expect(screen.getByText(DESCRICAO)).toBeInTheDocument()
  })

  it('mostra o placar do amigo, a faixa, a grade e o botão Começar', async () => {
    render(await Pagina({ params: params(CODIGO) }))
    expect(screen.getByText('Placar de um amigo')).toBeInTheDocument()
    expect(screen.getByText(`Rodada de ${TOTAL_AFIRMACOES}`)).toBeInTheDocument()
    expect(screen.getByText(`${A}/${TOTAL_AFIRMACOES}`)).toHaveAttribute('aria-hidden')
    expect(screen.getByText(`${A} de ${TOTAL_AFIRMACOES}`)).toHaveClass('sr-only')
    expect(screen.getByRole('heading', { level: 1, name: 'Caiu feio' })).toBeInTheDocument()
    expect(screen.getByText('Caiu em 1 das falsas ou enganosas.')).toBeInTheDocument()
    const grade = screen.getByRole('list', { name: 'Acertos e erros na ordem jogada' })
    expect(grade).toHaveStyle({ gridTemplateColumns: `repeat(${porLinha(TOTAL_AFIRMACOES)}, max-content)` })
    const casas = grade.querySelectorAll('li[data-casa]')
    expect(casas).toHaveLength(TOTAL_AFIRMACOES)
    expect([...casas].map(c => c.getAttribute('data-casa')!.charAt(0)).join('')).toBe(G)
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

  it('aceita link antigo de 12 em grade 2×6', async () => {
    render(await Pagina({ params: params('4-12-3-caiu-feio-aeaqeeaeeqea') }))
    expect(screen.getByText('Rodada de 12')).toBeInTheDocument()
    const grade = screen.getByRole('list', { name: 'Acertos e erros na ordem jogada' })
    expect(grade).toHaveStyle({ gridTemplateColumns: 'repeat(6, max-content)' })
    expect(grade.querySelectorAll('li[data-casa]')).toHaveLength(12)
  })

  it('recusa tamanho que nunca existiu (7)', async () => {
    await expect(Pagina({ params: params('4-7-3-caiu-feio-aeaqeea') })).rejects.toThrow('NEXT_NOT_FOUND')
  })

  it('código inválido chama notFound', async () => {
    await expect(Pagina({ params: params(`${A}-${TOTAL_AFIRMACOES}-99-caiu-feio-${G}`) })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})

describe('generateMetadata de /r/[codigo]', () => {
  it('usa título, descrição e a imagem da rota', async () => {
    const m = await generateMetadata({ params: params(CODIGO) })
    const titulo = `Alguém fez ${A}/${TOTAL_AFIRMACOES} no Caiu Nessa?`
    const descricao = `Caiu em 1 das falsas ou enganosas. E você? ${TOTAL_AFIRMACOES} afirmações do mundo político brasileiro: verdade, mentira ou cheira mal.`
    expect(m).toEqual({
      title: titulo,
      description: descricao,
      openGraph: { title: titulo, description: descricao, images: [`/r/${CODIGO}/opengraph-image`] },
      twitter: { card: 'summary_large_image', title: titulo, description: descricao },
    })
  })

  // O convite é para quem recebe: a primeira rodada dele tem sempre TOTAL_AFIRMACOES, qualquer que seja a do amigo.
  it('c = 0 vira "Não caiu em nenhuma."', async () => {
    const m = await generateMetadata({ params: params('6-6-0-imune-aaaaaa') })
    expect(m.description).toBe(
      `Não caiu em nenhuma. E você? ${TOTAL_AFIRMACOES} afirmações do mundo político brasileiro: verdade, mentira ou cheira mal.`,
    )
  })

  it('código inválido chama notFound', async () => {
    await expect(generateMetadata({ params: params('nada') })).rejects.toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalledTimes(1)
  })
})
