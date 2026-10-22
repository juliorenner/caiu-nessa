import { expect, it } from 'vitest'
import { gerarAvaliacao, porcentagem } from '@/lib/avaliacao'
import type { Resultado } from '@/lib/pontuacao'

const base: Resultado = { acertos: 12, total: 12, acertosEsquerda: 6, acertosDireita: 6, acreditadasEsquerda: 0, acreditadasDireita: 0,
  desconfiadasEsquerda: 0, desconfiadasDireita: 0, grauErradoEsquerda: 0, grauErradoDireita: 0 }
it.each([[12, 'Imune'], [9, 'Quase imune'], [11, 'Quase imune'], [8, 'Abre o olho'], [5, 'Abre o olho'], [4, 'Caiu feio'], [0, 'Caiu feio']])(
  'acertos %i -> título %s', (acertos, titulo) => expect(gerarAvaliacao({ ...base, acertos }).titulo).toBe(titulo))
it('texto do tier "Abre o olho" traz a % de falsas ou enganosas acreditadas', () => {
  const a = gerarAvaliacao({ ...base, acertos: 7, acreditadasEsquerda: 2, acreditadasDireita: 2 })
  expect(a.texto).toBe('Você acreditou em 50% das afirmações falsas ou enganosas.')
})
it('viés compara os dois lados', () => {
  const a = gerarAvaliacao({ ...base, acertos: 7, acreditadasEsquerda: 4, acreditadasDireita: 1 })
  expect(a.vies).toBe('Você acreditou em 100% das falsas ou enganosas da esquerda e 25% das da direita.')
})
it('caso relatado: 8 acertos sem acreditar em nenhuma falsa — desconfiou de verdades (empate D=G, D vence)', () => {
  const a = gerarAvaliacao({ ...base, acertos: 8, desconfiadasEsquerda: 1, desconfiadasDireita: 1, grauErradoEsquerda: 2 })
  expect(a.titulo).toBe('Abre o olho')
  expect(a.texto).toBe('Você desconfiou de 50% das verdades.')
  expect(a.vies).toBe('Você desconfiou de 50% das verdades da esquerda e 50% das da direita.')
})
it('9–11 com grau errado dominante: texto do tier, viés por grau', () => {
  const a = gerarAvaliacao({ ...base, acertos: 9, grauErradoEsquerda: 2, grauErradoDireita: 1 })
  expect(a.texto).toBe('Você caiu em poucas, mas caiu. Vale conferir quais.')
  expect(a.vies).toBe('Você errou o grau em 2 afirmações da esquerda e 1 da direita.')
})
it('5–8 com grau errado dominante', () => {
  const a = gerarAvaliacao({ ...base, acertos: 8, grauErradoEsquerda: 2, grauErradoDireita: 1, desconfiadasEsquerda: 1 })
  expect(a.texto).toBe(
    'Você percebeu o que não era verdade, mas errou o grau em 3 delas: trocou mentira por enganoso, ou o contrário.')
})
it('grau errado em uma delas', () => {
  const a = gerarAvaliacao({ ...base, acertos: 5, grauErradoDireita: 1 })
  expect(a.texto).toBe(
    'Você percebeu o que não era verdade, mas errou o grau em uma delas: trocou mentira por enganoso, ou o contrário.')
})
it('0–4 com grau errado dominante tem o sufixo', () => {
  const a = gerarAvaliacao({ ...base, acertos: 4, grauErradoEsquerda: 4, grauErradoDireita: 4 })
  expect(a.texto).toBe(
    'Você percebeu o que não era verdade, mas errou o grau em 8 delas: trocou mentira por enganoso, ou o contrário. Vale conferir quais.')
})
it('acreditadas vence empates', () => {
  const a = gerarAvaliacao({ ...base, acertos: 8, acreditadasEsquerda: 2, desconfiadasDireita: 2 })
  expect(a.texto).toBe('Você acreditou em 25% das afirmações falsas ou enganosas.')
  expect(a.vies).toBe('Você acreditou em 50% das falsas ou enganosas da esquerda e 0% das da direita.')
})
it('viés de grau no singular quando a esquerda tem 1', () => {
  const a = gerarAvaliacao({ ...base, acertos: 10, grauErradoEsquerda: 1, grauErradoDireita: 1 })
  expect(a.vies).toBe('Você errou o grau em 1 afirmação da esquerda e 1 da direita.')
})
it('acertos 12 não tem viés', () => expect(gerarAvaliacao(base).vies).toBeNull())
it('9–11 sem nenhum erro classificado (respostas ausentes) não tem viés', () =>
  expect(gerarAvaliacao({ ...base, acertos: 10 }).vies).toBeNull())
it('0–4 sufixo para acreditadas', () => {
  const a = gerarAvaliacao({ ...base, acertos: 2, acreditadasEsquerda: 4, acreditadasDireita: 2 })
  expect(a.texto).toBe('Você acreditou em 75% das afirmações falsas ou enganosas. Hora de desconfiar mais.')
})
it('0–4 sufixo para desconfiadas', () => {
  const a = gerarAvaliacao({ ...base, acertos: 4, desconfiadasEsquerda: 2, desconfiadasDireita: 2, grauErradoEsquerda: 3 })
  expect(a.texto).toBe('Você desconfiou de 100% das verdades. Nem tudo é mentira.')
})
it('porcentagem(0, 0) é 0', () => expect(porcentagem(0, 0)).toBe(0))
