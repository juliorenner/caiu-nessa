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
