import { expect, it } from 'vitest'
import type { Casa } from '@/lib/cartao'
import { NOME_ARQUIVO, gradeDeCasas, textoDeCompartilhar } from '@/lib/compartilhar'

const doze: Casa[] = ['acerto', 'erro', 'acerto', 'acerto', 'erro', 'quase', 'erro', 'acerto', 'erro', 'erro', 'acerto', 'acerto']

it('texto com caiu > 0: título, duas linhas de 6 emojis e o domínio no fim', () => {
  expect(textoDeCompartilhar({ acertos: 4, total: 12, caiu: 3, casas: doze })).toBe(
    'Fiz 4/12 no Caiu Nessa? e caí em 3. E você?\n✅❌✅✅❌🤔\n❌✅❌❌✅✅\ncaiunessa.com.br',
  )
})
it('texto com caiu 0: não caí em nenhuma', () => {
  const linhas = textoDeCompartilhar({ acertos: 12, total: 12, caiu: 0, casas: Array<Casa>(12).fill('acerto') }).split('\n')
  expect(linhas[0]).toBe('Fiz 12/12 no Caiu Nessa? e não caí em nenhuma. E você?')
  expect(linhas).toHaveLength(4)
  expect(linhas[3]).toBe('caiunessa.com.br')
})
it('rodada extra de 6 casas: uma linha só', () => {
  expect(textoDeCompartilhar({ acertos: 3, total: 6, caiu: 1, casas: doze.slice(0, 6) })).toBe(
    'Fiz 3/6 no Caiu Nessa? e caí em 1. E você?\n✅❌✅✅❌🤔\ncaiunessa.com.br',
  )
})
it('gradeDeCasas usa ✅ ❌ 🤔', () => expect(gradeDeCasas(['acerto', 'erro', 'quase'])).toBe('✅❌🤔'))
it('gradeDeCasas quebra a cada 6', () => expect(gradeDeCasas(doze)).toBe('✅❌✅✅❌🤔\n❌✅❌❌✅✅'))
it('nome do arquivo da imagem', () => expect(NOME_ARQUIVO).toBe('caiu-nessa-placar.png'))
