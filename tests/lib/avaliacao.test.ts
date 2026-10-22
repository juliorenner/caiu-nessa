import { expect, it } from 'vitest'
import { gerarAvaliacao, porcentagem } from '@/lib/avaliacao'
import type { Resultado } from '@/lib/pontuacao'

const base: Resultado = { acertos: 12, total: 12, acertosEsquerda: 6, acertosDireita: 6, acreditadasEsquerda: 0, acreditadasDireita: 0 }
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
it('porcentagem(0, 0) é 0', () => expect(porcentagem(0, 0)).toBe(0))
