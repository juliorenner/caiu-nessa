# Regras de veredito, alcance e lote: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Regras de veredito por maioria com rótulos de contexto como enganoso, campo `alcance` com preferência na primeira rodada, os 8 itens de volta ao jogo e tudo da varredura que cabe nas regras.

**Architecture:** O esquema ganha `alcance`; `sortearRodada` ganha sorteio ponderado opcional (função pura); os pesos vivem em `rodadas.ts` (única knob). Os dados mudam em dois passos (8 de volta + alcance de todos; depois o lote), cada um validado pelos scripts e testes existentes.

**Tech Stack:** TypeScript, Zod 4, Vitest, tsx scripts.

**Spec:** `docs/superpowers/specs/2026-10-23-regras-alcance-lote-design.md`

## Global Constraints

- Só as cinco agências como fonte; citação literal conferida na página (`npx tsx scripts/conferir-citacoes.ts`); `npm test`, `npx tsx scripts/verificar-fontes.ts` verdes antes de cada commit de dados.
- Nenhum número de rodada escrito à mão em `src/` (`tests/app/textos-derivados.test.ts`).
- pt-BR; commits com o trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Composição das rodadas não muda; abaixo e acima de `lg` nada muda na interface além do selo de alcance em `/afirmacoes`.

## Review Focus

1. Sorteio ponderado nunca repete item nem muda a contagem por par (Task 1: teste de composição exata em 200 sorteios com pesos).
2. Peso zero ou pool sem itens de alcance alto não quebra: com `{1:1,2:1,3:1}` o resultado é uniforme; com um par só de alcance 1, sorteia normalmente (Task 1).
3. Item sem `alcance` no JSON real é rejeitado com mensagem clara (Task 1: teste do esquema; Task 2 preenche todos).
4. Veredito recalculado dos 8 segue a regra agência a agência e a `explicacao` cita todas (Task 2: tabela no relatório, conferida pelo revisor).
5. Lote: cada nova com citação encontrada na página (`conferir-citacoes` sem AVISO para novas; aviso aceito só para Estadão) (Task 3).

---

### Task 1: Esquema, alcance, sorteio ponderado e textos das regras

**Files:**
- Modify: `src/lib/afirmacoes.ts`, `src/lib/rodadas.ts`, `src/app/quiz/page.tsx`, `src/app/como-escolhemos/page.tsx`, `src/app/afirmacoes/page.tsx`, `README.md`, `.claude/skills/revisao-de-fatos/SKILL.md`, `tests/fixtures/afirmacoes-validas.ts`, `tests/lib/afirmacoes.test.ts`, `tests/lib/rodadas.test.ts`, `tests/app/como-escolhemos.test.tsx`, `tests/app/afirmacoes.test.tsx`, `tests/data/afirmacoes-reais.test.ts`
- Also: `src/data/afirmacoes.json` gets `"alcance": 2` on every item **temporarily** so the real-data tests pass in this task (Task 2 sets the real values).

**Interfaces:**
- Produces: `type Alcance = 1 | 2 | 3`; `ALCANCES = [1, 2, 3] as const`; `Afirmacao.alcance: Alcance` (required; schema error `alcance deve ser 1, 2 ou 3`); `sortearRodada(pool, composicao, excluir, aleatorio?, pesos?: Readonly<Record<Alcance, number>>)`; `sortearPonderado<T>(itens: readonly T[], quantos: number, peso: (t: T) => number, aleatorio: () => number): T[]` exported from `afirmacoes.ts` (weighted sampling without replacement; peso ≤ 0 counts as 0; if all weights are 0, falls back to uniform); `rodadas.ts`: `PESO_POR_ALCANCE: Readonly<Record<Alcance, number>> = { 1: 1, 2: 2, 3: 4 }`, `PESOS_DA_PRIMEIRA = PESO_POR_ALCANCE`, `descricaoDoAlcance(a: Alcance): string` ("Alcance 3: debate ou TV nacional, duas ou mais agências" etc.). `quiz/page.tsx` passes `PESOS_DA_PRIMEIRA`; `rodada-api.ts` (extras) unchanged.

- [ ] **Step 1: Tests.** Schema: item without `alcance` or with 4 → throws `/alcance/`. `sortearPonderado`: with weights {a: 100, b: 1, c: 1} and quantos 1, 'a' in ≥ 95% of 500 draws (seeded LCG); quantos 3 of 3 returns all, no duplicates; all-zero weights → uniform within 5–15% each over 2000 draws (10 items, quantos 1). `sortearRodada` with `pesos` keeps the exact composition in 200 draws and never repeats an id; with uniform pesos behaves like today. `rodadas`: `PESO_POR_ALCANCE` equals {1:1,2:2,3:4}. Real data: every item has `alcance` ∈ {1,2,3}; heuristic: `autor` matching /debate|Jornal Nacional|TV Globo/ ⇒ alcance ≥ 2, /Flow|live|post/i ⇒ alcance 1. Pages: `/como-escolhemos` renders the new rule sentences (literal strings in the brief: "Falta contexto", "maioria", "alcance"); `/afirmacoes` shows a badge `Alcance N` per item.
- [ ] **Step 2:** run, see them fail. **Step 3:** implement (schema, weighted draw, knob, page texts, badge, README "Regras de neutralidade" bullets, skill table + rules). **Step 4:** `npm run lint && npm run typecheck && npm test` green. **Step 5:** commit `feat(rodadas): alcance das afirmações e preferência ponderada na primeira rodada`.

### Task 2: Os 8 de volta e alcance real dos 45

**Files:** `src/data/afirmacoes.json`, `docs/superpowers/notes/2026-10-23-regras-alcance-lote.md` (report).

- [ ] **Step 1:** for each of the 8 items with `observacao`: open the agencies named in `observacao`/`explicacao` (curl + python as in the sweep; Aos Fatos `data-stamp`), list every agency's label, apply the new rule (V vs F = keep out; else majority; V/E tie = enganoso; F/E tie = falso), rewrite `explicacao` naming every agency and label, remove `observacao`, set `fonte_url` to an agency with a literal quote. Record the per-item table in the report.
- [ ] **Step 2:** set `alcance` for all items: 3 for Janja R$ 7 bi, Nóbrega, "mentia 11 vezes", inflação de alimentos, Ana Clara (AF + G1); 1 for Flow, lives, posts, "segundo o Aos Fatos" items; 2 for the rest; any item the sweep shows checked by a second agency on the same occasion → 3 (cite it in `explicacao`).
- [ ] **Step 3:** `npm test`, `npx tsx scripts/verificar-fontes.ts`, `BASE_REF=origin/main npx tsx scripts/conferir-citacoes.ts` (changed items). **Step 4:** commit `data(afirmacoes): 8 itens de volta pela regra da maioria e alcance de todos`.

### Task 3: Lote da varredura (tudo que cabe nas regras)

**Files:** `src/data/afirmacoes.json`, the same report.

- [ ] **Step 1:** from `docs/superpowers/notes/2026-10-23-varredura-de-checagens.md`, take every candidate that fits the rules (owner's decision; no cap). Exclude anything with V vs F disagreement. For each: fetch the agency page, confirm the literal quote, write `texto` (neutral third person, no "você", "eu", "[…]" per `tests/data/afirmacoes-reais.test.ts` rules), `citacao`, `autor`, `veredito` by the new rule, `explicacao` (≥ 40 chars, all agencies named), `fonte_nome`/`fonte_url` (an agency with the literal quote), `data_checagem`, `alcance`, new 8-hex `id`.
- [ ] **Step 2:** `npm test`; `npx tsx scripts/verificar-fontes.ts`; `BASE_REF=origin/main LIMITES=lote npx tsx scripts/validar-revisao.ts` is NOT required (human batch): instead run `node -e` to assert no removed ids and all new ids valid; `BASE_REF=origin/main npx tsx scripts/conferir-citacoes.ts` with zero AVISO on new items (Estadão-only sources are not allowed for new items). **Step 3:** append the batch table to the report. **Step 4:** commit `data(afirmacoes): lote de outubro da varredura (N novas)`.
