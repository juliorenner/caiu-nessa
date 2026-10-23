import { expect, it } from 'vitest'
import { NOME_ARQUIVO, textoDeCompartilhar } from '@/lib/compartilhar'

it('texto curto: placar, quantas caiu e o domínio', () => {
  expect(textoDeCompartilhar({ acertos: 4, total: 12, caiu: 3 })).toBe(
    'Fiz 4/12 no Caiu Nessa? e caí em 3. E você?\ncaiunessa.com.br',
  )
})

it('zero caiu', () => {
  expect(textoDeCompartilhar({ acertos: 12, total: 12, caiu: 0 })).toBe(
    'Fiz 12/12 no Caiu Nessa? e não caí em nenhuma. E você?\ncaiunessa.com.br',
  )
})

it('rodada de 6', () => {
  expect(textoDeCompartilhar({ acertos: 3, total: 6, caiu: 1 })).toBe('Fiz 3/6 no Caiu Nessa? e caí em 1. E você?\ncaiunessa.com.br')
})

it('nome do arquivo da imagem', () => expect(NOME_ARQUIVO).toBe('caiu-nessa-placar.png'))
