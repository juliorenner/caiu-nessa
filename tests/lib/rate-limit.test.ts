import { expect, it } from 'vitest'
import { jogadas } from '@/db/schema'
import { excedeuLimite, extrairIp, hashIp, limparIpHashesExpirados } from '@/lib/rate-limit'
import { criarDbTeste } from '../helpers/db'

it('extrairIp usa o primeiro x-forwarded-for, depois x-real-ip, depois "desconhecido"', () => {
  expect(extrairIp(new Headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' }))).toBe('1.1.1.1')
  expect(extrairIp(new Headers({ 'x-real-ip': '3.3.3.3' }))).toBe('3.3.3.3')
  expect(extrairIp(new Headers())).toBe('desconhecido')
})
it('hashIp é determinístico, depende do salt e não contém o IP', () => {
  const h = hashIp('1.1.1.1', 's1')
  expect(h).toMatch(/^[0-9a-f]{64}$/); expect(h).toBe(hashIp('1.1.1.1', 's1')); expect(h).not.toBe(hashIp('1.1.1.1', 's2'))
})
it('excedeuLimite só a partir da 5ª jogada no último minuto', async () => {
  const db = await criarDbTeste(); const agora = new Date('2026-10-21T12:00:00Z')
  const linha = (minutosAtras: number) => ({ respostas: {}, acertos: 0, total: 12, acertosEsquerda: 0, acertosDireita: 0, ipHash: 'h', createdAt: new Date(agora.getTime() - minutosAtras * 60_000) })
  await db.insert(jogadas).values([linha(0.1), linha(0.2), linha(0.3), linha(0.4), linha(5)])
  expect(await excedeuLimite(db, 'h', agora)).toBe(false)
  await db.insert(jogadas).values(linha(0.5))
  expect(await excedeuLimite(db, 'h', agora)).toBe(true)
  expect(await excedeuLimite(db, 'outro', agora)).toBe(false)
})
it('limparIpHashesExpirados anula ip_hash com mais de 1h e mantém o resto', async () => {
  const db = await criarDbTeste(); const agora = new Date('2026-10-21T12:00:00Z')
  await db.insert(jogadas).values([
    { respostas: {}, acertos: 0, total: 12, acertosEsquerda: 0, acertosDireita: 0, ipHash: 'velho', createdAt: new Date(agora.getTime() - 61 * 60_000) },
    { respostas: {}, acertos: 0, total: 12, acertosEsquerda: 0, acertosDireita: 0, ipHash: 'novo', createdAt: new Date(agora.getTime() - 59 * 60_000) }])
  await limparIpHashesExpirados(db, agora)
  const hashes = (await db.select({ ipHash: jogadas.ipHash }).from(jogadas)).map(l => l.ipHash).sort()
  expect(hashes).toEqual(['novo', null])
})
