import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { getDb, resetDbParaTestes } from '@/db/client'

vi.mock('drizzle-orm/pglite/migrator', () => ({ migrate: vi.fn().mockRejectedValue(new Error('migração falhou')) }))

const urlOriginal = process.env.DATABASE_URL
let dirTemp: string

beforeEach(async () => {
  await resetDbParaTestes()
  dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'caiu-nessa-db-'))
})

afterEach(async () => {
  await resetDbParaTestes()
  vi.restoreAllMocks()
  if (urlOriginal === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = urlOriginal
  fs.rmSync(dirTemp, { recursive: true, force: true })
})

it('fecha o PGlite quando as migrations falham', async () => {
  const fechar = vi.spyOn(PGlite.prototype, 'close')
  process.env.DATABASE_URL = `file:${dirTemp}/dev.pglite`
  await expect(getDb()).rejects.toThrow('migração falhou')
  expect(fechar).toHaveBeenCalled()
  const clientes = fechar.mock.contexts as PGlite[]
  expect(clientes.every(c => c.closed)).toBe(true)
})
