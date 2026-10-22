import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { getDb, resetDbParaTestes } from '@/db/client'
import { jogadas } from '@/db/schema'

const urlOriginal = process.env.DATABASE_URL
let dirTemp: string

beforeEach(async () => {
  await resetDbParaTestes()
  dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'caiu-nessa-db-'))
})

afterEach(async () => {
  await resetDbParaTestes()
  if (urlOriginal === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = urlOriginal
  fs.rmSync(dirTemp, { recursive: true, force: true })
})

it('com DATABASE_URL file: abre um PGlite persistente com as migrations aplicadas', async () => {
  process.env.DATABASE_URL = `file:${dirTemp}/dev.pglite`
  const db = await getDb()
  await db.insert(jogadas).values({
    respostas: { e1: 'verdadeiro' },
    acertos: 1,
    total: 12,
    acertosEsquerda: 1,
    acertosDireita: 0,
    ipHash: 'abc',
  })
  const linhas = await db.select().from(jogadas)
  expect(linhas).toHaveLength(1)
  expect(linhas[0].ipHash).toBe('abc')
  expect(fs.existsSync(path.join(dirTemp, 'dev.pglite'))).toBe(true)

  await resetDbParaTestes()
  const reaberto = await getDb()
  expect(reaberto).not.toBe(db)
  const persistidas = await reaberto.select().from(jogadas)
  expect(persistidas).toHaveLength(1)
  expect(persistidas[0].ipHash).toBe('abc')
})

it('chamadas concorrentes na primeira vez compartilham a mesma instância', async () => {
  process.env.DATABASE_URL = `file:${dirTemp}/dev.pglite`
  const [a, b] = await Promise.all([getDb(), getDb()])
  expect(a).toBe(b)
})

it('sem DATABASE_URL lança erro', async () => {
  delete process.env.DATABASE_URL
  await expect(getDb()).rejects.toThrow('DATABASE_URL não definida')
})
