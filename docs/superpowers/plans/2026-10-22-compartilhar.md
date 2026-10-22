# Compartilhar (OG, botão, cartão dos stories) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prévia Open Graph em todas as páginas, botão "Compartilhar placar" que abre a folha do sistema com texto + imagem 1080×1920 no estilo Letreiro (ou copia/baixa como fallback), e a rota que gera essa imagem.

**Architecture:** Duas imagens geradas com `ImageResponse` (`next/og`) em rotas Node, com fontes TTF lidas de `src/app/fontes/` por um carregador compartilhado; a lógica de texto, grade e URL do cartão em funções puras (`src/lib/compartilhar.ts`, `src/lib/cartao.ts`); `ResultadoFinal` ganha o botão e o fluxo de share com pré-busca da imagem ao montar.

**Tech Stack:** Next.js 16 (`next/og`, Metadata API), React 19, Zod 4, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-22-compartilhar-design.md`

## Global Constraints

- Sem dependência nova. Fontes das imagens: `src/app/fontes/Bungee-Regular.ttf` e `AtkinsonHyperlegible-Bold.ttf` (já no working tree, com `OFL-*.txt`), lidas com `readFile(join(process.cwd(), 'src/app/fontes', nome))`; nunca buscadas de host externo.
- `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://caiunessa.com.br'` e `DESCRICAO = '12 afirmações da eleição. Verdade, mentira ou cheira mal? Descubra em quantas você caiu.'` em `src/lib/site.ts`; todo texto/URL de compartilhamento vem daí.
- Paleta das imagens: papel `#fff3dc`, tinta `#1b1540`, papel-escuro `#ffe8b5`, branco `#ffffff`; nenhuma outra cor. Nada de afirmação, autor, lado ou data em imagem ou texto.
- Satori: só flex (sem grid), sem `repeating-linear-gradient`; SVG inline ok; `textShadow` ok (verificado no spike).
- Rota `/cartao`: `Cache-Control: public, max-age=86400, s-maxage=604800`; parâmetros validados com Zod; 400 com texto curto quando inválido.
- O botão nunca "não faz nada": share com arquivos → share só texto → clipboard, sem esperar `fetch` depois do toque (imagem pré-buscada ao montar).
- Textos exatos: `Compartilhar placar`, `Texto copiado`, `Não deu para copiar`, `Baixar imagem para os stories`, `INSIRA A FICHA · caiunessa.com.br`, `E você? caiunessa.com.br`, `Caí em N das falsas ou enganosas.` / `Não caí em nenhuma.`
- Commits sem `JUL-`.

## Review Focus

1. Toque em "Compartilhar placar" no iOS antes de a imagem chegar: deve abrir a folha só com texto na hora, nunca esperar. Teste em Task 4 (share chamado sem `files` quando a pré-busca ainda não resolveu).
2. `navigator.share` lança `NotAllowedError`/outra falha: cai para clipboard e mostra `Texto copiado`; `AbortError` não mostra nada. Teste em Task 4.
3. Rota `/cartao` com `g` cujo número de `a` não bate com `a`, ou `t` fora de {6,12}: 400, nunca uma imagem errada. Teste em Task 3.
4. Rodada extra (6 casas): texto com uma linha de 6, cartão com uma linha. Teste em Task 2 e Task 3.
5. Prévia OG: URL absoluta da imagem (`metadataBase`), `og:image` 1200×630, `twitter:card` `summary_large_image`. Teste em Task 1 + `curl` na home renderizada no critério de pronto.

---

### Task 1: Site, metadata e imagem Open Graph

**Files:**
- Create: `src/lib/site.ts`, `src/app/_imagens/fontes.ts`, `src/app/_imagens/CarimboImagem.tsx`, `src/app/opengraph-image.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/app/metadata.test.ts`, `tests/app/opengraph-image.test.ts`

**Interfaces:**
- Produces `src/lib/site.ts`: `export const SITE_URL: string` (regra acima), `export const DOMINIO = 'caiunessa.com.br'`, `export const DESCRICAO: string`, `export const TITULO = 'Caiu Nessa?'`.
- Produces `src/app/_imagens/fontes.ts`: `export async function carregarFontes(): Promise<{ bungee: Buffer; atkinson: Buffer }>` (lê uma vez, cacheia em módulo) e `export function fontesParaImagem(f: { bungee: Buffer; atkinson: Buffer }): { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[]` → `[{ name: 'Bungee', weight: 400 }, { name: 'Atkinson Hyperlegible', weight: 700 }]`.
- Produces `src/app/_imagens/CarimboImagem.tsx`: `export function CarimboImagem({ tamanho, cor }: { tamanho: number; cor: string })` — o mesmo `<svg viewBox="0 0 64 64">` de `src/components/Carimbo.tsx` com `fill={cor}`/`stroke={cor}` explícitos (satori não resolve `currentColor` com segurança) e sem `className`.
- Produces `src/app/opengraph-image.tsx`: `export const runtime = 'nodejs'`, `export const dynamic = 'force-static'`, `export const alt = \`${TITULO} ${DESCRICAO}\``, `export const size = { width: 1200, height: 630 }`, `export const contentType = 'image/png'`, `export default async function Image(): Promise<ImageResponse>` com a composição da spec §1.
- Produces (`layout.tsx`): `metadata.description = DESCRICAO`, `metadataBase: new URL(SITE_URL)`, `openGraph`, `twitter` como na spec.

- [ ] **Step 1: Testes**

`tests/app/metadata.test.ts`:
```ts
import { metadata } from '@/app/layout'
import { DESCRICAO, SITE_URL } from '@/lib/site'
it('metadata tem OG e Twitter com base absoluta', () => {
  expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
  expect(metadata.description).toBe(DESCRICAO)
  expect(metadata.openGraph).toMatchObject({ title: 'Caiu Nessa?', description: DESCRICAO, url: '/', siteName: 'Caiu Nessa?', locale: 'pt_BR', type: 'website' })
  expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Caiu Nessa?', description: DESCRICAO })
})
it('SITE_URL padrão é o domínio final', () => { expect(SITE_URL).toBe('https://caiunessa.com.br') })
```
(mock de `next/font/google` como em `tests/app/tema.test.tsx`.)

`tests/app/opengraph-image.test.ts`:
```ts
import Image, { alt, contentType, size } from '@/app/opengraph-image'
it('gera PNG 1200×630', async () => {
  const res = await Image()
  expect(res.headers.get('content-type')).toBe('image/png')
  const png = Buffer.from(await res.arrayBuffer())
  expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630)
  expect(size).toEqual({ width: 1200, height: 630 }); expect(contentType).toBe('image/png'); expect(alt).toContain('cheira mal')
})
```
- [ ] **Step 2: Ver falhar** — `npx vitest run tests/app/metadata.test.ts tests/app/opengraph-image.test.ts`.
- [ ] **Step 3: Implementar** conforme Interfaces e spec §1. `ImageResponse` de `next/og`; `fonts: fontesParaImagem(await carregarFontes())`.
- [ ] **Step 4: Testes + lint + typecheck** → PASS. Salvar o PNG gerado em `.superpowers/sdd/<workspace>/og.png` (um `node -e`/script no teste é aceitável) para o controlador olhar.
- [ ] **Step 5: Commit** — `feat(compartilhar): prévia Open Graph com imagem 1200×630 no estilo Letreiro` (inclui `src/app/fontes/` e as licenças OFL, o design doc e este plano).

---

### Task 2: Texto, grade e parâmetros do cartão (funções puras)

**Files:**
- Create: `src/lib/compartilhar.ts`, `src/lib/cartao.ts`
- Test: `tests/lib/compartilhar.test.ts`, `tests/lib/cartao.test.ts`

**Interfaces:**
- Produces `src/lib/cartao.ts`: `export type Casa = 'acerto' | 'erro' | 'quase'`; `export const FAIXAS = { imune: 'Imune', 'quase-imune': 'Quase imune', 'abre-o-olho': 'Abre o olho', 'caiu-feio': 'Caiu feio' } as const`; `export type Faixa = keyof typeof FAIXAS`; `export function slugDaFaixa(titulo: string): Faixa` (lança se desconhecido); `export const LETRA: Record<Casa, 'a' | 'e' | 'q'>`; `export function casasParaLetras(casas: Casa[]): string`; `export function letrasParaCasas(g: string): Casa[]`; `export const parametrosSchema: z.ZodType<{ a: number; t: 6 | 12; c: number; f: Faixa; g: string }>` (coerção de `a`,`t`,`c` a partir de string; `refine`: `a ≤ t`, `c ≤ t − a`, `g.length === t`, `/^[aeq]+$/`, `g` tem exatamente `a` letras `a`); `export function urlDoCartao(p: { acertos: number; total: number; caiu: number; faixa: Faixa; casas: Casa[] }): string` → `/cartao?a=…&t=…&c=…&f=…&g=…`.
- Produces `src/lib/compartilhar.ts`: `export function gradeDeCasas(casas: Casa[]): string` (✅ ❌ 🤔, linhas de 6 separadas por `\n`); `export function textoDeCompartilhar(p: { acertos: number; total: number; caiu: number; casas: Casa[] }): string` exatamente como a spec §2 (com `DOMINIO` na última linha); `export const NOME_ARQUIVO = 'caiu-nessa-placar.png'`.

- [ ] **Step 1: Testes** — casos: `textoDeCompartilhar` com `caiu: 3` → começa com `Fiz 4/12 no Caiu Nessa? e caí em 3. E você?`, 2 linhas de 6 emojis, última linha `caiunessa.com.br`; `caiu: 0` e `acertos: 12` → `Fiz 12/12 no Caiu Nessa? e não caí em nenhuma. E você?`; 6 casas → uma linha; `gradeDeCasas(['acerto','erro','quase'])` → `✅❌🤔`; `parametrosSchema` aceita `{a:'4',t:'12',c:'3',f:'caiu-feio',g:'aeaaeqeaeeaa'}`→ nota: contar `a`=…; ajustar `g` para ter 4 `a`; rejeita `t: '7'`, `g` com 5 `a` quando `a=4`, `c: '9'` com `a=4,t=12`, `f: 'x'`; `urlDoCartao` monta a query na ordem `a,t,c,f,g`; `slugDaFaixa('Abre o olho')` → `abre-o-olho`, desconhecido lança; `letrasParaCasas(casasParaLetras(x))` é identidade.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: Testes + lint + typecheck** → PASS.
- [ ] **Step 5: Commit** — `feat(compartilhar): texto de compartilhar, grade de casas e parâmetros do cartão`.

---

### Task 3: Rota do cartão dos stories

**Files:**
- Create: `src/app/cartao/route.tsx`, `src/app/_imagens/Cartao.tsx`
- Test: `tests/app/cartao.test.ts`

**Interfaces:**
- Consumes: `parametrosSchema`, `letrasParaCasas`, `FAIXAS` (Task 2); `carregarFontes`, `fontesParaImagem`, `CarimboImagem` (Task 1).
- Produces `src/app/cartao/route.tsx`: `export const runtime = 'nodejs'`; `export async function GET(req: Request): Promise<Response>` → 400 `new Response('Parâmetros inválidos', { status: 400 })` quando o schema rejeita; senão `new ImageResponse(<Cartao …/>, { width: 1080, height: 1920, fonts, headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } })`.
- Produces `src/app/_imagens/Cartao.tsx`: `export function Cartao(p: { acertos: number; total: number; caiu: number; faixa: string; casas: Casa[] })` com a composição da spec §3 (margens 220/300, ficha, carimbo 160, `PLACAR`, número 300 px com sombra em camadas, faixa carimbada −3°, grade de casas 120 px em linhas de 6, frase do caiu, rodapé).

- [ ] **Step 1: Testes** — `GET(new Request('http://x/cartao?a=4&t=12&c=3&f=caiu-feio&g=…'))` → 200, `image/png`, IHDR 1080×1920, `cache-control` exato; `t=7` → 400; `g` com contagem errada → 400; `t=6` com `g` de 6 → 200. Salvar um PNG de exemplo (12 casas, faixa `caiu-feio`) em `.superpowers/sdd/<workspace>/cartao.png` para o controlador.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: Testes + lint + typecheck** → PASS.
- [ ] **Step 5: Commit** — `feat(compartilhar): rota /cartao gera a imagem 1080×1920 do placar para os stories`.

---

### Task 4: Botão "Compartilhar placar" na tela de placar

**Files:**
- Modify: `src/components/ResultadoFinal.tsx`, `src/components/Quiz.tsx`
- Create: `src/lib/compartilhar-navegador.ts`
- Test: `tests/components/ResultadoFinal.test.tsx` (novo), `tests/app/afirmacoes.test.tsx` (bloco ResultadoFinal), `tests/components/Partida.test.tsx`, `tests/components/Quiz.test.tsx`

**Interfaces:**
- Consumes: `textoDeCompartilhar`, `NOME_ARQUIVO` (Task 2), `urlDoCartao`, `slugDaFaixa`, `Casa` (Task 2), `SITE_URL`, `TITULO` (Task 1), `ehQuase` (`src/lib/pontuacao.ts`).
- Produces `src/lib/compartilhar-navegador.ts`: `export type Desfecho = 'folha' | 'copiado' | 'falhou' | 'cancelado'`; `export async function compartilhar(p: { texto: string; url: string; titulo: string; arquivo: File | null; nav?: Navigator }): Promise<Desfecho>` — ordem exata da spec §2 passos 2–4; `AbortError` → `'cancelado'`; `export async function buscarArquivo(url: string, nome: string, fetchFn?: typeof fetch): Promise<File | null>` (`null` em qualquer falha).
- Produces (`ResultadoFinal` props): `+ casas: Casa[]`. Ao montar: `useEffect` chama `buscarArquivo(urlDoCartao(...), NOME_ARQUIVO)` e guarda em estado. Botões: `Compartilhar placar` (`BOTAO_PRIMARIO`, `aria-busy` nunca necessário: nada espera), `Continuar jogando` (`BOTAO_SECUNDARIO`), link `Jogar de novo` (`<a href="/quiz">` com `LINK_PAGINA`, ao lado dos outros dois links); abaixo do botão de compartilhar, `<a download={NOME_ARQUIVO} href={urlDoCartao(...)}>Baixar imagem para os stories</a>` (`LINK_PAGINA`); área `<p aria-live="polite">` que mostra `Texto copiado` (2 s) ou `Não deu para copiar`. A linha `Acertei … caiunessa.com.br` sai.
- Produces (`Quiz`): passa `casas={ordem.map(a => respostas[a.id] === a.veredito ? 'acerto' : ehQuase(a.veredito, respostas[a.id]) ? 'quase' : 'erro')}`; `caiu` = `resultado.acreditadasEsquerda + resultado.acreditadasDireita` (calculado em `ResultadoFinal` a partir de `dados.resultado`).

- [ ] **Step 1: Testes** — `tests/components/ResultadoFinal.test.tsx` com `vi.stubGlobal('navigator', …)` e `vi.stubGlobal('fetch', …)`:
  - arquivo pré-buscado e `canShare({files})` true → clique chama `share` com `files: [File]`, `text`, `title`;
  - `fetch` ainda pendente (promessa nunca resolve) e `share` existe → clique chama `share({ text, url: SITE_URL, title })` imediatamente, sem `files`;
  - `share` rejeita com `DOMException('…', 'AbortError')` → nada no `aria-live`;
  - `share` rejeita com outro erro → `clipboard.writeText(texto)` chamado e `Texto copiado` visível;
  - sem `share` → clipboard + `Texto copiado`; clipboard rejeita → `Não deu para copiar`;
  - link `Baixar imagem para os stories` tem `download` e `href` começando com `/cartao?a=`;
  - texto compartilhado contém a grade das `casas` passadas.
  Atualizar: `Partida.test.tsx:114` e `afirmacoes.test.tsx:130` (a linha `Acertei…` sai; checar o botão `Compartilhar placar` e o link `Jogar de novo` continua `link`); todo `render(<ResultadoFinal …/>)` ganha `casas`. `Quiz.test.tsx`: no caso de resultado, `screen.getByRole('button', { name: 'Compartilhar placar' })`.
- [ ] **Step 2: Ver falhar.** — [ ] **Step 3: Implementar.** — [ ] **Step 4: `npm run lint && npm run typecheck && npm test`** → PASS.
- [ ] **Step 5: Commit** — `feat(compartilhar): botão Compartilhar placar com imagem dos stories, texto e fallback de copiar`.

---

### Task 5: Verificação completa (controlador)
- [ ] `npm run build` verde; dev server: `curl -sI 'http://localhost:3000/cartao?…'` → `image/png` + cache header; `curl -s http://localhost:3000/ | grep -o '<meta property="og:[^>]*>'` mostra `og:image` absoluta; abrir `og.png` e `cartao.png` e conferir a olho; na tela de placar ao vivo (Chrome), clicar `Compartilhar placar` num ambiente sem `share` → `Texto copiado`; link de download aponta para o PNG.
