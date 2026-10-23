# Eventos de compartilhar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gravar no banco cada toque de compartilhar (modo + resultado) numa tabela genérica de eventos, sem painel, sem atrapalhar o jogo.

**Architecture:** Tabela `eventos` (Drizzle + migração); `src/lib/eventos.ts` com a lista de tipos e os schemas Zod de `dados` por tipo; `src/lib/evento-api.ts` (`processarEvento`) com validação e limite por hash de IP; rota `POST /api/evento`; `src/lib/eventos-navegador.ts` (`registrarEvento`) com fetch keepalive injetável; `ResultadoFinal` chama `registrarEvento` após cada ação; `scripts/metricas.mjs` imprime contagens.

**Tech Stack:** Next.js 16, Drizzle (neon-http / PGlite), Zod 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-23-eventos-compartilhar-design.md`

## Global Constraints
- `eventos`: `id serial pk`, `created_at timestamptz not null default now()`, `tipo text not null`, `dados jsonb` (nullable), `ip_hash text` (nullable); índice `(tipo, created_at)`. Migração gerada com `npx drizzle-kit generate` (sem banco), commitada em `drizzle/`.
- `src/lib/eventos.ts`: `TIPOS_DE_EVENTO = ['compartilhar'] as const`; `MODOS_DE_COMPARTILHAR = ['link', 'imagem', 'baixar'] as const`; `RESULTADOS_DE_COMPARTILHAR = ['folha', 'copiado', 'cancelado', 'falhou', 'indisponivel', 'clique'] as const`; `DADOS_POR_TIPO: Record<TipoDeEvento, z.ZodType>` (compartilhar → `{ modo, resultado }` estritos); `eventoSchema` = `z.discriminatedUnion`/`z.object({ tipo, dados })` montado a partir de `DADOS_POR_TIPO` (adicionar um tipo = adicionar uma entrada); `TAMANHO_MAXIMO_DADOS = 500` (JSON serializado).
- `src/lib/evento-api.ts`: `processarEvento(corpo: unknown, headers: Headers, deps: { db: Db; salt: string; agora?: Date }): Promise<{ status: 204 | 400 | 429 }>`; `LIMITE_EVENTOS_POR_HORA = 60`; `JANELA_EVENTOS_MS = 3_600_000`; reutiliza `extrairIp`/`hashIp` de `rate-limit.ts`; conta eventos do hash na janela, 429 se `>= LIMITE`; insere `{ tipo, dados, ipHash }`.
- Rota `src/app/api/evento/route.ts`: `force-dynamic`; JSON inválido → 400; usa `IP_HASH_SALT` como `/api/resultado`; responde `new Response(null, { status })`.
- `src/lib/eventos-navegador.ts`: `registrarEvento(evento: Evento, enviar: typeof fetch = fetch): void` → `enviar('/api/evento', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(evento), keepalive: true }).catch(() => {})`; nunca lança (try/catch em volta, inclusive quando `fetch` não existe).
- `ResultadoFinal.tsx`: após `compartilhar({ modo: 'link' … })` resolver → `registrarEvento({ tipo: 'compartilhar', dados: { modo: 'link', resultado } })`; idem `imagem`; no clique do link "Baixar imagem para os stories" → `{ modo: 'baixar', resultado: 'clique' }`. O envio não altera o fluxo nem os avisos existentes.
- `scripts/metricas.mjs`: lê `DATABASE_URL` (Neon ou `file:` PGlite, mesma regra de `src/db/client.ts`; pode importar nada de `src/`, usar `@neondatabase/serverless` e `@electric-sql/pglite` direto), imprime `jogadas` (total, primeiras = total in TAMANHOS de primeira [8, 12], extras = 6) e `compartilhar` por modo/resultado; `package.json` script `"metricas": "node scripts/metricas.mjs"` (único toque no manifesto; sem dependências novas).
- SOLID: a API e o cliente não conhecem `compartilhar`; só `eventos.ts` conhece os tipos. Sem `if (tipo === …)`.
- Commits sem `JUL-`; trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## Review Focus
1. Toque em "Compartilhar placar" que cai no clipboard (`copiado`) grava `{ link, copiado }`; folha cancelada grava `cancelado`. Teste de componente com `enviar` falso (mock de `fetch` global).
2. 61º evento do mesmo hash na mesma hora → 429 e nada gravado; 60º grava. Teste em `evento-api.test.ts`.
3. `dados` com 501+ caracteres ou `modo` fora da lista → 400. Teste.
4. `fetch` rejeitando ou inexistente → `registrarEvento` não lança e o compartilhar segue. Teste.
5. Migração aplicável num PGlite vazio (o teste de `evento-api` usa o helper de banco de teste existente, que roda as migrações de `drizzle/`).

---

### Task 1: Tabela, lista de tipos, API e cliente

**Files:**
- Modify: `src/db/schema.ts`; Create: `drizzle/0001_*.sql` (+ `meta/`) via `npx drizzle-kit generate --name eventos`
- Create: `src/lib/eventos.ts`, `src/lib/evento-api.ts`, `src/app/api/evento/route.ts`, `src/lib/eventos-navegador.ts`
- Test: `tests/lib/eventos.test.ts`, `tests/lib/evento-api.test.ts`, `tests/app/api-evento.test.ts`, `tests/lib/eventos-navegador.test.ts` (seguir o padrão dos testes de `resultado-api`/`api-rodada` para banco e rota)

**Interfaces:** Produces everything listed in Global Constraints (`Evento` type = `z.infer<typeof eventoSchema>`; `registrarEvento`; `processarEvento`).

- [ ] Step 1: testes (schema aceita/rejeita; API 204/400/429 com limite; rota JSON inválido 400; cliente nunca lança e envia o corpo certo com keepalive).
- [ ] Step 2: ver falhar. — [ ] Step 3: implementar + `npx drizzle-kit generate --name eventos`. — [ ] Step 4: `npm run lint && npm run typecheck && npx vitest run tests/lib tests/app/api-evento.test.ts`.
- [ ] Step 5: commit `feat(eventos): tabela de eventos e registro de compartilhamentos pela API` (inclui spec e plano).

### Task 2: Chamadas no placar e script de leitura

**Files:**
- Modify: `src/components/ResultadoFinal.tsx`, `package.json` (só o script `metricas`)
- Create: `scripts/metricas.mjs`
- Test: `tests/components/ResultadoFinal.test.tsx` (3 casos: link copiado, imagem cancelada, baixar clique), `tests/scripts/metricas.test.ts` (roda o script contra um PGlite temporário com 2 jogadas e 3 eventos e confere a saída)

**Interfaces:** Consumes `registrarEvento`, `Evento` (Task 1).

- [ ] Step 1: testes. — [ ] Step 2: ver falhar. — [ ] Step 3: implementar. — [ ] Step 4: `npm run lint && npm run typecheck && npm test && npm run build` (apagar `AGENTS.md` se o build criar).
- [ ] Step 5: commit `feat(eventos): placar registra cada compartilhar; npm run metricas imprime jogadas e compartilhamentos`.

### Task 3 (controlador): dev server com PGlite — tocar nos botões e ver as linhas; `npm run metricas`; PR; produção depois do deploy: `curl -X POST /api/evento` inválido → 400.
