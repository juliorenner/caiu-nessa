import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ComoEscolhemos from '@/app/como-escolhemos/page'
import { ALCANCES } from '@/lib/afirmacoes'
import {
  COMPOSICAO_EXTRA,
  COMPOSICAO_PRIMEIRA,
  TOTAL_AFIRMACOES,
  descricaoDaComposicao,
  descricaoDoAlcance,
  tamanhoDa,
} from '@/lib/rodadas'

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

  it('conta os rótulos de contexto como enganoso e não conta os que não dizem se é verdade', () => {
    const { container } = render(<ComoEscolhemos />)
    const texto = container.textContent!.replace(/\s+/g, ' ')
    expect(texto).toContain('Falta contexto')
    expect(texto).toContain('Verdadeiro em partes')
    expect(texto).toContain('Subestimado')
    expect(texto).toMatch(/Insustentável, Contraditório, Ainda é cedo e Sem contexto suficiente\) não contam como voto/)
  })

  it('explica a divergência: verdadeiro contra falso fica de fora; nos outros casos, maioria', () => {
    const { container } = render(<ComoEscolhemos />)
    const texto = container.textContent!.replace(/\s+/g, ' ')
    expect(texto).toContain('se uma diz verdadeiro e outra diz falso, ela fica de fora')
    expect(texto).toContain('vale a maioria')
    expect(texto).toContain('empate entre verdadeiro e enganoso, vale enganoso')
    expect(texto).toContain('empate entre falso e enganoso, vale falso')
  })

  it('conta como o pool é revisado e onde ficam as afirmações fora do jogo', () => {
    const { container } = render(<ComoEscolhemos />)
    const texto = container.textContent!.replace(/\s+/g, ' ')
    expect(texto).toContain(
      'revisado todo mês por um agente automatizado, e cada mudança chega como um pull request público no repositório',
    )
    expect(texto).toContain('As afirmações que ficam fora do jogo aparecem na lista pública, com o motivo.')
    expect(texto).toContain('Uma afirmação também fica de fora quando o cartão não consegue ser fiel à fala sem confundir quem joga')
  })

  it('publica o critério de alcance e a preferência da primeira rodada', () => {
    const { container } = render(<ComoEscolhemos />)
    const texto = container.textContent!.replace(/\s+/g, ' ')
    for (const a of ALCANCES) expect(texto).toContain(descricaoDoAlcance(a))
    expect(texto).toContain(
      'A primeira rodada dá preferência às afirmações de maior alcance, igualmente nos dois lados; a composição por lado e veredito não muda.',
    )
  })
})
