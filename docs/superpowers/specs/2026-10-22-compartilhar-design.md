# Compartilhar: prévia do link, botão de compartilhar e cartão para os stories (design)

Data: 2026-10-22, noite. Pedido do autor depois do redesign Letreiro: "Foca em 1 e 2 [prévia do link no WhatsApp; botão de compartilhar de verdade], algo para compartilhar nos stories do Instagram". O autor dispensou perguntas; as escolhas de como fazer estão aqui como decisão do controlador. Revisado por um construtor antes da entrega; as quatro dúvidas dele (buscar a imagem antes do toque, carregamento das fontes, desktop com suporte a arquivos, cache da imagem) estão resolvidas no texto como decisão do controlador.

## Intenção
O jogo vai circular por WhatsApp e Instagram entre amigos. Hoje o link chega "pelado" (sem título nem imagem de prévia) e o resultado só oferece uma linha de texto para copiar. Três peças resolvem isso: a prévia do link (Open Graph), um botão de compartilhar que abre a folha do sistema com um texto que desafia, e uma imagem vertical no estilo Letreiro, feita para os stories, que vai junto no compartilhamento.

## Objetivos
- Qualquer link do site (início, /quiz, páginas de texto) mostra título, descrição e uma imagem 1200×630 no WhatsApp, Telegram, Instagram DM, X e iMessage.
- Na tela de placar, um toque em **Compartilhar placar** abre a folha de compartilhamento do aparelho com a imagem dos stories (1080×1920) e o texto; no desktop, ou sem suporte, copia o texto e oferece a imagem para baixar.
- A imagem dos stories mostra o placar sem revelar nenhuma afirmação: só números, a faixa (Imune / Quase imune / Abre o olho / Caiu feio) e a grade de acertos e erros na ordem em que a pessoa jogou (a ordem é sorteada, então não é spoiler).
- Tudo no sistema visual Letreiro: papel, tinta, carimbo, Bungee e Atkinson.

## Não objetivos
- Login, histórico, ranking entre amigos, link com o placar embutido (o link compartilhado é sempre a home).
- Lembrete de precisão antes de compartilhar (fica para depois).
- Vídeo ou animação para stories.
- Compartilhar a partir do painel de veredito ou de uma afirmação isolada.

## Anti-objetivos
- A imagem ou o texto revelarem afirmações, autores ou lados.
- Cores de partido na imagem (vale a paleta Letreiro: tinta, papel, azul/magenta/laranja só se necessário; o cartão dos stories usa só tinta e papel).
- Um botão que "não faz nada" em algum navegador: sempre há um caminho (folha do sistema, ou copiar + baixar).
- Fontes buscadas em tempo de execução de um host externo.

## Restrições
- Stack atual, sem dependência nova. Imagens geradas com `ImageResponse` de `next/og` (já no Next 16), em rotas Node.
- Fontes para as imagens: `Bungee-Regular.ttf` e `AtkinsonHyperlegible-Bold.ttf` (OFL; licenças ao lado) em `src/app/fontes/`, lidas com `readFile(join(process.cwd(), 'src/app/fontes', nome))` nas rotas Node (o padrão do Next para Node; o rastreio de arquivos do build segue `process.cwd()` + caminho literal). Se o deploy na Vercel não incluir os `.ttf` (verificar com `curl` na imagem em produção), acrescentar `outputFileTracingIncludes` em `next.config.ts` num commit à parte. O site continua usando `next/font/google`. *(Decisão do controlador.)*
- `next/og` (satori) só aceita um subconjunto de CSS: flex (sem grid), sem `repeating-linear-gradient` garantido, SVG inline permitido. A hachura do papel fica de fora das imagens; o carimbo do logo entra como SVG inline (os mesmos caminhos de `Carimbo.tsx`).
- A URL pública é `https://caiunessa.com.br` (constante `SITE_URL` em `src/lib/site.ts`, sobreposta por `NEXT_PUBLIC_SITE_URL` quando definida). Enquanto o DNS não propaga, a prévia e o texto apontam para o domínio final mesmo assim: é o que vai nos stories.
- Testes: Vitest + Testing Library. `navigator.share`, `navigator.canShare`, `navigator.clipboard` e `fetch` são simulados nos testes do botão. Se `ImageResponse` não rodar no Vitest (wasm), as rotas têm teste só da validação e da montagem dos parâmetros, e a renderização é verificada no `next build` + `curl` no dev server, documentado no PR.

## O que foi decidido (como)

### 1. Prévia do link (Open Graph)
- A descrição do site passa a `12 afirmações da eleição. Verdade, mentira ou cheira mal? Descubra em quantas você caiu.` (o botão agora se chama "Cheira mal"); vale para `metadata.description`, `openGraph`, `twitter` e o `alt` da imagem.
- `src/app/layout.tsx` `metadata`: `metadataBase: new URL(SITE_URL)`, `openGraph: { title: 'Caiu Nessa?', description, url: '/', siteName: 'Caiu Nessa?', locale: 'pt_BR', type: 'website' }`, `twitter: { card: 'summary_large_image', title, description }`. As páginas de texto mantêm seus `title` próprios e herdam o resto.
- `src/app/opengraph-image.tsx` (aplica a todas as rotas): 1200×630, `alt: 'Caiu Nessa? 12 afirmações da eleição. Verdade, mentira ou cheira mal?'`, `contentType: 'image/png'`. Composição: fundo papel `#fff3dc`, moldura tinta `#1b1540` de 12 px com sombra dura (um segundo retângulo deslocado 16 px), à esquerda o carimbo do logo em tinta (~300 px), à direita `CAIU NESSA?` em Bungee ~132 px em duas linhas e, abaixo, `12 afirmações da eleição. Verdade, mentira ou cheira mal?` em Atkinson Bold 40 px; no rodapé uma faixa papel-escuro `#ffe8b5` com `INSIRA A FICHA · caiunessa.com.br` em Bungee 32 px. Estática (`export const dynamic = 'force-static'`).

### 2. Botão de compartilhar
- Na tela de placar os botões passam a ser: **Compartilhar placar** (primário, tinta), **Continuar jogando** (fantasma), e `Jogar de novo` vira link sublinhado ao lado dos outros dois links. A linha `Acertei X de Y no Caiu Nessa? caiunessa.com.br` sai (o texto agora vai pelo botão).
- Texto compartilhado (função pura `textoDeCompartilhar` em `src/lib/compartilhar.ts`):
  ```
  Fiz 4/12 no Caiu Nessa? e caí em 3. E você?
  ✅❌✅✅❌🤔
  ❌✅❌❌✅✅
  caiunessa.com.br
  ```
  `caí em N` = afirmações falsas ou enganosas em que a pessoa acreditou (`acreditadasEsquerda + acreditadasDireita`). A grade tem uma casa por afirmação na ordem jogada, 6 por linha: ✅ acerto, ❌ erro, 🤔 "quase" (confundiu mentira com enganoso ou o contrário). Quando `caí em 0`: `Fiz 12/12 no Caiu Nessa? e não caí em nenhuma. E você?`. Em rodada extra, os números são da rodada corrente (não da partida), e a grade tem 6 casas numa linha.
- Para montar a grade, `Quiz` passa a `ResultadoFinal` a lista `casas: ('acerto' | 'erro' | 'quase')[]` na ordem de `ordem`, calculada com `ehQuase` de `src/lib/pontuacao.ts`.
- Fluxo do botão (`src/lib/compartilhar.ts` + `ResultadoFinal`):
  1. **Ao montar a tela de placar** (não no toque): monta a URL da imagem dos stories (abaixo) e o texto, e já busca a imagem (`fetch`) guardando o `File('caiu-nessa-placar.png', 'image/png')` em estado. Motivo: iOS Safari e Chrome só aceitam `share()` e `clipboard.writeText()` enquanto o toque é "fresco"; esperar um `fetch` depois do toque faz o `share` falhar com `NotAllowedError`. *(Decisão do controlador, após a revisão do construtor.)*
  2. No toque, direto da ação do usuário: se `navigator.canShare` existe, aceita `{ files }` e a imagem já chegou → `navigator.share({ files, text, title: 'Caiu Nessa?' })`. No celular é isso que leva aos stories (Instagram aparece na folha; o usuário escolhe "Stories").
  3. Senão, se `navigator.share` existe (inclusive quando a imagem ainda não chegou ou a busca falhou) → `navigator.share({ text, url: SITE_URL, title })`, sem esperar nada.
  4. Senão → `navigator.clipboard.writeText(texto)` e o botão mostra `Texto copiado` por 2 s (`aria-live="polite"`).
  - `AbortError` (a pessoa fechou a folha) é silencioso. Qualquer outra falha do `share` cai para o passo 4; falha do clipboard mostra `Não deu para copiar` (mesma área `aria-live`).
  - Detecção por recurso, não por aparelho: um desktop cujo navegador aceita arquivos recebe a folha do sistema como o celular.
- O link **Baixar imagem para os stories** (`<a download="caiu-nessa-placar.png">` para a URL da imagem) aparece sempre abaixo do botão, em todos os aparelhos: é o caminho de quem quer salvar a imagem sem compartilhar na hora.

### 3. Cartão dos stories (1080×1920)
- Rota `src/app/cartao/route.tsx`, `GET /cartao?a=4&t=12&c=3&f=caiu-feio&g=aeaqeeaeeqea` → PNG 1080×1920 via `ImageResponse`, `Cache-Control: public, max-age=86400, s-maxage=604800` (um dia no navegador, uma semana na CDN: a imagem é função pura dos parâmetros, mas o desenho pode mudar em ajustes futuros; sem `immutable`). Parâmetros validados com Zod: `t` ∈ {6, 12}; `a` inteiro 0..t; `c` inteiro 0..t; `f` ∈ {`imune`, `quase-imune`, `abre-o-olho`, `caiu-feio`} (slug da faixa; o rótulo exibido vem de uma tabela); `g` ∈ `[aeq]{t}` com exatamente `a` letras `a`; `c` ≤ número de `e` em `g` (quem caiu errou, e errar o grau não é cair). Inválido → 400 com corpo de texto curto. Sem banco, sem rate limit (barata e cacheada).
- Composição (papel `#fff3dc`, tinta `#1b1540`, papel-escuro `#ffe8b5`; margens de segurança de 220 px no topo e 300 px na base, onde o Instagram desenha a interface):
  1. Faixa (ficha) `FIM DE JOGO` à esquerda e `CAIU NESSA?` à direita, Bungee 36 px, fundo papel-escuro, borda tinta 6 px, sombra dura.
  2. Carimbo do logo em tinta, 160 px.
  3. `PLACAR` Bungee 40 px; o número `4/12` Bungee 300 px com sombra em camadas (papel-escuro 10 px, tinta 16 px); a faixa (`CAIU FEIO`) num carimbo tinta Bungee 56 px, borda 8 px, −3°.
  4. A grade: `t` casas de 120 px em linhas de 6, borda tinta 6 px: acerto = tinta cheia; erro = branca com um X tinta (SVG inline); quase = branca com `?` Bungee tinta.
  5. `Caí em 3 das falsas ou enganosas.` (ou `Não caí em nenhuma.`) Atkinson Bold 44 px.
  6. Rodapé: `E você? caiunessa.com.br` Bungee 44 px numa faixa tinta com texto papel.
- Nada de afirmação, autor, lado ou data.

### 4. Textos novos
`Compartilhar placar`, `Preparando…`, `Texto copiado`, `Baixar imagem para os stories`, o texto compartilhado acima, `INSIRA A FICHA · caiunessa.com.br`, `E você? caiunessa.com.br`, `Caí em N das falsas ou enganosas.` / `Não caí em nenhuma.`.

## Deixado para quem constrói
- Organização interna de `src/lib/compartilhar.ts` (montagem da URL do cartão, do texto, do fluxo de share) e dos componentes das duas imagens (podem dividir um `src/app/_imagens/` com o carimbo SVG e o carregador de fontes).
- Tamanhos e espaçamentos finais das duas imagens (ajustar olhando o PNG gerado); o `?` e o X dentro das casas.
- Como simular `navigator.share` nos testes e como testar o `<a download>`.

## Critério de pronto
`curl -I` nas duas imagens no dev server devolve `image/png` com os tamanhos certos (verificar o IHDR); a home renderizada tem as tags `og:*` e `twitter:*` com URL absoluta da imagem; na tela de placar, com `navigator.share` simulado, o botão chama `share` com `files` quando `canShare` aceita arquivos, com `text + url` quando não, e copia + mostra o link quando `share` não existe; `textoDeCompartilhar` coberto para 0 caiu, N caiu, 12 e 6 casas; lint, typecheck, testes e build verdes; as duas imagens conferidas a olho (PNG gerado aberto no navegador).
