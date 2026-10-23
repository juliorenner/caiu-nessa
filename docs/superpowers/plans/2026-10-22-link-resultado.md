# Link de resultado com prévia Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um link `/r/<código>` por resultado, com prévia Open Graph 1200×630 do placar e uma página que convida a jogar; o texto compartilhado passa a usar esse link; na tela de placar, "Compartilhar placar" manda o link e "Mandar para os stories" manda a imagem.

**Architecture:** O código do resultado reutiliza os cinco parâmetros validados de `/cartao` (`src/lib/cartao.ts`); a página e a imagem OG vivem em `src/app/r/[codigo]/`; a composição paisagem (`CartaoOg`) e a grade HTML (`GradeDeCasas`) são componentes novos; o fluxo de share ganha um `modo` (`link` | `imagem`).

**Tech Stack:** Next.js 16 (rotas dinâmicas, `generateMetadata`, `opengraph-image.tsx` com `params`), `next/og`, Zod 4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-link-resultado-design.md`

## Global Constraints

- Sem dependência nova. Fontes e carimbo das imagens como em `/cartao` (`src/app/_imagens/`); cores só papel `#fff3dc`, tinta `#1b1540`, papel-escuro `#ffe8b5`, branco.
- Código do resultado: `{a}-{t}-{c}-{f}-{g}` (ex.: `4-12-3-caiu-feio-aeaqeeaeeqea`); separar com a regex `^(\d+)-(\d+)-(\d+)-([a-z-]+)-([aeq]+)$` e validar com `parametrosSchema`; inválido → `null` na lib, `notFound()` na página/imagem.
- Textos exatos: título/`og:title` `Alguém fez 4/12 no Caiu Nessa?`; descrição/`og:description` `Caiu em 3 das falsas ou enganosas. E você? 12 afirmações da eleição: verdade, mentira ou cheira mal.` (`Não caiu em nenhuma.` quando c = 0); `alt` `Alguém fez 4/12 no Caiu Nessa? E você?`; ficha `Placar de um amigo` / `Rodada de 12`; botões `Compartilhar placar`, `Mandar para os stories`, link `Baixar imagem para os stories`, botão `Começar`.
- Texto compartilhado: `Fiz 4/12 no Caiu Nessa? e caí em 3. E você?` e, quando com URL, uma segunda linha com a URL absoluta `${SITE_URL}/r/<código>`. No modo `link` a URL vai só em `navigator.share({ url })`; no modo `imagem` e no clipboard ela vai no texto.
- Nada de afirmação, autor, lado ou data em página, imagem ou texto. A página nunca pré-responde: `Começar` → `/quiz`.
- Imagem OG do resultado: `Cache-Control: public, max-age=86400, s-maxage=604800`, 1200×630.
- Commits sem `JUL-`.

## Review Focus

1. Código com faixa de dois hífens (`abre-o-olho`, `quase-imune`) separado corretamente; `g` com letra fora de `[aeq]` → 404. Teste em Task 1 e Task 4.
2. WhatsApp: modo `link` nunca anexa `files` e nunca duplica a URL no texto; modo `imagem` leva a URL no texto. Teste em Task 2 e Task 5.
3. Botão `Mandar para os stories` só aparece quando `canShare({ files })` é verdadeiro; no desktop fica só o link de baixar. Teste em Task 5.
4. `generateMetadata` de um código inválido não lança (404 limpo). Teste em Task 4.
5. A imagem OG do resultado e a da home não se confundem: `/r/<código>` tem `og:image` próprio, absoluto. Teste em Task 4 + `curl` no critério de pronto.

---

### Task 1: Código do resultado

**Files:**
- Modify: `src/lib/cartao.ts`
- Test: `tests/lib/cartao.test.ts`

**Interfaces:**
- Produces: `export type Parametros = { a: number; t: 6 | 12; c: number; f: Faixa; g: string }`; `export function codigoDoResultado(p: { acertos: number; total: number; caiu: number; faixa: Faixa; casas: Casa[] }): string`; `export function parametrosDoCodigo(codigo: string): Parametros | null` (regex acima + `parametrosSchema.safeParse`); `export function urlDoResultado(p: …mesmo de codigoDoResultado): string` → `/r/<código>`.

- [ ] **Step 1: Testes** — ida e volta para `abre-o-olho` e `quase-imune`; `parametrosDoCodigo('4-12-3-caiu-feio-aeaqeeaeeqea')` → objeto; `'4-12-3-caiu-feio-aeaxeeaeeqea'` → null; `'4-12-3-x-aeaqeeaeeqea'` → null; `'4-12'` → null; `urlDoResultado` começa com `/r/`.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: Testes + lint + typecheck.** — [ ] **Step 5: Commit** — `feat(link): código do resultado e sua validação` (inclui spec e plano).

---

### Task 2: Texto com URL e modo do share

**Files:**
- Modify: `src/lib/compartilhar.ts`, `src/lib/compartilhar-navegador.ts`
- Test: `tests/lib/compartilhar.test.ts`, `tests/lib/compartilhar-navegador.test.ts`

**Interfaces:**
- Produces: `textoDeCompartilhar({ acertos, total, caiu, url? }: …): string` (sem `url`: uma linha; com `url`: duas linhas).
- Produces: `export type Desfecho = 'folha' | 'copiado' | 'falhou' | 'cancelado' | 'indisponivel'`; `compartilhar({ modo: 'link' | 'imagem'; texto: string; textoComUrl: string; url: string; titulo: string; arquivo: File | null; nav?: Navigator }): Promise<Desfecho>` — `link`: `share({ text: texto, url, title })` se `share` existe, senão clipboard com `textoComUrl`; `imagem`: `share({ files: [arquivo], text: textoComUrl, title })` se `canShare?.({ files })` e `arquivo`, senão `'indisponivel'`; `AbortError` → `'cancelado'`; outra falha no `link` → clipboard; outra falha na `imagem` → `'falhou'`. `buscarArquivo` inalterado.

- [ ] **Step 1: Testes** — texto com/sem URL; `link` com share → args exatos sem `files`; `link` sem share → `writeText(textoComUrl)`; `link` share rejeita (não Abort) → clipboard; `imagem` com `canShare` true e arquivo → `files` + `text: textoComUrl`, sem `url`; `imagem` sem arquivo ou `canShare` false → `'indisponivel'` e nada chamado; Abort → `'cancelado'`.
- [ ] **Step 2–5** como acima. Commit — `feat(link): texto com a URL do resultado e share por link ou por imagem`.

---

### Task 3: Imagem OG do resultado

**Files:**
- Create: `src/app/_imagens/CartaoOg.tsx`, `src/app/r/[codigo]/opengraph-image.tsx`
- Test: `tests/app/r-opengraph-image.test.ts`

**Interfaces:**
- Consumes: `parametrosDoCodigo`, `FAIXAS`, `letrasParaCasas` (Task 1); `carregarFontes`, `fontesParaImagem`, `CarimboImagem`.
- Produces: `CartaoOg({ acertos, total, caiu, faixa: string, casas: Casa[] })` 1200×630: moldura e faixa como `opengraph-image.tsx` da home; à esquerda carimbo 140 px, `PLACAR`, número Bungee 180 px com sombra em camadas, faixa carimbada; à direita a grade (casas de 72 px, linhas de 6) e `E você? caiunessa.com.br`.
- Produces: `src/app/r/[codigo]/opengraph-image.tsx`: `runtime = 'nodejs'`, `size = { width: 1200, height: 630 }`, `contentType = 'image/png'`, `export async function generateImageMetadata({ params })` devolvendo `[{ id: 'placar', alt: 'Alguém fez 4/12 no Caiu Nessa? E você?' }]` OU `alt` fixo se `generateImageMetadata` complicar (decisão do construtor; o `alt` dinâmico é preferido); `default async function Image({ params })` → `notFound()` se inválido; `new ImageResponse(<CartaoOg …/>, { ...size, fonts, headers: { 'Cache-Control': … } })`.

- [ ] **Step 1: Testes** — `Image({ params: Promise.resolve({ codigo: '4-12-3-caiu-feio-aeaqeeaeeqea' }) })` → PNG 1200×630, `image/png`, cache header; código inválido → lança o erro de `notFound()` (mock `next/navigation`); salvar o PNG em `.superpowers/sdd/<workspace>/og-resultado.png`.
- [ ] **Step 2–5** como acima. Commit — `feat(link): imagem Open Graph 1200×630 do resultado`.

---

### Task 4: Página do resultado

**Files:**
- Create: `src/app/r/[codigo]/page.tsx`, `src/components/GradeDeCasas.tsx`
- Test: `tests/app/r-page.test.tsx`

**Interfaces:**
- Consumes: `parametrosDoCodigo`, `FAIXAS`, `letrasParaCasas` (Task 1); `Ficha`, `BOTAO_PRIMARIO`, `LINK_PAGINA`, `SUPERFICIE`, `NUMERO_PLACAR`/`CARIMBO_AVALIACAO` (hoje privados em `ResultadoFinal.tsx`: mover para `rotulos.ts` como `NUMERO_PLACAR` e `CARIMBO_FAIXA` e importar nos dois lugares).
- Produces: `GradeDeCasas({ casas }: { casas: Casa[] })` — `<ul aria-label="Acertos e erros na ordem jogada">` com `<li data-casa="acerto|erro|quase">` de 28 px, 6 por linha (flex-wrap), estilos iguais aos carimbos de progresso (tinta cheia / X / `?`), com `sr-only` por casa (`acerto`, `erro`, `quase`).
- Produces: `page.tsx` (server): `generateMetadata({ params })` → `{ title, description, openGraph: { title, description, images: ['/r/<código>/opengraph-image'] }, twitter: { card: 'summary_large_image', title, description } }`; inválido → `notFound()`; a página: `Ficha esquerda="Placar de um amigo" direita={`Rodada de ${t}`}`, número `a/t` com `aria-hidden` + sr-only `a de t`, faixa carimbada, `GradeDeCasas`, frase do caiu, `Começar` → `/quiz`, link `Como escolhemos as afirmações`. Marca-d'água do político se `src/components/MarcaDagua.tsx` existir na branch (não existe hoje: pular).

- [ ] **Step 1: Testes** — render da página com código válido: heading/textos exatos, 12 `li[data-casa]`, botão `Começar` (link para `/quiz`); `generateMetadata` com o título/descrição exatos e `openGraph.images` contendo `/r/<código>/opengraph-image`; código inválido → `notFound` chamado (mock `next/navigation`), sem lançar outro erro.
- [ ] **Step 2–5** como acima. Commit — `feat(link): página /r/<código> com o placar do amigo e o botão Começar`.

---

### Task 5: Tela de placar com as duas ações

**Files:**
- Modify: `src/components/ResultadoFinal.tsx`
- Test: `tests/components/ResultadoFinal.test.tsx`, `tests/components/Partida.test.tsx`, `tests/app/afirmacoes.test.tsx` (só se nomes de botões mudarem)

**Interfaces:**
- Consumes: Task 1 (`urlDoResultado`), Task 2 (`textoDeCompartilhar` com `url`, `compartilhar` com `modo`).
- Produces: `urlResultado = `${SITE_URL}${urlDoResultado(placar)}``; `texto = textoDeCompartilhar(placar)`; `textoComUrl = textoDeCompartilhar({ ...placar, url: urlResultado })`; estado `aceitaArquivos` lido no `useEffect` (`navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] })` em try/catch); botões: `Compartilhar placar` (primário, `modo: 'link'`), `Mandar para os stories` (secundário, só se `aceitaArquivos`, `modo: 'imagem'`; `'indisponivel'` → mostra `Imagem ainda carregando…` no aviso), link `Baixar imagem para os stories` sempre; `Continuar jogando` continua secundário abaixo; resto igual.

- [ ] **Step 1: Testes** — `link`: clique chama `share({ text: texto, url: urlResultado, title })` sem `files`; sem share → `writeText(textoComUrl)`; `imagem`: com `canShare` true e arquivo chegado, botão `Mandar para os stories` existe e chama `share` com `files` e `text: textoComUrl`; com `canShare` ausente o botão não existe; aviso `Texto copiado` continua; `Baixar imagem` sempre.
- [ ] **Step 2–5** como acima. Commit — `feat(link): Compartilhar placar manda o link; Mandar para os stories manda a imagem`.

---

### Task 6 (controlador): verificação
- [ ] `npm run lint && npm run typecheck && npm test && npm run build`; dev server: `curl -sI http://localhost:3000/r/4-12-3-caiu-feio-aeaqeeaeeqea/opengraph-image` → PNG; `curl -s http://localhost:3000/r/4-12-3-caiu-feio-aeaqeeaeeqea | grep -o '<meta property="og:[^>]*>'`; `curl -sI http://localhost:3000/r/invalido` → 404; olhar `og-resultado.png` e a página no Chrome a 390 px; rebase sobre `main` (PR #24 traz `MarcaDagua`) antes do PR.
