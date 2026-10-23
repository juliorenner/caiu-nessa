import { expect, it } from 'vitest'
import {
  type Casa,
  casasParaLetras,
  codigoDoResultado,
  letrasParaCasas,
  parametrosDoCodigo,
  parametrosSchema,
  slugDaFaixa,
  urlDoCartao,
  urlDoResultado,
} from '@/lib/cartao'

// 4 letras 'a' em 12.
const valido = { a: '4', t: '12', c: '3', f: 'caiu-feio', g: 'aeaeeqeaeeae' }

it('aceita parâmetros válidos e converte números', () => {
  expect(parametrosSchema.parse(valido)).toEqual({ a: 4, t: 12, c: 3, f: 'caiu-feio', g: 'aeaeeqeaeeae' })
})
it('aceita c igual ao número de letras e em g', () => {
  expect(parametrosSchema.safeParse({ ...valido, c: '7' }).success).toBe(true)
})
it('rejeita caídas sem nenhum erro em g (só quase)', () => {
  expect(parametrosSchema.safeParse({ a: '0', t: '6', c: '1', f: 'caiu-feio', g: 'qqqqqq' }).success).toBe(false)
})
it('aceita rodada de 6', () => {
  expect(parametrosSchema.safeParse({ a: '6', t: '6', c: '0', f: 'imune', g: 'aaaaaa' }).success).toBe(true)
})
it.each([
  ['t fora de {6, 12}', { t: '7' }],
  ['g com 5 letras a quando a=4', { g: 'aaaaaeeeeeee' }],
  ['c maior que o número de e em g', { c: '8' }],
  ['c negativo', { c: '-1' }],
  ['c não inteiro', { c: '1.5' }],
  ['c não numérico', { c: 'abc' }],
  ['faixa desconhecida', { f: 'x' }],
  ['a maior que t', { a: '13' }],
  ['a negativo', { a: '-1' }],
  ['a não inteiro', { a: '4.5' }],
  ['g de tamanho errado', { g: 'aeaeeqeaeea' }],
  ['g com letra inválida', { g: 'aeaeexeaeeae' }],
])('rejeita %s', (_, troca) => {
  expect(parametrosSchema.safeParse({ ...valido, ...troca }).success).toBe(false)
})
it('urlDoCartao monta a query na ordem a, t, c, f, g', () => {
  const casas: Casa[] = ['acerto', 'erro', 'quase', 'acerto', 'erro', 'erro']
  expect(urlDoCartao({ acertos: 2, total: 6, caiu: 1, faixa: 'abre-o-olho', casas })).toBe('/cartao?a=2&t=6&c=1&f=abre-o-olho&g=aeqaee')
})
it.each([['Imune', 'imune'], ['Quase imune', 'quase-imune'], ['Abre o olho', 'abre-o-olho'], ['Caiu feio', 'caiu-feio']] as const)(
  'slugDaFaixa(%s) -> %s', (titulo, slug) => expect(slugDaFaixa(titulo)).toBe(slug))
it('slugDaFaixa lança para título desconhecido', () => expect(() => slugDaFaixa('Outro')).toThrow())
it('letrasParaCasas(casasParaLetras(x)) é identidade', () => {
  const casas: Casa[] = ['acerto', 'erro', 'quase', 'quase', 'acerto', 'erro']
  expect(casasParaLetras(casas)).toBe('aeqqae')
  expect(letrasParaCasas(casasParaLetras(casas))).toEqual(casas)
})

const resultado = (faixa: 'abre-o-olho' | 'quase-imune') => {
  const casas: Casa[] = ['acerto', 'erro', 'quase', 'acerto', 'erro', 'erro', 'acerto', 'acerto', 'erro', 'quase', 'acerto', 'erro']
  return { acertos: 5, total: 12, caiu: 2, faixa, casas }
}
it.each(['abre-o-olho', 'quase-imune'] as const)('código do resultado vai e volta com a faixa %s', faixa => {
  const codigo = codigoDoResultado(resultado(faixa))
  expect(codigo).toBe(`5-12-2-${faixa}-aeqaeeaaeqae`)
  expect(parametrosDoCodigo(codigo)).toEqual({ a: 5, t: 12, c: 2, f: faixa, g: 'aeqaeeaaeqae' })
})
it('parametrosDoCodigo lê um código válido', () => {
  expect(parametrosDoCodigo('4-12-3-caiu-feio-aeaqeeaeeqea')).toEqual({ a: 4, t: 12, c: 3, f: 'caiu-feio', g: 'aeaqeeaeeqea' })
})
it.each([
  ['letra inválida em g', '4-12-3-caiu-feio-aeaxeeaeeqea'],
  ['faixa desconhecida', '4-12-3-x-aeaqeeaeeqea'],
  ['código incompleto', '4-12'],
])('parametrosDoCodigo devolve null para %s', (_, codigo) => {
  expect(parametrosDoCodigo(codigo)).toBeNull()
})
it('urlDoResultado aponta para /r/<código>', () => {
  const url = urlDoResultado(resultado('abre-o-olho'))
  expect(url.startsWith('/r/')).toBe(true)
  expect(url).toBe('/r/5-12-2-abre-o-olho-aeqaeeaaeqae')
})
