# Ícones pequenos no fundo dos cartões Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada cartão da afirmação ganha um padrão esparso de ícones pequenos em traço de tinta (7%), ao redor do texto, variando por cartão e por rodada, sem tocar o texto.

**Architecture:** Três ícones novos no padrão `Traco`; um componente puro `IconesDoCartao({ semente, longo })` que escolhe, de uma tabela fixa de vagas (percentuais) e de 12 variações, quais ícones vão onde; `CartaoAfirmacao` o renderiza atrás do texto; `Quiz` passa a semente.

**Tech Stack:** React 19, Tailwind 4, SVG inline, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-icones-cartao-design.md`

## Global Constraints

- Ícones no padrão `Traco` (64×64, `currentColor`, `strokeWidth` 3.5, pontas quadradas), `aria-hidden`, `focusable="false"`; nada que leia como partido, candidato, bandeira, estrela, número.
- Camada dos ícones: `absolute inset-0 pointer-events-none text-tinta opacity-[0.12]`, `aria-hidden`; os ícones em `absolute` por percentuais (`left`/`top` em %), tamanho 28–40 px, rotação −8°..8°.
- Faixa central sempre livre: nenhuma vaga com `top` entre 25% e 75% E `left` entre 12% e 88%. Com `longo` (texto `text-base`), só vagas com `top` < 12% ou > 88%, 4 ícones.
- Determinismo: mesma semente → mesmo conjunto; `semente % 12` indexa a tabela; `Quiz` passa `indice + (rodada - 1) * 7`.
- O verso (próximo cartão) não recebe ícones. O texto do cartão continua `relative` acima da camada.
- Sem dependência nova; commits sem `JUL-`.

## Review Focus

1. Afirmação mais longa a 320×568: nenhum ícone sob uma linha de texto. Teste da tabela (Task 2) + checagem visual (Task 3).
2. Arrasto continua fluido: a camada é estática (sem animação, sem filtros) e não captura ponteiro. Teste de `pointer-events-none` (Task 2) + checagem no navegador.
3. Hidratação: nada aleatório no render; semente vem de props. Teste de determinismo (Task 2).
4. Rodada extra não repete a sequência da primeira para os mesmos índices. Teste em Task 3 (semente diferente para `rodada` 2).
5. Movimento reduzido e temas: a camada não anima; cor tinta em ambos (cartão branco). Teste de classes (Task 2).

---

### Task 1: Três ícones novos

**Files:**
- Create: `src/components/icones/TituloEleitor.tsx`, `src/components/icones/Microfone.tsx`, `src/components/icones/Jornal.tsx`
- Test: `tests/components/icones.test.tsx` (estender)

**Interfaces:**
- Produces: `TituloEleitor`, `Microfone`, `Jornal`: `({ className }: { className?: string }) => ReactElement`, via `Traco`. Desenhos: título de eleitor = cartão horizontal com cantos retos, um quadrado (foto) à esquerda e três linhas à direita; microfone de debate = cápsula vertical com grade (duas linhas), haste e base; jornal = retângulo dobrado (duas folhas sobrepostas) com um título grosso e três linhas.

- [ ] **Step 1: Testes** — os três renderizam `svg` com `viewBox="0 0 64 64"`, `aria-hidden="true"`, `stroke="currentColor"`, ≥ 3 elementos de desenho, aceitam `className`.
- [ ] **Step 2–4** (falhar, implementar olhando o resultado a 32 e 300 px, passar + lint + typecheck). — [ ] **Step 5: Commit** — `feat(icones): título de eleitor, microfone e jornal` (inclui spec e plano).

---

### Task 2: `IconesDoCartao`

**Files:**
- Create: `src/components/IconesDoCartao.tsx`
- Test: `tests/components/IconesDoCartao.test.tsx`

**Interfaces:**
- Produces: `export const VAGAS: readonly { left: number; top: number }[]` (16 vagas em %, nenhuma na faixa central), `export const VARIACOES: readonly { vagas: number[]; icones: number[]; giros: number[] }[]` (12 entradas, 6–9 itens cada; `icones` indexa `REPERTORIO = [Urna, Politico, Congresso, TituloEleitor, Microfone, Jornal]`), `export function escolher(semente: number, longo: boolean): { vaga: { left; top }; Icone; giro: number; tamanho: number }[]` (`longo` filtra vagas com `top < 12 || top > 88` e corta em 4), `export function IconesDoCartao({ semente, longo }: { semente: number; longo: boolean })` → `<div aria-hidden data-icones-cartao className="pointer-events-none absolute inset-0 overflow-hidden text-tinta opacity-[0.12]">` com um `<span>` por item em `absolute` (`style={{ left: '%', top: '%', transform: 'rotate(..deg)' }}`) contendo o ícone com `className="size-[Npx]"`.

- [ ] **Step 1: Testes** — `VAGAS` nunca na faixa central (todas satisfazem `top < 25 || top > 75 || left < 12 || left > 88`); `escolher(3, false)` tem entre 6 e 9 itens e é igual a `escolher(15, false)` (módulo 12) e diferente de `escolher(4, false)`; `escolher(3, true)` tem 4 itens, todos com `top < 12 || top > 88`; render: container `aria-hidden`, `pointer-events-none`, `absolute`, N `svg` filhos; sem aleatoriedade (duas renders iguais).
- [ ] **Step 2–4** como acima. — [ ] **Step 5: Commit** — `feat(cartao): camada de ícones pequenos, determinística por semente`.

---

### Task 3: No cartão

**Files:**
- Modify: `src/components/CartaoAfirmacao.tsx`, `src/components/PilhaDeCartoes.tsx`, `src/components/Quiz.tsx`
- Test: `tests/components/CartaoAfirmacao.test.tsx`, `tests/components/Quiz.test.tsx`

**Interfaces:**
- Consumes: `IconesDoCartao`, `tamanhoDoTexto` (já existe em `CartaoAfirmacao`).
- Produces: `CartaoAfirmacao` ganha prop `semente: number`; renderiza `<IconesDoCartao semente={semente} longo={tamanhoDoTexto(afirmacao.texto) === 'text-base'} />` como primeiro filho (atrás do `?`, das dicas e do texto, que já são `relative`/`absolute` acima; conferir z-order: o texto `relative` fica acima de um irmão anterior `absolute` sem z-index). `PilhaDeCartoes` repassa `semente` ao cartão atual; o verso não muda. `Quiz` passa `semente={indice + (rodada - 1) * 7}`.

- [ ] **Step 1: Testes** — `CartaoAfirmacao` com `semente` renderiza `[data-icones-cartao]` com ≥ 4 `svg`; texto longo → exatamente 4; o verso (`[data-verso]`) não tem `[data-icones-cartao]`; `Quiz` rodada 1 cartão 0 e rodada 2 cartão 0 produzem conjuntos diferentes (comparar `innerHTML` do container); arrasto e carimbo continuam (testes existentes passam).
- [ ] **Step 2–4** como acima, mais `npm test && npm run build`. — [ ] **Step 5: Commit** — `feat(cartao): ícones pequenos ao redor do texto, variando por cartão e rodada`.
- [ ] **Step 6 (controlador):** checagem visual a 320 e 390 px com a afirmação mais longa e uma curta; arrasto no Chrome.
