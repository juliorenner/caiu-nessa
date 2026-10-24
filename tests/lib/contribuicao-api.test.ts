import { describe, expect, it, vi } from 'vitest'
import { eventos } from '@/db/schema'
import { LIMITE_CONTRIBUICOES_POR_HORA, processarContribuicao, TIPO_EVENTO_CONTRIBUICAO } from '@/lib/contribuicao-api'
import { criadorDeIssues } from '@/lib/github-issues'
import { hashIp } from '@/lib/rate-limit'
import { criarDbTeste } from '../helpers/db'

const cab = new Headers({ 'x-forwarded-for': '9.9.9.9' })
const sugestao = { tipo: 'sugestao', url: 'https://www.aosfatos.org/noticias/x/' }
const issue = { numero: 42, url: 'https://github.com/juliorenner/caiu-nessa/issues/42' }

async function deps(criarIssue = vi.fn().mockResolvedValue(issue)) {
  return { db: await criarDbTeste(), salt: 's', criarIssue }
}

describe('processarContribuicao', () => {
  it('201 cria a issue e grava só o tipo e o número no evento, com ip_hash', async () => {
    const d = await deps()
    expect(await processarContribuicao(sugestao, cab, d)).toEqual({ status: 201, issue })
    expect(d.criarIssue).toHaveBeenCalledWith(expect.objectContaining({ labels: ['sugestão'] }))
    const [linha] = await d.db.select().from(eventos)
    expect(linha.tipo).toBe(TIPO_EVENTO_CONTRIBUICAO)
    expect(linha.dados).toEqual({ tipo: 'sugestao', issue: 42 })
    expect(linha.ipHash).toBe(hashIp('9.9.9.9', 's'))
  })

  it('400 sem chamar o GitHub nem gravar', async () => {
    const d = await deps()
    for (const corpo of [null, {}, { ...sugestao, url: 'https://exemplo.com' }, { ...sugestao, site: 'spam' }])
      expect(await processarContribuicao(corpo, cab, d)).toEqual({ status: 400 })
    expect(d.criarIssue).not.toHaveBeenCalled()
    expect(await d.db.select().from(eventos)).toHaveLength(0)
  })

  it('503 sem token configurado', async () => {
    const d = { ...(await deps()), criarIssue: null }
    expect(await processarContribuicao(sugestao, cab, d)).toEqual({ status: 503 })
  })

  it('502 quando o GitHub falha; nada é gravado', async () => {
    const d = await deps(vi.fn().mockRejectedValue(new Error('GitHub respondeu 500')))
    expect(await processarContribuicao(sugestao, cab, d)).toEqual({ status: 502 })
    expect(await d.db.select().from(eventos)).toHaveLength(0)
  })

  it(`429 depois de ${LIMITE_CONTRIBUICOES_POR_HORA} envios do mesmo IP em uma hora; outro IP segue`, async () => {
    const d = await deps()
    for (let i = 0; i < LIMITE_CONTRIBUICOES_POR_HORA; i++) expect((await processarContribuicao(sugestao, cab, d)).status).toBe(201)
    expect(await processarContribuicao(sugestao, cab, d)).toEqual({ status: 429 })
    expect(d.criarIssue).toHaveBeenCalledTimes(LIMITE_CONTRIBUICOES_POR_HORA)
    expect((await processarContribuicao(sugestao, new Headers({ 'x-forwarded-for': '8.8.8.8' }), d)).status).toBe(201)
  })
})

describe('criadorDeIssues', () => {
  it('POST na API do GitHub com o token e devolve número e endereço', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(JSON.stringify({ number: 7, html_url: 'https://x/7' }), { status: 201 }))
    const criar = criadorDeIssues('tok', fetchFn)
    expect(await criar({ title: 't', body: 'b', labels: ['bug'] })).toEqual({ numero: 7, url: 'https://x/7' })
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/juliorenner/caiu-nessa/issues')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(JSON.parse(init.body)).toEqual({ title: 't', body: 'b', labels: ['bug'] })
  })

  it('resposta de erro vira exceção', async () => {
    const criar = criadorDeIssues('tok', vi.fn().mockResolvedValue(new Response('{}', { status: 403 })))
    await expect(criar({ title: 't', body: 'b', labels: [] })).rejects.toThrow('403')
  })
})
