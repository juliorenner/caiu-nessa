# Ícones de fundo e som da urna Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Três ícones em traço de tinta (Congresso na home, urna na ficha do jogo, político no placar) e o bipe de "fim" da urna ao ver o resultado, com botão de som na home.

**Architecture:** Três componentes SVG puros em `src/components/icones/`; um componente `MarcaDagua` posiciona as marcas-d'água fixas atrás do conteúdo; o som é uma função pura sobre um `AudioContext` injetável (`src/lib/som-urna.ts`) chamada no handler que fecha o último painel; a preferência vive em `localStorage` atrás de duas funções e de um botão client-only.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, Web Audio API, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-icones-som-design.md`

## Global Constraints

- Sem dependência nova; sem arquivo de áudio.
- SVGs: `viewBox="0 0 64 64"`, `fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="square" strokeLinejoin="miter"`, `aria-hidden`, `focusable="false"`; cores só por `text-tinta dark:text-papel`; marca-d'água `opacity-[0.07] dark:opacity-[0.12]`, `pointer-events-none`, `fixed`, `z-0`, conteúdo com `relative z-10`.
- Nada que leia como campanha: sem rosto, bandeira, estrela, número, verde-amarelo, vermelho.
- Som: contexto criado só no gesto; notas `[1046, 90], [1318, 90], [1568, 90]` com 30 ms de silêncio entre elas e `[2093, 350]`; `square`; ganho 0,08 com rampa de 10 ms; contexto fechado depois; toda exceção engolida. Toca só quando `ultima` e `somLigado()`.
- Preferência: `localStorage['caiu-nessa:som']` ∈ `'ligado' | 'desligado'`; ausente/erro → ligado.
- Textos: `Som da urna: ligado` / `Som da urna: desligado`.
- Commits sem `JUL-`.

## Review Focus

1. Som sem gesto: nada toca ao montar, ao responder, ao abrir o painel; só no toque/tecla que fecha o último painel. Teste em Task 3.
2. `localStorage` indisponível (modo privado lança): `somLigado()` devolve `true`, `definirSom` não lança, o botão continua funcionando na sessão. Teste em Task 2.
3. Hidratação: o botão renderiza "ligado" no servidor e só lê a preferência no cliente; sem aviso de hidratação. Teste em Task 2 (estado inicial) + `next build` no final.
4. Marca-d'água nunca captura toque nem entra na árvore acessível: `pointer-events-none` e `aria-hidden` nos três usos. Teste em Task 1 e Task 4.
5. Teclado: fechar o último painel com Enter em "Ver meu resultado" também toca (mesmo handler). Teste em Task 3.

---

### Task 1: Os três ícones e a marca-d'água

**Files:**
- Create: `src/components/icones/Urna.tsx`, `src/components/icones/Politico.tsx`, `src/components/icones/Congresso.tsx`, `src/components/MarcaDagua.tsx`
- Test: `tests/components/icones.test.tsx`

**Interfaces:**
- Produces: `Urna`, `Politico`, `Congresso`: `({ className }: { className?: string }) => ReactElement` — `<svg viewBox="0 0 64 64" aria-hidden focusable="false" className={className} …>` com as formas da spec (caixa/tampa/tela/teclado/teclas/pé; cabeça/pescoço/gola/gravata/lapela; plataforma/torres/passarela/cúpula/concha).
- Produces: `MarcaDagua({ children, posicao }: { children: ReactNode; posicao: 'rodape' | 'canto' })` → `<div aria-hidden className="pointer-events-none fixed z-0 text-tinta opacity-[0.07] dark:text-papel dark:opacity-[0.12] …">` com `rodape` = `bottom-0 left-1/2 -translate-x-1/2 w-[min(90vw,480px)]` e `canto` = `right-2 bottom-2 w-[220px]`.

- [ ] **Step 1: Teste** — cada ícone renderiza um `svg` com `aria-hidden="true"`, `viewBox="0 0 64 64"`, `fill="none"`, `stroke="currentColor"`, pelo menos 3 elementos de desenho (`path|rect|circle|line|polyline`), e aceita `className`; `MarcaDagua` tem `pointer-events-none`, `fixed`, `aria-hidden` e a classe de posição.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar** (desenhar com `rect`/`path`/`polyline` em coordenadas inteiras; conferir no navegador a 64 e a 220 px). — [ ] **Step 4: Testes + lint + typecheck** → PASS.
- [ ] **Step 5: Commit** — `feat(icones): urna, político e Congresso em traço de tinta, com marca-d'água` (inclui spec e plano).

---

### Task 2: Preferência e botão de som

**Files:**
- Create: `src/lib/som-urna.ts` (só `somLigado`/`definirSom` nesta tarefa; `tocarSomDaUrna` na Task 3), `src/components/BotaoSom.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/lib/som-urna.test.ts`, `tests/app/tema.test.tsx` (home)

**Interfaces:**
- Produces: `export const CHAVE_SOM = 'caiu-nessa:som'`; `export function somLigado(armazem: Storage | null = armazemPadrao()): boolean`; `export function definirSom(ligado: boolean, armazem: Storage | null = armazemPadrao()): void`; `armazemPadrao()` devolve `globalThis.localStorage` dentro de try/catch (null se lança ou não existe).
- Produces: `BotaoSom()` client component: `<button type="button" aria-pressed={ligado} className={LINK_PAGINA}>Som da urna: {ligado ? 'ligado' : 'desligado'}</button>`; estado inicial `true`; `useEffect` lê `somLigado()`; clique alterna e chama `definirSom`.
- Home: `<BotaoSom />` logo abaixo do `div aria-hidden` das dicas; `<MarcaDagua posicao="rodape"><Congresso className="w-full" /></MarcaDagua>` como irmão do `main`, e `main` ganha `relative z-10`.

- [ ] **Step 1: Testes** — `somLigado` com storage vazio → true; `'desligado'` → false; storage que lança em `getItem` → true; `definirSom(false)` grava `'desligado'`; storage que lança em `setItem` não propaga. Home: botão `Som da urna: ligado` com `aria-pressed="true"`; clique → `Som da urna: desligado`, `aria-pressed="false"` e `localStorage` com `'desligado'`; remontar com `'desligado'` gravado → mostra desligado depois do efeito; o `svg` do Congresso existe dentro de um ancestral `aria-hidden` com `pointer-events-none`.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: Testes + lint + typecheck** → PASS.
- [ ] **Step 5: Commit** — `feat(som): preferência do som da urna e botão na tela de início`.

---

### Task 3: O som da urna no fim da rodada

**Files:**
- Modify: `src/lib/som-urna.ts`, `src/components/Quiz.tsx`
- Test: `tests/lib/som-urna.test.ts`, `tests/components/Quiz.test.tsx`

**Interfaces:**
- Produces: `export const NOTAS: readonly [frequencia: number, duracaoMs: number][] = [[1046, 90], [1318, 90], [1568, 90], [2093, 350]]`, `export const PAUSA_MS = 30`, `export function tocarSomDaUrna(criarContexto: () => AudioContext = () => new AudioContext()): void` — para cada nota: `createOscillator()` (`type = 'square'`, `frequency.value`), `createGain()` (ganho 0 → 0,08 em 10 ms via `linearRampToValueAtTime`, → 0 em 10 ms antes do fim), `connect` oscilador → ganho → `destination`, `start(t)`/`stop(t + dur)`; `t` acumula `dur + PAUSA_MS`; `setTimeout(() => ctx.close(), total + 50)`; tudo num try/catch que engole.
- Consumes (Quiz): `somLigado`, `tocarSomDaUrna`. No **início** de `fechar()` (logo depois do `if (etapa !== 'feedback') return`), antes de qualquer `setTimeout`: `if (ultima && somLigado()) tocarSomDaUrna()`.

- [ ] **Step 1: Testes** — com um `AudioContext` falso (objeto com `currentTime: 0`, `destination: {}`, `createOscillator`/`createGain` devolvendo espiões, `close`): `tocarSomDaUrna(() => falso)` cria 4 osciladores com `type 'square'` e frequências `[1046, 1318, 1568, 2093]`, `start` em `[0, 0.12, 0.24, 0.36]` s e `stop` em `start + [0.09, 0.09, 0.09, 0.35]`; fábrica que lança → não propaga. Quiz: com `tocarSomDaUrna` mockado (`vi.mock('@/lib/som-urna')`), não é chamado ao responder nem ao fechar os 11 primeiros painéis; é chamado uma vez ao fechar o 12º (clique em "Ver meu resultado" e, noutro caso, Enter com foco no botão); com `somLigado` mockado para `false`, não é chamado.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: Testes + lint + typecheck** → PASS.
- [ ] **Step 5: Commit** — `feat(som): bipe de fim da urna ao ver o resultado`.

---

### Task 4: Urna na ficha do jogo, político no placar, verificação completa

**Files:**
- Modify: `src/components/Ficha.tsx`, `src/components/Quiz.tsx`, `src/components/ResultadoFinal.tsx`
- Test: `tests/components/Quiz.test.tsx`, `tests/components/ResultadoFinal.test.tsx`

**Interfaces:**
- Consumes: `Urna`, `Politico`, `MarcaDagua` (Task 1).
- Produces (Ficha): prop opcional `icone?: ReactNode`, renderizada num `<span aria-hidden className="hidden min-[360px]:inline-block">` antes de `esquerda`, herdando `currentColor` (sem `text-tinta`/`dark:`).
- Produces (Quiz): `<Ficha icone={<Urna className="size-[18px]" />} esquerda={…} direita={…} />`; só o jogo passa `icone`.
- Produces (ResultadoFinal): `<MarcaDagua posicao="canto"><Politico className="w-full" /></MarcaDagua>` como primeiro filho do `section`, que ganha `relative z-10` no conteúdo (ou a marca fica fora do `section`, no wrapper do Quiz; decisão do construtor, desde que a marca não entre na árvore acessível nem capture toque).

- [ ] **Step 1: Testes** — Ficha: com `icone` renderiza o nó dentro de `[aria-hidden]` antes do rótulo; sem `icone` não renderiza o span. Quiz: a ficha contém um `svg` dentro de um ancestral `aria-hidden` (o texto `Ficha 01/12` continua encontrado por `getByText`); ResultadoFinal e home não têm `svg` dentro de `[data-ficha]`; ResultadoFinal: um `svg` dentro de `[aria-hidden]` com `pointer-events-none`; `getAllByRole('button')` e os links não mudam.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: `npm run lint && npm run typecheck && npm test && npm run build`** → PASS.
- [ ] **Step 5: Commit** — `feat(icones): urna na ficha do jogo e político no placar`.
- [ ] **Step 6 (controlador): checagem visual** a 320 e 390 px nos dois temas, as três telas; som ouvido não dá para testar aqui, fica para o autor no celular.
