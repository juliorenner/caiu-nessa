# Desktop "Balcão": plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layout de duas colunas para telas ≥ 1024 px (home, quiz com painel lateral, resultado com "Suas respostas"), sem mudar o celular, mais a lista "Suas respostas" recolhida no celular.

**Architecture:** Só classes `lg:` do Tailwind sobre a árvore atual, com quatro componentes novos pequenos (`Tecla`, `PreviaDoCartao`, `CaixaDeDicas`, `SuasRespostas`) e duas mudanças estruturais: o `PainelVeredito` deixa de ser portal e vira irmão de `data-conteudo` dentro da raiz do `Quiz`; `ResultadoFinal` ganha a prop opcional `respostas`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-23-desktop-balcao-design.md` (ler inteiro, inclusive "Decisões do controlador").

## Global Constraints

- Abaixo de `lg` o DOM e o visual são os de hoje; a única novidade no celular é a seção "Suas respostas" recolhida no placar. Toda classe nova de layout leva prefixo `lg:` (ou `hidden lg:...`).
- Textos em pt-BR; nenhum número de rodada escrito à mão (`tests/app/textos-derivados.test.ts` falha): use `TOTAL_AFIRMACOES`/props.
- Tema noite: todo elemento novo usa os tokens (`tinta`/`papel`/`superficie`/`fundo-escuro`) com variante `dark:` como em `rotulos.ts`.
- Acessibilidade: nomes acessíveis de hoje não mudam (os testes dependem deles); `kbd` e prévia são `aria-hidden`.
- Commits pequenos por task; `npm run lint && npm run typecheck && npm test` verdes antes de cada commit.

## Review Focus

1. Painel fora do portal: no celular, o `fixed bottom-0` precisa continuar acima de tudo e não ser cortado pelo `overflow` da raiz (Task 3: teste de classes + captura a 390 px pelo controlador).
2. Com o painel aberto em `lg`, Tab não sai do painel e Enter avança (Task 3: teste de foco preso continua).
3. `ResultadoFinal` sem `respostas` (páginas antigas, testes) não renderiza a seção (Task 4).
4. `details` aberto em `lg` e fechado no celular sem hydration mismatch: o estado `open` é definido só no cliente, depois de montar (Task 4: teste de que o `<details>` começa fechado no jsdom).
5. Enter na home: o foco vai para "Começar" só em `lg`, sem roubar foco no celular (Task 1: teste com `matchMedia` falso).

---

### Task 1: Tecla, home em duas colunas e Enter para começar

**Files:**
- Create: `src/components/Tecla.tsx`, `src/components/PreviaDoCartao.tsx`, `src/components/FocoNoComecar.tsx`
- Modify: `src/app/page.tsx`, `src/components/rotulos.ts`
- Test: `tests/components/Tecla.test.tsx`, `tests/app/home.test.tsx` (crie se não existir; veja como `tests/app/*.test.tsx` renderizam páginas)

**Interfaces:**
- Produces: `Tecla({ children, cor?: 'tinta' | 'papel' | 'verdade' | 'mentira' | 'cheira', className? })` → `<kbd aria-hidden>` com `hidden lg:inline-flex` por padrão (quem quiser sempre visível passa `className`), estilo do mockup: borda 2 px (4 px embaixo), raio 5 px, `font-letreiro text-[12px]`, min 26×24 px. `rotulos.ts` exporta `TECLA_BASE`.
- `PreviaDoCartao()` → bloco `hidden lg:block` `aria-hidden`, dois cartões (`SUPERFICIE`) em pilha (trás `rotate-[4deg]` opaco 60 %, frente `-rotate-3`), "?" em papel (`font-letreiro text-[90px] text-papel`), frase **"Ninguém cai em fake news."** (`text-[28px] font-bold leading-tight text-balance`), carimbo `CARIMBO_CARTAO.enganoso` "Cheira mal" no canto superior direito, e os três botões desenhados com `BOTAO_RESPOSTA`/`classeBotao` (importe o que o Quiz usa) sem `onClick` (`<span>`).
- `FocoNoComecar({ alvoId })` → componente cliente sem DOM; `useEffect`: se `window.matchMedia('(min-width: 1024px)').matches`, `document.getElementById(alvoId)?.focus()`.

- [ ] **Step 1: Testes.** `Tecla`: renderiza `<kbd>` com `aria-hidden="true"`, o texto, e classes `hidden lg:inline-flex` por padrão; com `cor="verdade"` tem `text-verdade`. Home (`render(<Home />)`): existe link "Começar" com `id="comecar"` e um `kbd` "Enter" dentro; a legenda tem `kbd` "←", "↑", "→" e o texto "ou arraste com o mouse"; a frase "Ninguém cai em fake news." está num bloco `aria-hidden`; "Arraste o cartão ou toque" continua presente (classe `lg:hidden`). `FocoNoComecar`: com `matchMedia` falso devolvendo `matches: true`, `document.activeElement` vira o alvo; com `false`, não.
- [ ] **Step 2:** rodar, ver falhar.
- [ ] **Step 3:** implementar. Home: `main` ganha `lg:grid lg:max-w-5xl lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-24`; coluna 1 = conteúdo de hoje (Ficha com `lg:max-w-[420px]`, h1 `lg:text-[76px] lg:leading-[0.95]`, guia `lg:text-[21px] lg:max-w-[30ch]`, linha `lg:flex lg:items-center lg:gap-5` com Começar `lg:w-[260px]` + `<Tecla cor="papel">Enter</Tecla>` e o link "Como escolhemos"; legenda `hidden lg:flex` com as três `Tecla`s coloridas e "ou arraste com o mouse"; os `<p className={DICA}>` atuais ganham `lg:hidden`; BotaoSom fica); coluna 2 = `<PreviaDoCartao />`; `<FocoNoComecar alvoId="comecar" />` no fim.
- [ ] **Step 4:** `npx vitest run tests/components/Tecla.test.tsx tests/app` verde; `npm run lint && npm run typecheck` verdes.
- [ ] **Step 5:** commit `feat(desktop): home em duas colunas, teclas visíveis e Enter para começar`.

### Task 2: Quiz em grade, botões com teclas, caixa de dicas, texto maior

**Files:**
- Create: `src/components/CaixaDeDicas.tsx`
- Modify: `src/components/Quiz.tsx`, `src/components/CartaoAfirmacao.tsx` (`tamanhoDoTexto`, `CARTAO_BASE`), `src/app/quiz/page.tsx`
- Test: `tests/components/Quiz.test.tsx`, `tests/components/CartaoAfirmacao.test.tsx`

**Interfaces:**
- `CaixaDeDicas()` → `<aside aria-label="Dicas de teclado" className="hidden lg:flex ...">` superfície branca com título "Teclas" em letreiro, as três `Tecla`s coloridas sempre visíveis (`className="inline-flex"`) com os rótulos Mentira / Cheira mal / Verdade, e "ou arraste com o mouse".
- `tamanhoDoTexto(texto)` passa a devolver a string com os dois tamanhos: `'text-2xl lg:text-[32px]' | 'text-xl lg:text-[28px]' | 'text-lg lg:text-2xl' | 'text-base lg:text-xl'` (mesmos limiares); o tipo de retorno vira `string`. Atualize os testes que comparam o retorno.
- Quiz: a raiz continua `h-dvh`; dentro dela, `data-conteudo` vira `lg:grid lg:grid-cols-[1fr_420px] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-3` com: Ficha (`lg:col-start-1`), `CarimbosDeProgresso` (`lg:col-start-2 lg:self-center`), coluna esquerda (`lg:col-start-1 lg:row-start-2 flex min-h-0 flex-col`) com a pilha e a linha de botões, e `<CaixaDeDicas />` (`lg:col-start-2 lg:row-start-2`). Botões de resposta: `lg:h-[68px] lg:flex-row lg:gap-3 lg:text-sm`, `<Tecla cor="papel">←</Tecla>` etc. antes do rótulo (a `Tecla` é `aria-hidden`, o nome acessível não muda). Filtro de escurecimento: `lg:[filter:none]`. `quiz/page.tsx`: `lg:max-w-6xl lg:px-12`. `CARTAO_BASE`: `lg:p-12`.

- [ ] **Step 1: Testes.** Quiz: cada botão de resposta contém um `kbd` (`←`, `↑`, `→`) e mantém o nome acessível atual; existe `aside` "Dicas de teclado"; `tamanhoDoTexto('x'.repeat(50))` é `'text-2xl lg:text-[32px]'` etc.
- [ ] **Step 2:** rodar, ver falhar. **Step 3:** implementar. **Step 4:** `npx vitest run tests/components` + lint + typecheck verdes. **Step 5:** commit `feat(desktop): quiz em duas colunas com teclas e caixa de dicas`.

### Task 3: Painel do veredito como coluna lateral

**Files:**
- Modify: `src/components/PainelVeredito.tsx`, `src/components/Quiz.tsx`
- Test: `tests/components/PainelVeredito.test.tsx`, `tests/components/Quiz.test.tsx`

**Interfaces:**
- `PainelVeredito` não usa mais `createPortal`: devolve o fragmento (véu + `section`) diretamente. Quiz o renderiza como irmão de `data-conteudo`, e em `lg` ele ocupa a célula direita da linha 2 **no lugar** da `CaixaDeDicas` (a caixa recebe `lg:hidden` quando `etapa === 'feedback'`; o painel recebe `lg:col-start-2 lg:row-start-2`). Para isso, em `lg` o `data-conteudo` e o painel precisam estar na mesma grade: mova a grade para a raiz (`lg:grid ...` na raiz, `data-conteudo` com `display: contents` em `lg` via `lg:contents`) — ou outra solução equivalente que mantenha o celular igual.
- Véu: `data-backdrop` ganha `lg:hidden`. Alça: `lg:hidden`. `section`: `lg:static lg:max-h-none lg:w-auto lg:max-w-none lg:translate-x-0 lg:pt-5 lg:pb-5`, borda e sombra na cor do veredito em `lg` (`lg:border-verdade lg:shadow-[6px_6px_0_var(--color-verdade)]` etc., via mapa por veredito). Botão Próxima: `<Tecla cor="papel">Enter</Tecla>` depois do rótulo e `lg:mt-auto`. Entrada em `lg`: `lg:animate-[entrar-da-direita_200ms_ease-out]` com keyframes em `globals.css`, `motion-reduce:animate-none`.
- Foco preso, `aria-modal`, scroll lock e `data-conteudo-painel` rolável continuam como estão.

- [ ] **Step 1: Testes.** O painel é renderizado dentro do container do `render` (não em `document.body` direto): `container.querySelector('section[role="dialog"]')` existe. `data-backdrop` tem `lg:hidden`. Botão "Próxima" contém `kbd` "Enter" e mantém o nome "Próxima". Os testes de foco preso, clique no véu e Enter continuam passando.
- [ ] **Step 2:** rodar, ver falhar. **Step 3:** implementar. **Step 4:** testes + lint + typecheck. **Step 5:** commit `feat(desktop): painel do veredito ao lado do cartão em telas largas`.

### Task 4: Resultado em duas colunas e "Suas respostas"

**Files:**
- Create: `src/components/SuasRespostas.tsx`
- Modify: `src/components/ResultadoFinal.tsx`, `src/components/Quiz.tsx`
- Test: `tests/components/SuasRespostas.test.tsx`, `tests/components/ResultadoFinal.test.tsx`, `tests/components/Quiz.test.tsx`

**Interfaces:**
- `export interface RespostaDada { id: string; texto: string; veredito: Veredito; casa: Casa }` em `src/components/SuasRespostas.tsx`.
- `SuasRespostas({ respostas, acertos, total })`: `<details>` com `<summary>` "Suas respostas (N de M)" (`font-letreiro text-sm`); conteúdo: uma linha por item (`casa`: `acerto` = quadrado 26 px cheio de tinta, `erro` = hachurado, `quase` = "?"; `texto` 14 px; `SELO_VEREDITO[veredito]` com `ROTULO_VEREDITO`), separadas por `border-t-2 border-dashed`; links "Como escolhemos" e "Todas as afirmações e fontes" no fim. Em `lg`: `open` setado no cliente depois de montar quando `matchMedia('(min-width: 1024px)')` casa, e o `summary` com `lg:pointer-events-none` (sempre aberto). Superfície branca (`SUPERFICIE_LISTA`), texto alinhado à esquerda.
- `ResultadoFinal` ganha `respostas?: RespostaDada[]` (padrão `[]`; sem itens, nada renderiza). Layout: `lg:grid lg:grid-cols-2 lg:gap-14 lg:max-w-5xl lg:text-left`; coluna 1 = tudo de hoje com a linha Placar + faixa lado a lado (`lg:flex lg:items-center lg:gap-7`, placar `lg:text-[96px]`), Compartilhar alinhado à esquerda, "Continuar jogando" e "Jogar de novo" em `lg:flex-row` (o segundo com `BOTAO_SECUNDARIO` e `lg:border-dashed`); coluna 2 = `<SuasRespostas …/>`; no celular a seção fica depois de "Continuar jogando" (ordem no DOM: use `lg:col-start-2 lg:row-start-1` ou `order`). Os links "Como escolhemos" e "Ver todas as afirmações" de hoje continuam (em `lg` podem ficar só na lista: `lg:hidden` nos de baixo).
- Quiz passa `respostas={ordem.map(a => ({ id: a.id, texto: a.texto, veredito: a.veredito, casa: <mesma regra de casas> }))}`.

- [ ] **Step 1: Testes.** `SuasRespostas` com 3 itens: `summary` "Suas respostas (2 de 3)", 3 linhas na ordem, selos "Verdade"/"Mentira"/"Enganoso", `details` começa fechado no jsdom (matchMedia falso → `false`), e aberto quando `matchMedia` devolve `matches: true`. `ResultadoFinal` sem `respostas`: nenhum `details`; com `respostas`: o `details` está depois do botão "Continuar jogando" no DOM. Quiz: ao fim da rodada, o `summary` diz `Suas respostas (4 de ${TOTAL_AFIRMACOES})` no cenário que já existe (tudo "Verdade" acerta só as verdadeiras).
- [ ] **Step 2:** rodar, ver falhar. **Step 3:** implementar. **Step 4:** testes + lint + typecheck. **Step 5:** commit `feat(resultado): lista "Suas respostas" e placar em duas colunas em telas largas`.

### Task 5: /afirmacoes em grade, Playwright desktop e capturas

**Files:**
- Modify: `src/app/afirmacoes/page.tsx`, `tests/e2e/jogo.spec.ts`
- Create: `scripts/capturas.mjs` (dev-only, sem dependência nova: usa `@playwright/test` do projeto)

- [ ] **Step 1:** `/afirmacoes`: `main` `lg:max-w-5xl`; cada lista `lg:grid lg:grid-cols-2 lg:gap-4` (mantém `ul`/`li`; os testes de `tests/app/afirmacoes.test.tsx` continuam).
- [ ] **Step 2:** Playwright: `test.describe('desktop', () => { test.use({ viewport: { width: 1280, height: 800 } }) … })` com três testes: home → o link "Começar" tem o foco (`toBeFocused`); quiz → clicar /verdade/i, então o texto do cartão (`[data-cartao-atual]` ou o `p` do cartão) e o `role=dialog` estão ambos visíveis e `[data-backdrop]` não está visível; jogar a rodada inteira → `summary` "Suas respostas" existe e o `details` tem `TOTAL_AFIRMACOES` linhas (`[data-resposta]`). Marque com `test.skip(somenteLeitura)` o que grava jogada.
- [ ] **Step 3:** `scripts/capturas.mjs`: sobe `next start` numa porta, captura home, quiz (cartão e veredito) e resultado em 390×844 e 1280×800, claro e noite, em `--saida <dir>`; documente no README em "Testes e verificações".
- [ ] **Step 4:** `npm run build && npm run e2e` verde; capturas geradas. **Step 5:** commit `test(desktop): e2e a 1280 px, grade em /afirmacoes e script de capturas`.
