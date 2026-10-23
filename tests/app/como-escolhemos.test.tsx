import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ComoEscolhemos from '@/app/como-escolhemos/page'
import { COMPOSICAO_EXTRA, COMPOSICAO_PRIMEIRA, TOTAL_AFIRMACOES, descricaoDaComposicao, tamanhoDa } from '@/lib/rodadas'

describe('página /como-escolhemos', () => {
  it('chama o botão de "Cheira mal"', () => {
    render(<ComoEscolhemos />)
    expect(screen.getByText(/o botão "Cheira mal"/)).toBeInTheDocument()
  })

  it('descreve as rodadas a partir da configuração', () => {
    const { container } = render(<ComoEscolhemos />)
    const frase =
      `a primeira rodada tem ${TOTAL_AFIRMACOES} afirmações: de cada lado, ${descricaoDaComposicao(COMPOSICAO_PRIMEIRA)}; ` +
      `as seguintes têm ${tamanhoDa(COMPOSICAO_EXTRA)}, de cada lado, ${descricaoDaComposicao(COMPOSICAO_EXTRA)}.`
    expect(container.textContent!.replace(/\s+/g, ' ')).toContain(frase)
  })
})
