// @vitest-environment node
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { afterEach, beforeEach, expect, it } from 'vitest'
import * as schema from '@/db/schema'

const executar = promisify(execFile)
let dirTemp: string

beforeEach(() => {
  dirTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'caiu-nessa-metricas-'))
})

afterEach(() => {
  fs.rmSync(dirTemp, { recursive: true, force: true })
})

it('imprime jogadas e compartilhamentos do banco em DATABASE_URL', async () => {
  const caminho = path.join(dirTemp, 'dev.pglite')
  const cliente = new PGlite(caminho)
  const db = drizzle(cliente, { schema })
  await migrate(db, { migrationsFolder: 'drizzle' })
  const jogada = { respostas: {}, acertos: 3, acertosEsquerda: 1, acertosDireita: 2 }
  await db.insert(schema.jogadas).values([
    { ...jogada, total: 8 },
    { ...jogada, total: 6 },
  ])
  await db.insert(schema.eventos).values([
    { tipo: 'compartilhar', dados: { modo: 'link', resultado: 'copiado' } },
    { tipo: 'compartilhar', dados: { modo: 'imagem', resultado: 'cancelado' } },
    { tipo: 'compartilhar', dados: { modo: 'baixar', resultado: 'clique' } },
  ])
  await cliente.close()

  const { stdout } = await executar('node', ['scripts/metricas.mjs'], {
    env: { ...process.env, DATABASE_URL: `file:${caminho}` },
  })

  expect(stdout.trim().split('\n')).toEqual([
    'jogadas',
    '  total: 2',
    '  primeiras: 1',
    '  extras: 1',
    'compartilhar (modo / resultado)',
    '  baixar / clique: 1',
    '  imagem / cancelado: 1',
    '  link / copiado: 1',
    'compartilhamentos estimados: 2',
  ])
}, 30_000)
