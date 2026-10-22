# Caiu Nessa? v2 — cartões com swipe: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the question screen with a draggable card stack (right = verdade, left = mentira, up = cheira mal), a bottom-sheet verdict panel, a running counter, and light/dark themes, without touching data, API or rules.

**Architecture:** The `Quiz` state machine (`pergunta → feedback → enviando → resultado | erro`) stays; a new `respondendo` sub-phase covers the ~300 ms fly animation. Gesture math is a pure module tested without a DOM; a `useArrasto` hook wires pointer events to it; `CartaoAfirmacao` renders transform + stamp; `PainelVeredito` replaces the inline `Feedback` card with a bottom sheet; theme tokens live in `globals.css` and `rotulos.ts` so every page picks them up.

**Tech Stack:** Next.js 16 App Router, React 19 (`import type { ReactElement } from 'react'`; the global `JSX` namespace is gone), TypeScript 7, Tailwind 4 (`dark:` follows `prefers-color-scheme` by default), Vitest + Testing Library. No gesture or animation library.

**Spec:** `docs/superpowers/specs/2026-10-22-swipe-cartoes-design.md` (approved by the author on 2026-10-22, "qualquer coisa corrigimos depois").

**Tracking:** Linear JUL-109. Work on branch `jul-109-swipe-cartoes` off `main`; one PR at the end (plus the final whole-branch review), cubic gate on the head commit.

## Global Constraints

- Gestures: right → `verdadeiro`, left → `falso`, up → `enganoso`, down → nothing. Threshold: 35% of card width (horizontal) or 25% of card height (vertical); a move under 8 px is a tap, not a swipe. Dominant axis decides the stamp.
- The three buttons do exactly what the gestures do, including the animation. Keyboard: ArrowLeft / ArrowUp / ArrowRight answer.
- The verdict panel always opens after an answer and cannot be skipped; `Próxima` (or `Ver meu resultado` on the 12th) or dragging the panel down closes it. Focus lands on that advance button; the panel scrolls internally when its content exceeds ~85% of the viewport height, the page never does. The answered card stays tilted and stamped under the backdrop; the next card's text is never readable while the panel is open.
- Counter chip `{acertos} de {respondidas} ✔` appears after the first answer, hidden on the result screen; progress bar `n/12`.
- Themes via `prefers-color-scheme` only: light "Carimbo" (warm cream background, white card, filled buttons) and dark "Noite" (near-black purple-tinted background, light card, outlined buttons). Verdict colours identical in both; no colour ever maps to a side. `<meta name="color-scheme" content="light dark">`.
- `prefers-reduced-motion: reduce` disables tilt, fly and sheet slide (instant changes).
- Quiz screen fits one viewport at 320×568: no page scroll; `touch-action: none` on the card only; statement font steps 20 → 18 → 16 px by length (never below 16).
- Mobile rules unchanged: 320–430 px, single column, buttons ≥ 48 px, text ≥ 16 px, contrast ≥ 4.5:1 in both themes including the highlighted button state.
- `lado` never reaches the browser; `Quem disse` and the quote only in the panel. All existing copy unchanged; new copy exactly: hint line `← mentira · ↑ cheira mal · verdade →`; landing line `Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.`
- No data, API or curation changes. Existing 104 tests keep passing.

## Review Focus

1. A vertical page scroll on the quiz screen would compete with swipe-up; the quiz page must never overflow 100dvh at 320×568 (Task 5 test measures layout with the longest live statement).
2. A pointer-down then pointer-up with < 8 px movement must not answer (Task 2 test `toque sem arrasto não responde`).
3. During the 300 ms fly animation a second gesture or button press must be ignored, never recorded as a second answer (Task 5 test `ignora resposta durante a animação`).
4. Reduced motion: with `prefers-reduced-motion: reduce` the answer still registers and the panel still opens, with no transition classes (Task 3 and Task 4 tests).
5. Keyboard users: arrow keys answer only while a card is active (not while the panel is open) and focus lands on `Próxima` when the panel opens (Task 4 test, Task 5 test).

---

### Task 1: Theme tokens, colour-scheme meta, landing hint

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/rotulos.ts`, `src/app/page.tsx`
- Test: `tests/app/tema.test.tsx`

**Interfaces:**
- Produces (in `rotulos.ts`, strings of Tailwind classes, light + `dark:` variants):
  ```ts
  export const FUNDO_PAGINA: string          // body background + text for both themes
  export const CARTAO_SUPERFICIE: string     // card / panel surface for both themes
  export const TEXTO_SECUNDARIO: string      // muted text, both themes
  export const BOTAO_RESPOSTA: Record<Veredito, { base: string; destaque: string; esmaecido: string }>
  export const COR_SELO_CARTAO: Record<Veredito, string>   // stamp border+text colour for the card stamp
  export const ROTULO_BOTAO: Record<Veredito, string>      // 'VERDADE' | 'MENTIRA' | 'ISSO ME CHEIRA MAL 🤔'
  ```
  `BOTAO_RESPOSTA[v].base`: light = filled (verde `bg-emerald-700 text-white`, vermelho `bg-rose-700 text-white`, âmbar `bg-amber-500 text-stone-900`); dark = outlined (`dark:bg-transparent dark:border-2` with `dark:border-emerald-400 dark:text-emerald-300`, rose-400/300, amber-400/300). `destaque`: ring-4 + the filled colour in both themes (≥ 4.5:1). `esmaecido`: `opacity-40`.
- `globals.css`: `@theme` tokens `--color-fundo`, `--color-fundo-escuro`, `--color-superficie`, `--color-superficie-escura` (Carimbo: `#fbf7ef` / card `#ffffff`; Noite: `#14121a` / card `#fdfcf9`). `body` gets `FUNDO_PAGINA` via `layout.tsx`.
- `layout.tsx`: `export const viewport: Viewport = { colorScheme: 'light dark', width: 'device-width', initialScale: 1 }` (Next renders the `color-scheme` meta).

- [ ] **Step 1: Write the failing tests**

```tsx
// tests/app/tema.test.tsx
import { viewport } from '@/app/layout'
import Landing from '@/app/page'
it('declara color-scheme light dark', () => { expect(viewport.colorScheme).toBe('light dark') })
it('landing explica o gesto', () => {
  render(<Landing />)
  expect(screen.getByText('Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.')).toBeInTheDocument()
})
it('botões de resposta têm variante clara e escura', () => {
  for (const v of VEREDITOS) { expect(BOTAO_RESPOSTA[v].base).toMatch(/dark:/); expect(BOTAO_RESPOSTA[v].destaque).toMatch(/ring-4/) }
})
```

- [ ] **Step 2: Run** `npm test -- tests/app/tema.test.tsx` → FAIL (no `viewport` export, no hint text, no `BOTAO_RESPOSTA`).
- [ ] **Step 3: Implement** the tokens, the `viewport` export, the landing line under `Começar`, and swap `bg-stone-50 text-stone-900` on `body` for `FUNDO_PAGINA`. Apply `CARTAO_SUPERFICIE` / `TEXTO_SECUNDARIO` to `ResultadoFinal.tsx`, `afirmacoes/page.tsx`, `como-escolhemos/page.tsx` and `page.tsx` so every page has a dark variant (no structural change).
- [ ] **Step 4: Run** `npm test`, `npm run typecheck`, `npm run build` → all pass.
- [ ] **Step 5: Commit** — `feat: light and dark theme tokens, color-scheme meta, landing gesture hint`

---

### Task 2: Gesture math (pure) and `useArrasto` hook

**Files:**
- Create: `src/components/arrasto.ts`
- Test: `tests/components/arrasto.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const LIMIAR_HORIZONTAL = 0.35   // of card width
  export const LIMIAR_VERTICAL = 0.25     // of card height
  export const TOQUE_MAX_PX = 8
  export const INCLINACAO_MAX_GRAUS = 12
  export type Direcao = 'direita' | 'esquerda' | 'cima' | 'baixo' | null
  export function direcaoDominante(dx: number, dy: number): Direcao        // null when |dx|,|dy| < TOQUE_MAX_PX
  export function vereditoDaDirecao(d: Direcao): Veredito | null          // direita→verdadeiro, esquerda→falso, cima→enganoso, baixo/null→null
  export function passouLimiar(dx: number, dy: number, largura: number, altura: number): Veredito | null  // vereditoDaDirecao only if beyond the axis threshold
  export function inclinacao(dx: number, largura: number): number         // degrees, clamped to ±INCLINACAO_MAX_GRAUS, sign of dx
  export function opacidadeSelo(dx: number, dy: number, largura: number, altura: number): number  // 0..1 = progress toward the threshold on the dominant axis
  export function useArrasto(opts: { ativo: boolean; onResposta: (v: Veredito) => void }): {
    handlers: { onPointerDown: React.PointerEventHandler; onPointerMove: React.PointerEventHandler; onPointerUp: React.PointerEventHandler; onPointerCancel: React.PointerEventHandler }
    dx: number; dy: number; arrastando: boolean
    selo: Veredito | null          // stamp to show while dragging (dominant direction, or null for baixo/tap)
  }
  ```
  The hook reads the card size from `event.currentTarget.getBoundingClientRect()` on pointer down (the card element, never the touched child), calls `setPointerCapture`, and on pointer up calls `onResposta(passouLimiar(...))` when non-null; otherwise resets `dx, dy` to 0. When `ativo` is false, handlers are no-ops.

- [ ] **Step 1: Write the failing tests**

```ts
describe('direcaoDominante', () => {
  it.each([[60, 5, 'direita'], [-60, 5, 'esquerda'], [5, -60, 'cima'], [5, 60, 'baixo'], [3, -3, null], [40, -45, 'cima']])('(%i,%i) → %s', (dx, dy, esperado) => expect(direcaoDominante(dx, dy)).toBe(esperado))
})
describe('passouLimiar (cartão 300×400)', () => {
  it('direita além de 35% responde verdadeiro', () => expect(passouLimiar(106, 0, 300, 400)).toBe('verdadeiro'))
  it('direita aquém de 35% não responde', () => expect(passouLimiar(104, 0, 300, 400)).toBeNull())
  it('cima além de 25% responde enganoso', () => expect(passouLimiar(0, -101, 300, 400)).toBe('enganoso'))
  it('baixo nunca responde', () => expect(passouLimiar(0, 300, 300, 400)).toBeNull())
  it('toque sem arrasto não responde', () => expect(passouLimiar(5, 5, 300, 400)).toBeNull())
})
it('inclinacao satura em ±12°', () => { expect(inclinacao(1000, 300)).toBe(12); expect(inclinacao(-1000, 300)).toBe(-12); expect(inclinacao(0, 300)).toBe(0) })
it('opacidadeSelo é 1 no limiar e 0 parado', () => { expect(opacidadeSelo(105, 0, 300, 400)).toBeCloseTo(1); expect(opacidadeSelo(0, 0, 300, 400)).toBe(0) })
describe('useArrasto', () => {   // renderHook + a div with the handlers, pointer events via fireEvent.pointerDown/Move/Up with clientX/Y; mock getBoundingClientRect to 300×400
  it('chama onResposta ao soltar além do limiar', ...)
  it('não chama onResposta quando ativo=false', ...)
  it('volta a zero ao soltar aquém do limiar', ...)
})
```

- [ ] **Step 2: Run** `npm test -- tests/components/arrasto.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement** `src/components/arrasto.ts` (pure functions + hook; `setPointerCapture` guarded with optional chaining for jsdom).
- [ ] **Step 4: Run** the test → PASS; `npm run typecheck` clean.
- [ ] **Step 5: Commit** — `feat: gesture math and useArrasto hook`

---

### Task 3: `CartaoAfirmacao` and `PilhaDeCartoes`

**Files:**
- Create: `src/components/CartaoAfirmacao.tsx`, `src/components/PilhaDeCartoes.tsx`
- Test: `tests/components/CartaoAfirmacao.test.tsx`

**Interfaces:**
- Consumes Task 2 hook and Task 1 tokens.
- Produces:
  ```tsx
  export type FaseCartao = 'ativo' | 'respondido' | 'saindo'   // ativo: draggable; respondido: tilted+stamped, frozen (panel open); saindo: flying out (300 ms) then unmounted
  export function CartaoAfirmacao(p: { afirmacao: AfirmacaoNoQuiz; fase: FaseCartao; respostaDada: Veredito | null; onResposta: (v: Veredito) => void; reduzirMovimento: boolean }): ReactElement
  export function tamanhoDoTexto(texto: string): 'text-xl' | 'text-lg' | 'text-base'   // ≤ 90 chars → text-xl (20 px); ≤ 160 → text-lg (18); else text-base (16)
  export function PilhaDeCartoes(p: { atual: AfirmacaoNoQuiz; proxima: AfirmacaoNoQuiz | null; fase: FaseCartao; respostaDada: Veredito | null; onResposta: (v: Veredito) => void; reduzirMovimento: boolean }): ReactElement
  ```
  Card: `role="group"`, `aria-label="Afirmação"`, `touch-action: none`, `style.transform = translate(dx, dy) rotate(inclinacao)` while dragging; stamp `<span data-selo={veredito}>` with `ROTULO_BOTAO[veredito]` text, opacity from `opacidadeSelo` (1 when `respondido`/`saindo`); `fase === 'saindo'` adds a transition class that translates ±120% on the answered axis unless `reduzirMovimento`. The next card renders behind at `scale-95 opacity-60` with no text (`aria-hidden`).

- [ ] **Step 1: Write the failing tests**

```tsx
it('arrastar para a direita além do limiar chama onResposta(verdadeiro)', () => { /* mock getBoundingClientRect 300×400; pointerDown(10,10) → pointerMove(140,12) → pointerUp */ })
it('mostra o selo MENTIRA enquanto arrasta para a esquerda', () => { /* move -80 px, expect span[data-selo="falso"] with text 'MENTIRA' and opacity > 0 */ })
it('toque sem arrasto não responde e não mostra selo', ...)
it('fase respondido ignora gestos e mantém o selo da resposta', ...)
it('tamanhoDoTexto degrada por comprimento', () => { expect(tamanhoDoTexto('a'.repeat(80))).toBe('text-xl'); expect(tamanhoDoTexto('a'.repeat(150))).toBe('text-lg'); expect(tamanhoDoTexto('a'.repeat(200))).toBe('text-base') })
it('reduzirMovimento: sem classes de transição e sem rotate', ...)
it('pilha: o próximo cartão está atrás, sem texto e aria-hidden', ...)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** `npm test` → PASS, typecheck clean.
- [ ] **Step 5: Commit** — `feat: draggable statement card with stamp, and the card stack`

---

### Task 4: `PainelVeredito` (bottom sheet)

**Files:**
- Create: `src/components/PainelVeredito.tsx`
- Modify: `src/components/Feedback.tsx` → keep only `mensagem()` exported (move it to `src/components/mensagemVeredito.ts`) and delete the old component once `Quiz` no longer uses it (Task 5)
- Test: `tests/components/PainelVeredito.test.tsx`

**Interfaces:**
- Produces:
  ```tsx
  export function PainelVeredito(p: { afirmacao: AfirmacaoNoQuiz; respostaDada: Veredito; erroPct: number | null; ultima: boolean; onFechar: () => void; reduzirMovimento: boolean }): ReactElement
  // src/components/mensagemVeredito.ts
  export function mensagem(veredito: Veredito, respostaDada: Veredito): string   // moved verbatim from Feedback.tsx
  ```
  Renders: backdrop `div[data-backdrop]` (click does nothing); sheet `section[role="dialog"][aria-modal="true"][aria-label="Veredito da afirmação"][aria-live="polite"]` with handle, `SELO_VEREDITO` badge, `mensagem(...)`, `Quem disse: {autor}`, `“{citacao}”`, `explicacao`, `{erroPct}% das pessoas erraram esta.` when not null, link `Ver a checagem ({fonte_nome})` (`target="_blank" rel="noopener noreferrer"`), button `Próxima` / `Ver meu resultado` (`BOTAO_PRIMARIO`). Focus moves to that advance button on mount, whatever its label; focus is contained in the sheet (Tab/Shift+Tab cycle inside it); the sheet is rendered with `createPortal` into `document.body` (so the `inert` placed on the quiz content by Task 5 never covers it). The sheet is `max-h-[85dvh] overflow-y-auto` (internal scroll; the page behind never scrolls); badge, result line and `Quem disse` come first so they are visible without scrolling. Drag-down on the handle beyond 80 px calls `onFechar` (uses `useArrasto`-style pointer handling but only the vertical-down case; implement inline). Enter slides from the bottom (`translate-y-full → 0`, 250 ms) unless `reduzirMovimento`. Escape key does nothing (the panel cannot be skipped).

- [ ] **Step 1: Write the failing tests** — `mostra selo, mensagem, autor, citação, explicação, % erraram e link`; `foco vai para o botão de avanço ao abrir (Próxima e Ver meu resultado)`; `painel tem rolagem interna (max-h-[85dvh] overflow-y-auto)`; `painel tem aria-label "Veredito da afirmação"`; `Tab a partir do último elemento volta ao primeiro (foco contido)`; `Próxima chama onFechar`; `arrastar a alça para baixo além de 80 px fecha`; `Escape não fecha`; `última mostra "Ver meu resultado"`; `reduzirMovimento sem classe de transição`.
- [ ] **Step 2–4:** FAIL → implement → `npm test` PASS, typecheck clean.
- [ ] **Step 5: Commit** — `feat: verdict bottom sheet`

---

### Task 5: Integrate into `Quiz`: top bar, counter, no-scroll layout, keyboard, buttons

**Files:**
- Modify: `src/components/Quiz.tsx`, `src/app/quiz/page.tsx` (the page wrapper loses its vertical padding and becomes a plain `main`; only the quiz root sizes itself), `src/components/Feedback.tsx` (delete)
- Test: `tests/components/Quiz.test.tsx` (update + extend)

**Interfaces:**
- Consumes Tasks 1–4. `QuizProps` unchanged (so `quiz/page.tsx` keeps working).
- State becomes:
  ```ts
  type Estado =
    | { etapa: 'pergunta'; indice: number }
    | { etapa: 'respondendo'; indice: number }     // 300 ms (0 ms under reduced motion) between answer and panel
    | { etapa: 'feedback'; indice: number }
    | { etapa: 'saindo'; indice: number }          // panel closed, card flying out, then next 'pergunta'
    | { etapa: 'enviando' } | { etapa: 'resultado'; dados: RespostaResultado } | { etapa: 'erro'; motivo: ... }
  ```
  Layout (quiz screen): one sized element only: `div.flex.h-dvh.flex-col.box-border.px-4.pt-4.pb-[max(1rem,env(safe-area-inset-bottom))].overflow-hidden` (the page wrapper has no vertical padding or height of its own). The quiz content (top row, progress, stack, hint, buttons) lives in an inner `div[data-conteudo]` that gets `inert` while the sheet is open; the sheet itself is rendered through `createPortal(..., document.body)` so it is never inside the inert subtree → top row (`Afirmação n de 12` + counter chip `{acertos} de {respondidas} ✔`, chip hidden until `respondidas > 0`) → progress bar (`div[role=progressbar][aria-valuenow=n][aria-valuemax=12]`) → `PilhaDeCartoes` (`flex-1 min-h-0`) → hint line `← mentira · ↑ cheira mal · verdade →` (`TEXTO_SECUNDARIO`, text-sm allowed here: non-essential hint) → three buttons (`BOTAO_RESPOSTA`, `min-h-12`, `destaque` on the chosen one during `respondendo`, `esmaecido` on the others). `acertos` counts `respostas[id] === veredito` over answered ids (client-side, display only; the server still computes the real score).
  Keyboard: a `keydown` listener on the quiz root answers on ArrowLeft/ArrowUp/ArrowRight only in `pergunta`. Reduced motion read once via `matchMedia` in `useEffect` (false during SSR).

- [ ] **Step 1: Update and extend the tests**

Keep the existing tests passing with the new DOM (they click the three buttons and read `Afirmação n de 12`, the panel copy, the payload). Add:
```tsx
it('responde por gesto e abre o painel', ...)                    // pointer events on the card → panel visible with the verdict
it('contador aparece após a primeira resposta e conta acertos', ...)  // e.g. answer e1 (verdadeiro) with VERDADE → '1 de 1 ✔'; then e3 (falso) with VERDADE → '1 de 2 ✔'
it('ignora resposta durante a animação', ...)                    // click VERDADE then MENTIRA within the respondendo window; payload has the first only
it('setas do teclado respondem só na pergunta', ...)
it('painel é obrigatório: próximo cartão só depois de Próxima', ...)
it('tela do quiz não excede a viewport (320×568) com a afirmação mais longa', ...)  // jsdom has no layout: assert the quiz root has h-dvh + overflow-hidden + box-border, the page wrapper has no py-/pt-/pb- class, and the card text class from tamanhoDoTexto for the longest fixture/live statement; a real-browser check happens in Task 6
it('conteúdo do quiz fica inert enquanto o painel está aberto, e o painel não', ...)   // div[data-conteudo] has inert; the dialog (portal) does not and its button is focusable
it('contador some na tela de resultado', ...)
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** the integration; delete `Feedback.tsx`; `quiz/page.tsx` wrapper. **Step 4:** `npm test`, `npm run typecheck`, `npm run build` → PASS.
- [ ] **Step 5: Commit** — `feat: swipe quiz screen with card stack, verdict sheet, counter and keyboard`

---

### Task 6: Real-browser verification, decision log, PR

**Files:**
- Modify: `docs/superpowers/plans/2026-10-22-ajustes-pos-mvp.md` (entry for the v2), `README.md` (one line on gestures)

- [ ] **Step 1:** `.env.local` with `DATABASE_URL=file:./.pglite`, `IP_HASH_SALT=dev-local`; `npm run build && npx next start -p 3100`.
- [ ] **Step 2:** In Chrome at 320×568 and 390×844, light and dark (`prefers-color-scheme` emulation or OS setting): play one full game by gestures only and one by buttons only; after each step assert in the console `document.documentElement.scrollHeight <= innerHeight` on the quiz screen; no console errors; counter correct; panel appeared 12 times. Record results in the implementation report and in the decision log entry.
- [ ] **Step 3:** Decision log entry `## 2026-10-22 — v2 cartões com swipe (JUL-109)` with the design doc path and the controller calls; README gesture line.
- [ ] **Step 4: Commit** — `docs: v2 swipe cards entry and README gesture note`; push `jul-109-swipe-cartoes`; open the PR (title `feat: swipe cards, verdict sheet, counter and light/dark themes`), cubic gate, final whole-branch review on Fable.

---

## Self-review notes

- Spec coverage: gestures/thresholds/tap (Task 2); stamp, tilt, fly, reduced motion, stack with hidden next text (Task 3); panel contents incl. "% erraram", mandatory panel, drag-down, focus, aria-live (Task 4); top row, counter, progress, buttons by theme + highlight, keyboard, no-scroll layout, font steps (Tasks 3, 5); themes and meta, other pages, landing line (Task 1); verification criteria (Task 6). Non-goals untouched.
- Controller calls carried from the spec: filled/outlined buttons by theme; highlight only during the fly; "% erraram" stays; no scroll with font steps; answered card stays under the backdrop.
- Not testable in jsdom: real viewport fit and contrast; both are in Task 6's browser pass.
