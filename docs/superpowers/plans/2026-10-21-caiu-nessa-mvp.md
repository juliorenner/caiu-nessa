# Caiu Nessa? MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first version of caiunessa.com.br: a 12-statement VERDADE/MENTIRA quiz that scores the player, shows fact-check sources after each answer, and compares the player with everyone else once 100 games exist.

**Architecture:** Next.js App Router with one client-side quiz component; statements live in a versioned JSON file validated at load time; one `POST /api/resultado` route writes a `jogadas` row and returns aggregates computed with SQL over that table. All domain logic (scoring, copy, aggregation, rate limit) is pure or takes a Drizzle `Db` handle so it is tested against an in-memory PGlite database with the real migrations.

**Tech Stack:** Next.js (App Router, TypeScript, Tailwind), Drizzle ORM, Neon serverless Postgres (`@neondatabase/serverless`, HTTP driver), PGlite for tests, Zod, Vitest + Testing Library, deploy on Vercel.

**Spec:** `docs/superpowers/specs/2026-10-21-caiu-nessa-spec.md` (including the 2026-10-21 amendment: three-level verdict)

**Amended 2026-10-21, after Tasks 1–2 shipped:** `veredito` is the enum `verdadeiro | falso | enganoso`, never a boolean; proportions are 2/2/2 per side; the player has three buttons. Task 2b migrates the loader and the content; Tasks 3–8 below are already written for the enum.

**Tracking:** Linear project "Caiu Nessa?" (P-JUL-7), one issue per task: JUL-87 to JUL-95, plus JUL-99 for Task 2b. Backlog after MVP: JUL-96 (Turnstile), JUL-97 (optional login).

**Transparency rule (from the author):** every spec and plan that gets executed is committed to this repo under `docs/superpowers/`, so the process that produced the app is public. Task 1's first commit includes this plan and its spec; later plans follow the same rule.

## Global Constraints

- Language: all user-facing copy in pt-BR, `<html lang="pt-BR">`. Code identifiers in Portuguese (domain terms), camelCase in TS; JSON and DB columns snake_case exactly as the spec's data model.
- `Veredito` is the string enum `'verdadeiro' | 'falso' | 'enganoso'` everywhere (JSON, TS, DB jsonb, API). Never a boolean.
- Statements: exactly 12 live; 6 `esquerda` + 6 `direita`; per side exactly 2 `verdadeiro`, 2 `falso`, 2 `enganoso`. Enforced by a test, never by convention. Extras live in `src/data/afirmacoes-reserva.json` (same shape, no proportion rule).
- Agency labels that map to `enganoso`: Enganoso, Exagerado, Distorcido, Fora de contexto, Impreciso, "Não é bem assim". Excluded from the game entirely: Insustentável, Contraditório, "Ainda é cedo pra dizer". If two agencies disagree at the three-bucket level (one says falso, another enganoso), the statement is excluded from the live set.
- Player answer = same enum. Buttons: `VERDADE` → verdadeiro, `MENTIRA` → falso, `ISSO ME CHEIRA MAL 🤔` → enganoso. An answer is correct only when it equals the verdict; `falso`↔`enganoso` confusion is wrong but acknowledged as "quase" in the feedback copy.
- "Acreditou" (for bias) = answered `verdadeiro` on a `falso` or `enganoso` statement.
- Every statement's `fonte_url` is on one of: `aosfatos.org`, `lupa.uol.com.br`, `projetocomprova.com.br`, `g1.globo.com` (path starting `/fato-ou-fake`), `estadao.com.br` (path containing `estadao-verifica`). No other source.
- Copy never supports or attacks a candidate. Verdicts and explanations paraphrase the fact-check only.
- No personal data: the only per-player columns are `respostas`, `acertos`, `total`, `acertos_esquerda`, `acertos_direita`, `created_at`, `ip_hash`. `ip_hash` is SHA-256 of salt + IP and is nulled after 1 hour.
- Rate limit: max 5 games per `ip_hash` per rolling 60 s (spec says "N"; 5 is the chosen value, change in one constant).
- Aggregate comparison only when `total_jogadas >= 100`; below that the UI says "Você é um dos primeiros a jogar." and shows no percentages.
- No login, no names, no admin UI, no Turnstile in this plan.

## Review Focus

Input classes the spec implies that are most likely to bite a real player; each has a test pinned to the owning task.

1. Request with an unknown statement id, a missing id, or an answer outside the `Veredito` enum must return 400, never write a row (Task 7).
2. Request without `x-forwarded-for` (local dev, odd proxies) must still work: the IP falls back to `x-real-ip`, then `"desconhecido"` (Task 5).
3. The 100-game gate is inclusive: at exactly 100 games stats appear; at 99 they do not (Task 6).
4. Error rate for a statement id that no row has answered yet (new id added to the JSON) is 0, and ids present in old rows but removed from the JSON are ignored (Task 6).
5. Percentile when everyone has the same score: "mais que 0%" rather than a crash or NaN (Task 6).

---

### Task 1 (JUL-87): Scaffold, tooling, and statement loader

> Executed before the amendment with `veredito: boolean` and 3/3 proportions. Task 2b migrates `src/lib/afirmacoes.ts`, the fixture and the tests to the enum below; the interfaces listed here are the post-migration ones that later tasks consume.

**Files:**
- Create: Next.js app via `create-next-app` (TypeScript, App Router, Tailwind, `src/` dir, no ESLint prompt changes)
- Create: `vitest.config.ts`, `src/lib/afirmacoes.ts`, `src/data/afirmacoes.json` (empty array for now), `.env.example`
- Test: `tests/lib/afirmacoes.test.ts`, `tests/fixtures/afirmacoes-validas.ts`

**Interfaces:**
- Produces:
  ```ts
  // src/lib/afirmacoes.ts
  export type Lado = 'esquerda' | 'direita'
  export const VEREDITOS = ['verdadeiro', 'falso', 'enganoso'] as const
  export type Veredito = (typeof VEREDITOS)[number]
  export interface Afirmacao {
    id: string; texto: string; lado: Lado; autor: string; veredito: Veredito;
    explicacao: string; fonte_nome: string; fonte_url: string; data_checagem: string // YYYY-MM-DD
  }
  export type Respostas = Record<string, Veredito>
  export const TOTAL_AFIRMACOES = 12
  export const POR_LADO = 6
  export const POR_VEREDITO_POR_LADO = 2   // per side: 2 verdadeiro, 2 falso, 2 enganoso
  export const afirmacaoSchema: z.ZodType<Afirmacao>   // per-item schema, used by the reserve test
  export function fonteEhPermitida(url: string): boolean
  export function validarAfirmacoes(dados: unknown): Afirmacao[]   // throws Error with a message naming the rule broken
  export function carregarAfirmacoes(): Afirmacao[]               // validates src/data/afirmacoes.json once, memoized
  export function embaralhar<T>(itens: readonly T[], aleatorio?: () => number): T[]  // Fisher-Yates, pure
  ```

- [ ] **Step 1: Scaffold the app and tooling**

```bash
cd /Users/juliorenner/Documents/git/caiu-nessa
npx create-next-app@latest . --typescript --app --tailwind --src-dir --use-npm --no-eslint --import-alias "@/*"
npm i zod drizzle-orm @neondatabase/serverless
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom drizzle-kit @electric-sql/pglite
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`. `vitest.config.ts`: react plugin, `environment: 'jsdom'`, `globals: true`, alias `@` to `src`, `setupFiles: ['tests/setup.ts']` importing `@testing-library/jest-dom/vitest`. Set `lang="pt-BR"` in `src/app/layout.tsx`. `.env.example` contains `DATABASE_URL=` and `IP_HASH_SALT=`.

- [ ] **Step 2: Write the fixture and the failing loader tests**

`tests/fixtures/afirmacoes-validas.ts` exports `afirmacoesValidas: Afirmacao[]`, 12 synthetic items with ids `e1..e6` (lado esquerda; `e1,e2` verdadeiro, `e3,e4` falso, `e5,e6` enganoso) and `d1..d6` (same pattern), plus `todasCertas: Respostas` (every id → its veredito), `fonte_url` like `https://aosfatos.org/noticias/teste-e1`, `data_checagem: '2026-10-01'`. Fixture text is obviously synthetic ("Afirmação de teste e1"); it never ships.

```ts
// tests/lib/afirmacoes.test.ts
describe('validarAfirmacoes', () => {
  it('aceita 12 afirmações na proporção 6/6 e 2/2/2', () => {
    expect(validarAfirmacoes(afirmacoesValidas)).toHaveLength(12)
  })
  it('rejeita total diferente de 12', () => {
    expect(() => validarAfirmacoes(afirmacoesValidas.slice(0, 11))).toThrow(/12/)
  })
  it('rejeita 3 falsas de um lado', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e1' ? { ...a, veredito: 'falso' as const } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/esquerda/)
  })
  it('rejeita id duplicado', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e2' ? { ...a, id: 'e1' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/duplicad/)
  })
  it('rejeita veredito fora do enum', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e1' ? { ...a, veredito: 'parcialmente' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/veredito/)
  })
  it('rejeita fonte fora da lista de agências', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, fonte_url: 'https://exemplo.com/x' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/fonte/)
  })
  it('rejeita data_checagem fora de YYYY-MM-DD', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, data_checagem: '01/10/2026' } : a)
    expect(() => validarAfirmacoes(alterada)).toThrow(/data_checagem/)
  })
})
describe('fonteEhPermitida', () => {
  it.each([
    ['https://www.aosfatos.org/noticias/x', true],
    ['https://lupa.uol.com.br/jornalismo/2026/x', true],
    ['https://projetocomprova.com.br/publicacoes/x', true],
    ['https://g1.globo.com/fato-ou-fake/noticia/2026/x.ghtml', true],
    ['https://g1.globo.com/politica/noticia/x.ghtml', false],
    ['https://www.estadao.com.br/estadao-verifica/x/', true],
    ['https://www.estadao.com.br/politica/x/', false],
    ['http://aosfatos.org/x', false], // https only
  ])('%s -> %s', (url, esperado) => expect(fonteEhPermitida(url)).toBe(esperado))
})
describe('embaralhar', () => {
  it('mantém os mesmos itens e não muta a entrada', () => {
    const entrada = [1, 2, 3, 4]
    const saida = embaralhar(entrada, () => 0.5)
    expect(saida).toHaveLength(4); expect(saida.sort()).toEqual([1, 2, 3, 4]); expect(entrada).toEqual([1, 2, 3, 4])
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- tests/lib/afirmacoes.test.ts`
Expected: FAIL, module `@/lib/afirmacoes` not found.

- [ ] **Step 4: Implement `src/lib/afirmacoes.ts`**

Zod schema for one item (`id` non-empty, `lado` enum, `veredito` `z.enum(VEREDITOS)`, `fonte_url` `.url()` + `.refine(fonteEhPermitida)`, `data_checagem` regex `^\d{4}-\d{2}-\d{2}$`), then `z.array(...).length(12)`, then manual checks for duplicate ids and the 6/6 and 2/2/2 counts, each throwing with the rule name in the message. `carregarAfirmacoes` imports the JSON with `import dados from '@/data/afirmacoes.json'` and memoizes in a module variable.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- tests/lib/afirmacoes.test.ts` → PASS. Run `npm run typecheck` → no errors.

- [ ] **Step 6: Commit (includes the spec and this plan)**

```bash
git add -A
git commit -m "feat: scaffold Next.js app, test tooling and statement loader

Includes docs/superpowers spec and plan for transparency."
```

---

### Task 2 (JUL-88): The 12 statements (content curation)

> Executed before the amendment (3 true + 3 false per side, boolean). Task 2b reworks the content to 2/2/2 with the enum.

This task is research, not coding. **Never invent a statement, a verdict, or a URL.** Every item must be copied from a real fact-check published by one of the five agencies, and the executor must open each URL and confirm the verdict before writing it. If 12 qualifying items cannot be found, stop and report; do not pad.

**Files:**
- Modify: `src/data/afirmacoes.json`
- Create: `scripts/verificar-fontes.ts`
- Test: `tests/data/afirmacoes-reais.test.ts`

**Interfaces:**
- Consumes: `validarAfirmacoes`, `carregarAfirmacoes` (Task 1).

- [ ] **Step 1: Write the failing test on the real file**

```ts
// tests/data/afirmacoes-reais.test.ts
import dados from '@/data/afirmacoes.json'
it('src/data/afirmacoes.json segue as regras de neutralidade', () => {
  expect(() => validarAfirmacoes(dados)).not.toThrow()
})
it('nenhuma explicação é vazia ou menor que 40 caracteres', () => {
  for (const a of validarAfirmacoes(dados)) expect(a.explicacao.length).toBeGreaterThanOrEqual(40)
})
```
Run: `npm test -- tests/data` → FAIL (empty array has length 0).

- [ ] **Step 2: Research**

Identify the two 2026 second-round presidential candidates and the most-shared claims about or by each side, using the agencies' election sections (Aos Fatos, Lupa, Comprova, G1 Fato ou Fake, Estadão Verifica). Prefer checks dated September–October 2026. Select per side: 3 statements the agency rated true and 3 rated false, mixing statements made by the candidate and by aligned influencers. Record for each: the statement as the agency quoted it (`texto`), who said it (`autor`), the agency's verdict (`veredito`), a 1–3 sentence neutral paraphrase of why (`explicacao`), `fonte_nome`, `fonte_url`, `data_checagem`.

Rule for `lado`: the side of the person who made the statement, not who the statement favours.

- [ ] **Step 3: Write `src/data/afirmacoes.json`**

Ids `e1..e6`, `d1..d6`. Statements that the agency rated "parcialmente falso", "exagerado", "fora de contexto" or similar do not qualify; only clear true/false.

- [ ] **Step 4: Write and run `scripts/verificar-fontes.ts`**

`npx tsx scripts/verificar-fontes.ts`: loads the JSON through `validarAfirmacoes`, does `fetch(fonte_url, { method: 'GET', redirect: 'follow' })` for each and prints `OK`/`FALHOU <status>` per id, exit code 1 on any failure. Add `tsx` as a dev dependency. Expected output: 12 `OK` lines.

- [ ] **Step 5: Run the test and a neutrality read**

Run: `npm test -- tests/data` → PASS. Then read all 12 `texto` + `explicacao` aloud once with the rule "would a supporter of either side read this as an attack?"; rewrite any `explicacao` that editorialises.

- [ ] **Step 6: Commit**

```bash
git add src/data/afirmacoes.json scripts/verificar-fontes.ts tests/data package.json package-lock.json
git commit -m "content: first 12 fact-checked statements (6 per side, 3 true + 3 false)"
```

---

### Task 2b (JUL-99): Three-level verdict — loader migration and content rework

Amendment task. Migrates what Tasks 1–2 built from `veredito: boolean` (3/3 per side) to the `Veredito` enum (2/2/2 per side), and re-curates the live set accordingly. Same no-fabrication rules as Task 2.

**Files:**
- Modify: `src/lib/afirmacoes.ts`, `tests/fixtures/afirmacoes-validas.ts`, `tests/lib/afirmacoes.test.ts`, `src/data/afirmacoes.json`, `src/data/afirmacoes-reserva.json`, `tests/data/afirmacoes-reais.test.ts`, `scripts/verificar-fontes.ts` (only if it references the boolean)

**Interfaces:**
- Produces: the post-migration interfaces listed in Task 1 (`VEREDITOS`, `Veredito`, `Respostas = Record<string, Veredito>`, `POR_VEREDITO_POR_LADO = 2`, `afirmacaoSchema`), and fixture ids `e1,e2,d1,d2` verdadeiro / `e3,e4,d3,d4` falso / `e5,e6,d5,d6` enganoso with `todasCertas`.

- [ ] **Step 1: Update the loader tests** to the Task 1 test list as amended (proportion 2/2/2, `rejeita 3 falsas de um lado`, `rejeita veredito fora do enum`), update the fixture, run `npm test -- tests/lib/afirmacoes.test.ts` → FAIL on the enum/proportion cases.
- [ ] **Step 2: Migrate `src/lib/afirmacoes.ts`**: `VEREDITOS`, `Veredito`, `z.enum(VEREDITOS)` with a message containing `veredito`, counts `=== POR_VEREDITO_POR_LADO` for each of the three values per side, message naming the lado. Run the loader tests → PASS.
- [ ] **Step 3: Re-curate the live set**: per side keep 2 verdadeiro and 2 falso from the current live set (move the other one of each to the reserve with the next free id), and add 2 `enganoso` per side found the Task 2 way (real check, page opened, label in the enganoso mapping, no agency disagreement at the three-bucket level). Convert every item in both JSON files to the string enum. Candidates for the enganoso bucket may come from the reserve if they qualify.
- [ ] **Step 4: Update `tests/data/afirmacoes-reais.test.ts`** (reserve items parse with `afirmacaoSchema`; ids unique across both files) and run `npm test` → all PASS; `npx tsx scripts/verificar-fontes.ts` → every URL OK.
- [ ] **Step 5: Neutrality read** of every live `texto` + `explicacao`; the `explicacao` of an enganoso item must say what is true and what is not, as the agency did.
- [ ] **Step 6: Commit** — `feat: three-level verdict (verdadeiro|falso|enganoso) and 2/2/2 content`

---

### Task 3 (JUL-89): Scoring and evaluation copy (pure logic)

**Files:**
- Create: `src/lib/pontuacao.ts`, `src/lib/avaliacao.ts`
- Test: `tests/lib/pontuacao.test.ts`, `tests/lib/avaliacao.test.ts`

**Interfaces:**
- Consumes: `Afirmacao`, `Respostas`, fixture `afirmacoesValidas` (Task 1).
- Produces:
  ```ts
  // src/lib/pontuacao.ts
  export interface Resultado {
    acertos: number; total: number;                       // total === 12
    acertosEsquerda: number; acertosDireita: number;      // 0..6
    acreditadasEsquerda: number; acreditadasDireita: number // 0..4, answered 'verdadeiro' on a falso or enganoso statement
  }
  export function calcularResultado(afirmacoes: Afirmacao[], respostas: Respostas): Resultado
  export function ehQuase(veredito: Veredito, resposta: Veredito): boolean  // true only for the falso↔enganoso confusion
  // src/lib/avaliacao.ts
  export interface Avaliacao { titulo: string; texto: string; vies: string }
  export function porcentagem(parte: number, todo: number): number   // Math.round(parte/todo*100), 0 when todo === 0
  export function gerarAvaliacao(r: Resultado): Avaliacao
  ```

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/pontuacao.test.ts
import { afirmacoesValidas, todasCertas } from '../fixtures/afirmacoes-validas'
it('12 acertos quando todas as respostas batem com o veredito', () => {
  expect(calcularResultado(afirmacoesValidas, todasCertas)).toEqual({
    acertos: 12, total: 12, acertosEsquerda: 6, acertosDireita: 6, acreditadasEsquerda: 0, acreditadasDireita: 0 })
})
it('conta falsas e enganosas acreditadas por lado', () => {
  const r = calcularResultado(afirmacoesValidas, { ...todasCertas, e4: 'verdadeiro', e5: 'verdadeiro', d6: 'verdadeiro' })
  expect(r.acertos).toBe(9); expect(r.acreditadasEsquerda).toBe(2); expect(r.acreditadasDireita).toBe(1)
})
it('confundir falso com enganoso é erro, não acreditou', () => {
  const r = calcularResultado(afirmacoesValidas, { ...todasCertas, e3: 'enganoso', e5: 'falso' })
  expect(r.acertos).toBe(10); expect(r.acreditadasEsquerda).toBe(0)
})
it('ehQuase só para falso↔enganoso', () => {
  expect(ehQuase('falso', 'enganoso')).toBe(true); expect(ehQuase('enganoso', 'falso')).toBe(true)
  expect(ehQuase('verdadeiro', 'falso')).toBe(false); expect(ehQuase('falso', 'falso')).toBe(false)
})
it('resposta ausente conta como erro', () => {
  const { e1: _omitida, ...semE1 } = todasCertas
  expect(calcularResultado(afirmacoesValidas, semE1).acertos).toBe(11)
})

// tests/lib/avaliacao.test.ts
const base: Resultado = { acertos: 12, total: 12, acertosEsquerda: 6, acertosDireita: 6, acreditadasEsquerda: 0, acreditadasDireita: 0 }
it.each([[12, 'Imune'], [9, 'Quase imune'], [11, 'Quase imune'], [8, 'Abre o olho'], [5, 'Abre o olho'], [4, 'Caiu feio'], [0, 'Caiu feio']])(
  'acertos %i -> título %s', (acertos, titulo) => expect(gerarAvaliacao({ ...base, acertos }).titulo).toBe(titulo))
it('texto do tier "Abre o olho" traz a % de falsas ou enganosas acreditadas', () => {
  const a = gerarAvaliacao({ ...base, acertos: 7, acreditadasEsquerda: 2, acreditadasDireita: 2 })
  expect(a.texto).toBe('Você acreditou em 50% das afirmações falsas ou enganosas.')
})
it('viés compara os dois lados', () => {
  const a = gerarAvaliacao({ ...base, acertos: 7, acreditadasEsquerda: 4, acreditadasDireita: 1 })
  expect(a.vies).toBe('Você acreditou em 100% das falsas ou enganosas da esquerda e 25% das da direita.')
})
it('porcentagem(0, 0) é 0', () => expect(porcentagem(0, 0)).toBe(0))
```

- [ ] **Step 2: Run to verify failure** — `npm test -- tests/lib/pontuacao.test.ts tests/lib/avaliacao.test.ts` → FAIL, modules not found.

- [ ] **Step 3: Implement**

`calcularResultado`: a statement is correct when `respostas[id] === veredito`; missing answer is wrong; `acreditadas*` counts `respostas[id] === 'verdadeiro'` where `veredito !== 'verdadeiro'`. `ehQuase` is a pure two-value check. Tiers by `acertos`: 12 → `Imune`; 9–11 → `Quase imune`; 5–8 → `Abre o olho`; 0–4 → `Caiu feio`. Fixed copy:

| titulo | texto |
|---|---|
| Imune | `Você não caiu em nenhuma. Nem as falsas te pegaram.` |
| Quase imune | `Você caiu em poucas, mas caiu. Vale conferir quais.` |
| Abre o olho | `Você acreditou em {P}% das afirmações falsas ou enganosas.` |
| Caiu feio | `Você acreditou em {P}% das afirmações falsas ou enganosas. Hora de desconfiar mais.` |

`P = porcentagem(acreditadasEsquerda + acreditadasDireita, 8)`. `vies` always: `Você acreditou em {E}% das falsas ou enganosas da esquerda e {D}% das da direita.` with `E = porcentagem(acreditadasEsquerda, 4)`, `D` likewise.

- [ ] **Step 4: Run to verify pass** — same command → PASS.

- [ ] **Step 5: Commit** — `git add src/lib/pontuacao.ts src/lib/avaliacao.ts tests/lib && git commit -m "feat: scoring and evaluation copy"`

---

### Task 4 (JUL-90): Database schema, migration, and test database

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `drizzle.config.ts`, `drizzle/` (generated migration), `tests/helpers/db.ts`
- Test: `tests/db/schema.test.ts`

**Interfaces:**
- Produces:
  ```ts
  // src/db/schema.ts
  export const jogadas = pgTable('jogadas', {...})  // columns below
  // src/db/client.ts
  export type Db = PgDatabase<PgQueryResultHKT, typeof schema>
  export function getDb(): Db   // neon-http drizzle on process.env.DATABASE_URL, memoized; throws if unset
  // tests/helpers/db.ts
  export async function criarDbTeste(): Promise<Db>  // fresh in-memory PGlite + drizzle migrate from ./drizzle
  ```
  Table `jogadas`: `id serial pk`, `created_at timestamptz not null default now()`, `respostas jsonb not null`, `acertos int not null`, `total int not null`, `acertos_esquerda int not null`, `acertos_direita int not null`, `ip_hash text` (nullable). Index `jogadas_ip_hash_created_at_idx (ip_hash, created_at)`. Index `jogadas_created_at_idx (created_at)`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/db/schema.test.ts
it('insere e lê uma jogada com as colunas do modelo', async () => {
  const db = await criarDbTeste()
  await db.insert(jogadas).values({ respostas: { e1: 'verdadeiro' }, acertos: 1, total: 12, acertosEsquerda: 1, acertosDireita: 0, ipHash: 'abc' })
  const linhas = await db.select().from(jogadas)
  expect(linhas).toHaveLength(1); expect(linhas[0].createdAt).toBeInstanceOf(Date); expect(linhas[0].ipHash).toBe('abc')
})
```
Run: `npm test -- tests/db` → FAIL.

- [ ] **Step 2: Implement schema, config, migration, clients**

`drizzle.config.ts`: `dialect: 'postgresql'`, `schema: './src/db/schema.ts'`, `out: './drizzle'`, `dbCredentials.url` from `DATABASE_URL`. Generate with `npx drizzle-kit generate` (commit the SQL). `tests/helpers/db.ts` uses `drizzle-orm/pglite` and `migrate` from `drizzle-orm/pglite/migrator` with `migrationsFolder: 'drizzle'`. `src/db/client.ts` uses `drizzle-orm/neon-http` with `neon(process.env.DATABASE_URL)`.

- [ ] **Step 3: Run to verify pass** — `npm test -- tests/db` → PASS; `npm run typecheck` clean.

- [ ] **Step 4: Commit** — `git add src/db drizzle drizzle.config.ts tests/db tests/helpers && git commit -m "feat: jogadas schema, migration and PGlite test harness"`

---

### Task 5 (JUL-91): Rate limit and IP hashing

**Files:**
- Create: `src/lib/rate-limit.ts`
- Test: `tests/lib/rate-limit.test.ts`

**Interfaces:**
- Consumes: `Db`, `jogadas`, `criarDbTeste` (Task 4).
- Produces:
  ```ts
  export const LIMITE_POR_MINUTO = 5
  export const JANELA_MS = 60_000
  export const TTL_IP_HASH_MS = 3_600_000
  export function extrairIp(headers: Headers): string            // first entry of x-forwarded-for, else x-real-ip, else 'desconhecido'
  export function hashIp(ip: string, salt: string): string       // sha256 hex of `${salt}:${ip}` via node:crypto
  export async function excedeuLimite(db: Db, ipHash: string, agora?: Date): Promise<boolean>  // count rows with ip_hash and created_at > agora - JANELA_MS, >= LIMITE_POR_MINUTO
  export async function limparIpHashesExpirados(db: Db, agora?: Date): Promise<void>          // set ip_hash = null where created_at < agora - TTL_IP_HASH_MS
  ```

- [ ] **Step 1: Write the failing tests**

```ts
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
```
Run: `npm test -- tests/lib/rate-limit.test.ts` → FAIL.

- [ ] **Step 2: Implement `src/lib/rate-limit.ts`** with the signatures above; `agora` defaults to `new Date()`.

- [ ] **Step 3: Run to verify pass** → PASS.

- [ ] **Step 4: Commit** — `git commit -am "feat: ip hashing, rate limit and ip_hash TTL cleanup"` (after `git add src/lib/rate-limit.ts tests/lib/rate-limit.test.ts`).

---

### Task 6 (JUL-92): Aggregate statistics

**Files:**
- Create: `src/lib/estatisticas.ts`
- Test: `tests/lib/estatisticas.test.ts`

**Interfaces:**
- Consumes: `Db`, `jogadas`, `criarDbTeste` (Task 4); `Afirmacao`, fixture (Task 1).
- Produces:
  ```ts
  export const MINIMO_JOGADAS = 100
  export interface Estatisticas {
    totalJogadas: number
    histograma: number[]                    // length 13, index = acertos
    erroPorAfirmacao: Record<string, number> // id -> % of jogadas whose answer !== veredito, 0..100 rounded; every current id present
    mediaEsquerda: number                   // avg acertos_esquerda, 1 decimal
    mediaDireita: number
  }
  export async function obterEstatisticas(db: Db, afirmacoes: Afirmacao[]): Promise<Estatisticas | null> // null when totalJogadas < MINIMO_JOGADAS
  export function percentilAbaixo(histograma: number[], acertos: number): number // % of jogadas with acertos strictly below, rounded; 0 when histogram empty
  ```

- [ ] **Step 1: Write the failing tests**

Helper in `tests/helpers/jogadas.ts` (created here, reused by Task 7): `inserirJogadas(db, n, gerar?: (i: number) => Partial<typeof jogadas.$inferInsert>)`, defaulting to `todasCertas`, acertos 12, 6/6.

```ts
it('retorna null com 99 jogadas e estatísticas com 100 (gate inclusivo)', async () => {
  const db = await criarDbTeste()
  await inserirJogadas(db, 99); expect(await obterEstatisticas(db, afirmacoesValidas)).toBeNull()
  await inserirJogadas(db, 1); expect((await obterEstatisticas(db, afirmacoesValidas))?.totalJogadas).toBe(100)
})
it('histograma, erro por afirmação e média por lado', async () => {
  const db = await criarDbTeste()
  // 60 jogadas perfeitas; 40 jogadas que erram só e4 (respondem VERDADE numa falsa)
  await inserirJogadas(db, 60); await inserirJogadas(db, 40, () => ({ respostas: { ...todasCertas, e4: 'verdadeiro' }, acertos: 11, acertosEsquerda: 5 }))
  const e = (await obterEstatisticas(db, afirmacoesValidas))!
  expect(e.histograma[12]).toBe(60); expect(e.histograma[11]).toBe(40); expect(e.histograma).toHaveLength(13)
  expect(e.erroPorAfirmacao.e4).toBe(40); expect(e.erroPorAfirmacao.e1).toBe(0)
  expect(e.mediaEsquerda).toBe(5.6); expect(e.mediaDireita).toBe(6)
})
it('ignora ids antigos nas respostas e dá 0 para id sem respostas', async () => {
  const db = await criarDbTeste()
  await inserirJogadas(db, 100, () => ({ respostas: { ...todasCertas, removida: 'falso' } }))
  const e = (await obterEstatisticas(db, afirmacoesValidas))!
  expect(e.erroPorAfirmacao).not.toHaveProperty('removida'); expect(Object.keys(e.erroPorAfirmacao)).toHaveLength(12)
})
it('percentilAbaixo', () => {
  const h = Array(13).fill(0); h[12] = 100
  expect(percentilAbaixo(h, 12)).toBe(0)           // todo mundo igual
  h[5] = 100; expect(percentilAbaixo(h, 12)).toBe(50)
  expect(percentilAbaixo(Array(13).fill(0), 7)).toBe(0)
})
```
Run: `npm test -- tests/lib/estatisticas.test.ts` → FAIL.

- [ ] **Step 2: Implement `src/lib/estatisticas.ts`**

Three queries: (1) `select acertos, count(*) group by acertos` → histogram; (2) `select avg(acertos_esquerda), avg(acertos_direita), count(*)`; (3) `select chave, valor, count(*) from jogadas, jsonb_each_text(respostas) as kv(chave, valor) group by chave, valor` → in TS, for each current afirmação, wrong = sum of counts where `valor !== veredito`, `erro = porcentagem(wrong, totalJogadas)`. Return `null` early if count < `MINIMO_JOGADAS`.

- [ ] **Step 3: Run to verify pass** → PASS.

- [ ] **Step 4: Commit** — `git add src/lib/estatisticas.ts tests/lib/estatisticas.test.ts && git commit -m "feat: aggregate statistics with 100-game gate"`

---

### Task 7 (JUL-93): `POST /api/resultado`

**Files:**
- Create: `src/app/api/resultado/route.ts`, `src/lib/resultado-api.ts` (handler logic, testable without Next request plumbing)
- Test: `tests/lib/resultado-api.test.ts`

**Interfaces:**
- Consumes: Tasks 1, 3, 4, 5, 6.
- Produces:
  ```ts
  // src/lib/resultado-api.ts
  export const corpoSchema = z.object({ respostas: z.record(z.string(), z.enum(VEREDITOS)) })
  export interface RespostaResultado { resultado: Resultado; avaliacao: Avaliacao; estatisticas: Estatisticas | null; percentilAbaixo: number | null }
  export interface Deps { db: Db; afirmacoes: Afirmacao[]; salt: string; agora?: Date }
  export async function processarResultado(corpo: unknown, headers: Headers, deps: Deps): Promise<{ status: 200; body: RespostaResultado } | { status: 400 | 429; body: { erro: 'respostas_invalidas' | 'muitas_jogadas' } }>
  ```
  `route.ts`: `export async function POST(req: Request)` → `await req.json()` in try/catch (invalid JSON → 400), calls `processarResultado` with `getDb()`, `carregarAfirmacoes()`, `process.env.IP_HASH_SALT` (throw at module load if missing), returns `Response.json(body, { status })`. `export const dynamic = 'force-dynamic'`.

- [ ] **Step 1: Write the failing tests**

```ts
const deps = async () => ({ db: await criarDbTeste(), afirmacoes: afirmacoesValidas, salt: 's' })
const cab = new Headers({ 'x-forwarded-for': '9.9.9.9' })
it('400 quando falta um id, sobra um id ou valor está fora do enum; nada é gravado', async () => {
  const d = await deps()
  const { e1: _, ...semE1 } = todasCertas
  for (const corpo of [{ respostas: semE1 }, { respostas: { ...todasCertas, x9: 'falso' } }, { respostas: { ...todasCertas, e1: 'sim' } }, { respostas: { ...todasCertas, e1: true } }, {}, null])
    expect((await processarResultado(corpo, cab, d)).status).toBe(400)
  expect(await d.db.select().from(jogadas)).toHaveLength(0)
})
it('200 grava a linha com ip_hash e devolve resultado, avaliação e estatisticas null antes de 100', async () => {
  const d = await deps()
  const r = await processarResultado({ respostas: { ...todasCertas, e4: 'verdadeiro' } }, cab, d)
  expect(r.status).toBe(200)
  if (r.status !== 200) return
  expect(r.body.resultado.acertos).toBe(11); expect(r.body.avaliacao.titulo).toBe('Quase imune')
  expect(r.body.estatisticas).toBeNull(); expect(r.body.percentilAbaixo).toBeNull()
  const [linha] = await d.db.select().from(jogadas)
  expect(linha.ipHash).toBe(hashIp('9.9.9.9', 's')); expect(linha.acertos).toBe(11); expect(linha.acertosEsquerda).toBe(5)
})
it('429 na 6ª jogada do mesmo IP em um minuto', async () => {
  const d = await deps()
  for (let i = 0; i < 5; i++) expect((await processarResultado({ respostas: todasCertas }, cab, d)).status).toBe(200)
  expect((await processarResultado({ respostas: todasCertas }, cab, d)).status).toBe(429)
  expect((await processarResultado({ respostas: todasCertas }, new Headers({ 'x-forwarded-for': '8.8.8.8' }), d)).status).toBe(200)
})
it('estatisticas e percentil presentes a partir de 100 jogadas (a jogada atual conta)', async () => {
  const d = await deps(); await inserirJogadas(d.db, 99, () => ({ acertos: 5 }))  // helper from tests/helpers/jogadas.ts (Task 6)
  const r = await processarResultado({ respostas: todasCertas }, cab, d)
  expect(r.status).toBe(200); if (r.status !== 200) return
  expect(r.body.estatisticas?.totalJogadas).toBe(100); expect(r.body.percentilAbaixo).toBe(99)
})
```
Run: `npm test -- tests/lib/resultado-api.test.ts` → FAIL.

- [ ] **Step 2: Implement**

Validation after Zod: the set of keys of `respostas` must equal the set of afirmação ids (both directions). Order inside `processarResultado`: validate → `extrairIp`/`hashIp` → `limparIpHashesExpirados` → `excedeuLimite` (429) → `calcularResultado` → insert → `obterEstatisticas` → `percentilAbaixo` (null when estatisticas null) → 200.

- [ ] **Step 3: Run to verify pass** → PASS. Smoke the real route: `npm run dev` with a local `DATABASE_URL` (PGlite is tests-only; use a Neon dev branch or local Postgres) and `curl -X POST localhost:3000/api/resultado -H 'content-type: application/json' -d '{}'` → `400`.

- [ ] **Step 4: Commit** — `git add src/app/api src/lib/resultado-api.ts tests && git commit -m "feat: POST /api/resultado"`

---

### Task 8 (JUL-94): UI — landing, quiz, feedback, result, selection criteria page

**Files:**
- Modify: `src/app/page.tsx`, `src/app/layout.tsx`
- Create: `src/app/quiz/page.tsx` (server), `src/components/Quiz.tsx` (client), `src/components/Feedback.tsx`, `src/components/ResultadoFinal.tsx`, `src/app/como-escolhemos/page.tsx`
- Test: `tests/components/Quiz.test.tsx`

**Interfaces:**
- Consumes: `carregarAfirmacoes`, `embaralhar` (Task 1); `obterEstatisticas`, `getDb` (Tasks 4, 6); `RespostaResultado` (Task 7).
- Produces:
  ```tsx
  // src/components/Quiz.tsx
  export interface QuizProps { afirmacoes: Afirmacao[]; erroPorAfirmacao: Record<string, number> | null }
  export default function Quiz(props: QuizProps): JSX.Element
  // src/components/Feedback.tsx
  export function Feedback(p: { afirmacao: Afirmacao; respostaDada: Veredito; erroPct: number | null; onProximo: () => void; ultima: boolean })
  // src/components/ResultadoFinal.tsx
  export function ResultadoFinal(p: { dados: RespostaResultado })
  ```

Quiz state machine: `{ etapa: 'pergunta' | 'feedback', indice }` → after the 12th feedback, `etapa: 'enviando'` (POST `/api/resultado`) → `'resultado' | 'erro'`. Shuffle with `embaralhar` once in `useState` initialiser. `quiz/page.tsx` is `dynamic = 'force-dynamic'`, loads afirmações and `obterEstatisticas(getDb(), afirmacoes)` and passes `erroPorAfirmacao ?? null`.

Fixed copy:
- Landing (`/`): h1 `Caiu Nessa?`, text `12 afirmações sobre a eleição. Você diz se é verdade ou mentira. No fim, descobre em quantas caiu.`, button `Começar` → `/quiz`, link `Como escolhemos as afirmações`.
- Question: `Afirmação {n} de 12`, the `texto`, line `Quem disse: {autor}`, three buttons in this order: `VERDADE`, `MENTIRA`, `ISSO ME CHEIRA MAL 🤔`. The side (`lado`) is never shown during the question.
- Feedback: badge `Verdade`, `Mentira` or `Enganoso` (the agency verdict); line `Você acertou.` when `respostaDada === veredito`; `Quase: você desconfiou, mas a checagem classificou como {Mentira|Enganoso}.` when `ehQuase(veredito, respostaDada)`; otherwise `Você caiu nessa.` when the player answered VERDADE on a non-true statement, or `Era verdade.` when the player doubted a true statement; then the `explicacao`, link `Ver a checagem ({fonte_nome})` opening `fonte_url` in a new tab, and when `erroPct !== null` the line `{erroPct}% das pessoas erraram esta.`. Button `Próxima` (or `Ver meu resultado` on the last).
- Result: `{acertos} de 12`, `avaliacao.titulo`, `avaliacao.texto`, `avaliacao.vies`; when `estatisticas` present: `Você acertou mais que {percentilAbaixo}% das pessoas.`; else `Você é um dos primeiros a jogar. A comparação com os outros aparece a partir de 100 jogadas.`. Button `Jogar de novo` → reload `/quiz`. Link to `/como-escolhemos`.
- Error state: `Não conseguimos salvar seu resultado. Tente de novo.` with retry button; 429 shows `Calma aí: muitas jogadas em pouco tempo. Tente de novo em um minuto.`.
- `/como-escolhemos`: the spec's "Conteúdo" rules rewritten as a reader-facing page, including the three verdicts, which agency labels count as "enganoso" and the unanimity rule (from the spec amendment), plus a link to the GitHub repo (`https://github.com/juliorenner/caiu-nessa`) with the sentence `O código, as afirmações e os planos de desenvolvimento são públicos.`

- [ ] **Step 1: Write the failing component test**

```tsx
// tests/components/Quiz.test.tsx  (mock global fetch)
it('percorre as 12 afirmações, mostra veredito e link da checagem, e envia todas as respostas', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ resultado: {...}, avaliacao: {...}, estatisticas: null, percentilAbaixo: null }) })
  vi.stubGlobal('fetch', fetchMock)
  render(<Quiz afirmacoes={afirmacoesValidas} erroPorAfirmacao={{ e1: 37 }} />)
  const user = userEvent.setup()
  for (let i = 0; i < 12; i++) {
    expect(screen.getByText(`Afirmação ${i + 1} de 12`)).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'VERDADE' }))
    expect(screen.getByRole('link', { name: /Ver a checagem/ })).toHaveAttribute('target', '_blank')
    await user.click(screen.getByRole('button', { name: i === 11 ? 'Ver meu resultado' : 'Próxima' }))
  }
  const corpo = JSON.parse(fetchMock.mock.calls[0][1].body)
  expect(Object.keys(corpo.respostas).sort()).toEqual(afirmacoesValidas.map(a => a.id).sort())
  expect(Object.values(corpo.respostas).every(v => v === 'verdadeiro')).toBe(true)
  expect(await screen.findByText(/Você é um dos primeiros a jogar/)).toBeInTheDocument()
})
it('mostra "Quase" quando o jogador confunde mentira com enganoso', async () => { /* render with a single-item-first order (inject the RNG or use a 12-item fixture whose first shown item is enganoso), click MENTIRA, expect /Quase: você desconfiou/ */ })
it('mostra "% das pessoas erraram esta" só quando há estatística para a afirmação', async () => { /* render with erroPorAfirmacao null → text absent after first answer; with {id: 37} for the first shown id → present */ })
```
Run: `npm test -- tests/components` → FAIL.

- [ ] **Step 2: Implement the components and pages** with the copy above. Tailwind only, mobile-first, buttons at least 48 px tall, the three answer buttons stacked on phone width. Disable the answer buttons while in feedback and the submit while `enviando` (single POST per game).

- [ ] **Step 3: Run tests, typecheck and a manual pass** — `npm test` → all PASS; `npm run typecheck` clean; `npm run dev`, play one full game on a phone-width viewport, open a fact-check link, confirm the "primeiros" message.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: quiz UI, result screen and selection-criteria page"`

---

### Task 9 (JUL-95): Deploy (Vercel + Neon) and domain — manual checklist

No code except `README.md`. These steps need the author's accounts; the executor stops and hands over if it cannot log in.

- [ ] **Step 1:** Push the branch to GitHub and import the repo in Vercel (framework auto-detected). Do not merge to `main` without the author's go-ahead.
- [ ] **Step 2:** Vercel → Storage → add Neon (free tier). It injects `DATABASE_URL`. Add `IP_HASH_SALT` (random 32+ chars, generated locally with `openssl rand -hex 32`, never pasted in chat or logs) to Production and Preview environments.
- [ ] **Step 3:** Run the migration once against the Neon database: `DATABASE_URL=... npx drizzle-kit migrate` from the local machine. Verify with `npx drizzle-kit studio` or a `select count(*) from jogadas` that the table exists.
- [ ] **Step 4:** Open the preview URL, play one game, confirm a row landed (`select count(*)`), confirm a 6th rapid POST returns 429.
- [ ] **Step 5:** Domain: check `caiunessa.com.br` availability at registro.br before buying. After registration, in Vercel add the domain and follow its instructions: either `A @ 76.76.21.21` + `CNAME www cname.vercel-dns.com` in registro.br's DNS panel, or delegate nameservers to Vercel. Confirm HTTPS works on both apex and `www`.
- [ ] **Step 6:** `README.md`: one paragraph on what the site is, the neutrality rules, how to run tests, and a pointer to `docs/superpowers/` for the spec and plans. Commit: `docs: README with setup and transparency notes`.

---

## Self-review notes

- Spec coverage: content rules → Tasks 1, 2; per-answer feedback → Task 8; final result and bias → Tasks 3, 8; stack and `POST /api/resultado` → Tasks 4–7; rate limit and LGPD → Task 5; 100-game gate → Tasks 6, 8; "Como escolhemos" page → Task 8; domain → Task 9. Out of scope items are not planned. Turnstile deliberately left out.
- Chosen values the spec left open: rate limit 5/min, `ip_hash` TTL 1 h, tier thresholds and copy (Task 3), `lado` = side of the speaker (Task 2), exact-match integer scoring with "quase" acknowledged only in copy (amendment). Change any of them in one place.
- Not fully testable by code: neutrality of the 12 statements (Task 2 Step 5 is a human read) and deployment (Task 9).
