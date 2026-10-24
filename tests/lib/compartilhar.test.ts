import { expect, it } from 'vitest'
import { NOME_ARQUIVO, textoDeChamado, textoDeCompartilhar, textoDeConvite, urlDoWhatsApp } from '@/lib/compartilhar'

const URL_RESULTADO = 'https://caiunessa.com.br/r/4-12-3-caiu-feio-aeaqeeaeeqea'

it('sem url: uma linha, termina em "E você?"', () => {
  expect(textoDeCompartilhar({ acertos: 4, total: 12, caiu: 3 })).toBe('Fiz 4/12 no Caiu Nessa? e caí em 3. E você?')
})

it('com url: segunda linha com a URL absoluta do resultado', () => {
  expect(textoDeCompartilhar({ acertos: 4, total: 12, caiu: 3, url: URL_RESULTADO })).toBe(
    `Fiz 4/12 no Caiu Nessa? e caí em 3. E você?\n${URL_RESULTADO}`,
  )
})

it('zero caiu', () => {
  expect(textoDeCompartilhar({ acertos: 12, total: 12, caiu: 0 })).toBe('Fiz 12/12 no Caiu Nessa? e não caí em nenhuma. E você?')
})

it('rodada de 6', () => {
  expect(textoDeCompartilhar({ acertos: 3, total: 6, caiu: 1 })).toBe('Fiz 3/6 no Caiu Nessa? e caí em 1. E você?')
})

it('nome do arquivo da imagem', () => expect(NOME_ARQUIVO).toBe('caiu-nessa-placar.png'))

it('urlDoWhatsApp: wa.me com o texto codificado (quebra de linha e URL inclusive)', () => {
  const texto = `Fiz 4/12 no Caiu Nessa? e caí em 3. E você?\n${URL_RESULTADO}`
  expect(urlDoWhatsApp(texto)).toBe(`https://wa.me/?text=${encodeURIComponent(texto)}`)
  expect(urlDoWhatsApp(texto)).not.toContain('\n')
})

it('convite: sem números; com url, na segunda linha', () => {
  expect(textoDeConvite()).toBe('Já joguei o Caiu Nessa? Agora é sua vez: será que você cai?')
  expect(textoDeConvite('https://caiunessa.com.br')).toBe('Já joguei o Caiu Nessa? Agora é sua vez: será que você cai?\nhttps://caiunessa.com.br')
})

it('chamado da home: sem "já joguei" (quem chama pode não ter jogado), url na segunda linha', () => {
  expect(textoDeChamado()).not.toMatch(/joguei/i)
  expect(textoDeChamado('https://caiunessa.com.br/jogue')).toBe(`${textoDeChamado()}\nhttps://caiunessa.com.br/jogue`)
})
