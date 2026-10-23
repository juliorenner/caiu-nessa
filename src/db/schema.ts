import { index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import type { Respostas } from '@/lib/afirmacoes'

export const jogadas = pgTable(
  'jogadas',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    respostas: jsonb('respostas').$type<Respostas>().notNull(),
    acertos: integer('acertos').notNull(),
    total: integer('total').notNull(),
    acertosEsquerda: integer('acertos_esquerda').notNull(),
    acertosDireita: integer('acertos_direita').notNull(),
    ipHash: text('ip_hash'),
  },
  t => [
    index('jogadas_ip_hash_created_at_idx').on(t.ipHash, t.createdAt),
    index('jogadas_created_at_idx').on(t.createdAt),
  ],
)

// Eventos anônimos genéricos: um tipo novo é uma entrada em src/lib/eventos.ts, sem migração.
export const eventos = pgTable(
  'eventos',
  {
    id: serial('id').primaryKey(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    tipo: text('tipo').notNull(),
    dados: jsonb('dados'),
    ipHash: text('ip_hash'),
  },
  t => [
    index('eventos_tipo_created_at_idx').on(t.tipo, t.createdAt),
    index('eventos_ip_hash_created_at_idx').on(t.ipHash, t.createdAt),
  ],
)
