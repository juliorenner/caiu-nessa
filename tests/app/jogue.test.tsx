import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

import PaginaConvite, { metadata } from '@/app/jogue/page'
import PaginaPercentil, { generateMetadata } from '@/app/jogue/[p]/page'
import { ehPercentilCompartilhavel, lerPercentil } from '@/lib/percentil'

const params = (p: string) => Promise.resolve({ p })

describe('percentil compartilhável', () => {
  it('só de 1 a 99, inteiro', () => {
    expect([1, 50, 99].map(ehPercentilCompartilhavel)).toEqual([true, true, true])
    expect([0, 100, 1.5, null].map(ehPercentilCompartilhavel)).toEqual([false, false, false, false])
    expect(['73', '0', '100', 'x', '', null, undefined].map(lerPercentil)).toEqual([73, null, null, null, null, null, null])
  })
})

describe('/jogue (link do convite)', () => {
  it('é a capa, com título de convite e canonical na capa', () => {
    render(<PaginaConvite />)
    expect(screen.getByRole('link', { name: /Começar/ })).toHaveAttribute('href', '/quiz')
    expect(metadata.title).toBe('Já joguei o Caiu Nessa? E você, cai nessa?')
    expect(metadata.alternates?.canonical).toBe('/')
  })
})

describe('/jogue/[p] (link da comparação)', () => {
  it('é a capa, com o percentil no título e a prévia declarada', async () => {
    render(await PaginaPercentil({ params: params('73') }))
    expect(screen.getByRole('link', { name: /Começar/ })).toHaveAttribute('href', '/quiz')
    const meta = await generateMetadata({ params: params('73') })
    expect(meta.title).toBe('Acertei mais que 73% das pessoas no Caiu Nessa? Como será que você se sai?')
    expect(meta.openGraph?.images).toEqual(['/jogue/73/opengraph-image'])
    expect(meta.alternates?.canonical).toBe('/')
  })

  it('fora de 1 a 99: 404', async () => {
    for (const p of ['0', '100', 'x']) {
      await expect(PaginaPercentil({ params: params(p) })).rejects.toThrow('NEXT_NOT_FOUND')
    }
  })
})
