import { expect, test } from '@playwright/test'
import afirmacoes from '../../src/data/afirmacoes.json' with { type: 'json' }
import { CHAVE_INTERNO } from '../../src/lib/interno'
import { TOTAL_AFIRMACOES } from '../../src/lib/rodadas'

// Em produção: só lê. Jogar uma rodada inteira grava uma jogada no placar.
const somenteLeitura = process.env.E2E_SOMENTE_LEITURA === '1'

// Em produção, o navegador do teste é jogador interno: responder a primeira carta não conta como partida nas métricas.
test.beforeEach(async ({ page }) => {
  if (somenteLeitura) await page.addInitScript(chave => localStorage.setItem(chave, '1'), CHAVE_INTERNO)
})

test('joga uma rodada inteira', async ({ page }) => {
  test.skip(somenteLeitura, 'grava uma jogada')

  await page.goto('/')
  await page.getByRole('link', { name: 'Começar' }).click()
  await expect(page.locator('[data-casa]')).toHaveCount(TOTAL_AFIRMACOES)

  for (let i = 0; i < TOTAL_AFIRMACOES; i++) {
    await page.getByRole('button', { name: /verdade/i }).click()
    const avancar = page.getByRole('button', { name: /^(Próxima|Ver meu resultado)$/ })
    await expect(avancar).toBeVisible()
    await avancar.click()
  }

  await expect(page.locator('[data-placar]')).toHaveText(new RegExp(`^\\d+/${TOTAL_AFIRMACOES}$`))
  await expect(page.getByRole('button', { name: 'Mais opções de compartilhar' })).toBeVisible()
})

test('abre o quiz e mostra o veredito da primeira carta', async ({ page }) => {
  await page.goto('/quiz')
  await expect(page.locator('[data-casa]')).toHaveCount(TOTAL_AFIRMACOES)
  await page.getByRole('button', { name: /verdade/i }).click()
  await expect(page.getByRole('button', { name: 'Próxima' })).toBeVisible()
})

// /r não tem [data-placar] (só ResultadoFinal tem); o placar é o texto exato "a/t".
test('páginas de resultado antigas e novas', async ({ page }) => {
  let resposta = await page.goto('/r/5-8-2-abre-o-olho-aaeaqaae')
  expect(resposta?.status()).toBe(200)
  await expect(page.getByText('5/8', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Começar' })).toBeVisible()

  resposta = await page.goto('/r/4-12-3-caiu-feio-aeaqeeaeeqea')
  expect(resposta?.status()).toBe(200)
  await expect(page.getByText('4/12', { exact: true })).toBeVisible()

  resposta = await page.goto('/r/4-7-3-caiu-feio-aeaqeea')
  expect(resposta?.status()).toBe(404)
})

test('imagens', async ({ request }) => {
  for (const url of ['/cartao?a=5&t=8&c=2&f=abre-o-olho&g=aaeaqaae', '/convite', '/percentil?p=73', '/jogue/opengraph-image', '/jogue/73/opengraph-image', '/opengraph-image']) {
    const resposta = await request.get(url)
    expect(resposta.status(), url).toBe(200)
    expect(resposta.headers()['content-type'], url).toContain('image/png')
  }
})

test('API recusa corpo inválido', async ({ request }) => {
  expect((await request.post('/api/resultado', { data: {} })).status()).toBe(400)
  expect((await request.post('/api/evento', { data: { tipo: 'x' } })).status()).toBe(400)
})

test('/afirmacoes lista cada afirmação do pool com o link da sua checagem', async ({ page }) => {
  await page.goto('/afirmacoes')
  await expect(page.locator('article')).toHaveCount(afirmacoes.length)
  const links = await page.getByRole('link', { name: /Ver a checagem/ }).evaluateAll((as) => as.map((a) => a.getAttribute('href')))
  expect(links.sort()).toEqual(afirmacoes.map((a) => a.fonte_url).sort())
})

// Telas largas (lg): o "Começar" já tem o foco, o veredito abre ao lado do cartão e o resultado
// mostra a lista "Suas respostas" aberta.
test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('na home, o "Começar" tem o foco', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Começar' })).toBeFocused()
  })

  test('no quiz, o veredito aparece ao lado do cartão, sem fundo escurecido', async ({ page }) => {
    await page.goto('/quiz')
    await expect(page.locator('[data-casa]')).toHaveCount(TOTAL_AFIRMACOES)
    await page.getByRole('button', { name: /verdade/i }).click()
    const texto = page.getByRole('group', { name: 'Afirmação' }).locator('p')
    const painel = page.getByRole('dialog')
    await expect(texto).toBeVisible()
    await expect(painel).toBeVisible()
    await expect(page.locator('[data-backdrop]')).toBeHidden()
    // O painel fica à direita do texto, sem cobri-lo (1 px de folga para arredondamento).
    const caixaTexto = (await texto.boundingBox())!
    const caixaPainel = (await painel.boundingBox())!
    expect(caixaTexto.x + caixaTexto.width).toBeLessThanOrEqual(caixaPainel.x + 1)
  })

  test('no resultado, "Suas respostas" lista cada afirmação da rodada', async ({ page }) => {
    test.skip(somenteLeitura, 'grava uma jogada')

    await page.goto('/quiz')
    await expect(page.locator('[data-casa]')).toHaveCount(TOTAL_AFIRMACOES)
    for (let i = 0; i < TOTAL_AFIRMACOES; i++) {
      await page.getByRole('button', { name: /verdade/i }).click()
      await page.getByRole('button', { name: /^(Próxima|Ver meu resultado)$/ }).click()
    }

    await expect(page.locator('summary', { hasText: 'Suas respostas' })).toBeVisible()
    await expect(page.locator('details')).toHaveAttribute('open', '')
    await expect(page.locator('details [data-resposta]')).toHaveCount(TOTAL_AFIRMACOES)
    await expect(page.locator('details [data-resposta]').first()).toBeVisible()
  })
})
