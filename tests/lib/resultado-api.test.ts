import { describe, expect, it } from 'vitest'
import { jogadas } from '@/db/schema'
import { hashIp } from '@/lib/rate-limit'
import { processarResultado } from '@/lib/resultado-api'
import { afirmacoesValidas, todasCertas } from '../fixtures/afirmacoes-validas'
import { criarDbTeste } from '../helpers/db'
import { inserirJogadas } from '../helpers/jogadas'

const deps = async () => ({ db: await criarDbTeste(), afirmacoes: afirmacoesValidas, salt: 's' })
const cab = new Headers({ 'x-forwarded-for': '9.9.9.9' })

describe('processarResultado', () => {
  it('400 quando falta um id, sobra um id ou valor está fora do enum; nada é gravado', async () => {
    const d = await deps()
    const { e1: _, ...semE1 } = todasCertas
    for (const corpo of [
      { respostas: semE1 },
      { respostas: { ...todasCertas, x9: 'falso' } },
      { respostas: { ...todasCertas, e1: 'sim' } },
      { respostas: { ...todasCertas, e1: true } },
      {},
      null,
    ])
      expect((await processarResultado(corpo, cab, d)).status).toBe(400)
    expect(await d.db.select().from(jogadas)).toHaveLength(0)
  })

  it('200 grava a linha com ip_hash e devolve resultado, avaliação e estatisticas null antes de 100', async () => {
    const d = await deps()
    const r = await processarResultado({ respostas: { ...todasCertas, e4: 'verdadeiro' } }, cab, d)
    expect(r.status).toBe(200)
    if (r.status !== 200) return
    expect(r.body.resultado.acertos).toBe(11)
    expect(r.body.avaliacao.titulo).toBe('Quase imune')
    expect(r.body.estatisticas).toBeNull()
    expect(r.body.percentilAbaixo).toBeNull()
    const [linha] = await d.db.select().from(jogadas)
    expect(linha.ipHash).toBe(hashIp('9.9.9.9', 's'))
    expect(linha.acertos).toBe(11)
    expect(linha.acertosEsquerda).toBe(5)
  })

  it('429 na 6ª jogada do mesmo IP em um minuto', async () => {
    const d = await deps()
    for (let i = 0; i < 5; i++) expect((await processarResultado({ respostas: todasCertas }, cab, d)).status).toBe(200)
    expect((await processarResultado({ respostas: todasCertas }, cab, d)).status).toBe(429)
    expect(
      (await processarResultado({ respostas: todasCertas }, new Headers({ 'x-forwarded-for': '8.8.8.8' }), d)).status,
    ).toBe(200)
  })

  it('estatisticas e percentil presentes a partir de 100 jogadas (a jogada atual conta)', async () => {
    const d = await deps()
    await inserirJogadas(d.db, 99, () => ({ acertos: 5 }))
    const r = await processarResultado({ respostas: todasCertas }, cab, d)
    expect(r.status).toBe(200)
    if (r.status !== 200) return
    expect(r.body.estatisticas?.totalJogadas).toBe(100)
    expect(r.body.percentilAbaixo).toBe(99)
  })
})
