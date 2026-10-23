# Desktop "Balcão": layout para telas largas (2026-10-23)

## Intenção

O Julio quer que o jogo fique melhor em notebook e desktop ("quando as pessoas abrem no laptop/computador, uma experiência mais compatível com o browser"), **sem mudar nada no celular**. Depois de uma auditoria (`docs/superpowers/notes/2026-10-23-desktop-auditoria.md`) e de dois mockups, ele escolheu a **Direção 1, "Balcão"** (mockup publicado em https://claude.ai/artifact/6kvtWyDcmktrPhFFsQWBwM, arquivo `direcao-1.html`).

O que a auditoria achou a 1280×800: colunas de 448 px (home) e 640 px (resto) sem nenhum `lg:`; o cartão estica a tela inteira com tipo de 24 px; botões de 207×56 px com rótulo de 11 px; as setas do teclado funcionam mas só aparecem em `sr-only`; o veredito é um bottom sheet com véu que tapa a afirmação enquanto se lê a explicação, com uma alça inútil para mouse; o resultado não mostra quais afirmações a pessoa errou.

## Goals

- A partir de **`lg` (1024 px)**: home em duas colunas com prévia do cartão; quiz com o cartão à esquerda e o veredito num painel lateral à direita, sem véu e sem alça; teclas visíveis; resultado em duas colunas com a lista "Suas respostas".
- Abaixo de `lg` tudo fica **idêntico**, com uma exceção pedida pelo Julio: a lista "Suas respostas" recolhida no fim da tela de placar. Fora isso, mesma árvore de componentes, só classes `lg:`; nenhuma mudança de comportamento em toque.
- Tema noite continua funcionando em tudo que mudar.
- Testes: os unitários continuam valendo (o DOM é o mesmo nos dois tamanhos), mais um bloco Playwright a 1280×800.

## Non-goals

- Tablet (`md`) não ganha layout próprio: abaixo de `lg` é o mobile.
- `/como-escolhemos` e `/r/[codigo]` não mudam (texto a 640 px lê bem). `/afirmacoes` só ganha grade de duas colunas em `lg`.
- Nada de novo no conteúdo compartilhado (imagens, textos).

## Anti-goals

- Quebrar o celular: qualquer regressão visual abaixo de 1024 px é falha.
- Spoiler na home: a prévia do cartão não usa afirmação do jogo.
- Perder a acessibilidade de hoje: foco, `aria-live`, rótulos e a navegação por teclado continuam como estão.

## Telas (≥ lg)

**Home (`src/app/page.tsx`).** Grade de 2 colunas (`lg:grid lg:grid-cols-2 lg:gap-16`, `lg:max-w-5xl`, `lg:px-24`), alinhada ao centro vertical. Esquerda: Ficha (largura máxima 420 px), título em Bungee Shade maior (`lg:text-[76px] lg:leading-[0.95]`), texto-guia 21 px / 30ch, linha com **Começar** (260 px, com `<kbd>Enter</kbd>` à direita do rótulo) e o link "Como escolhemos as afirmações" ao lado; abaixo, legenda com `<kbd>←</kbd> Mentira`, `<kbd>↑</kbd> Cheira mal`, `<kbd>→</kbd> Verdade` nas cores dos vereditos e "ou arraste com o mouse"; depois o BotaoSom. A dica "Arraste o cartão ou toque" some em `lg` (`lg:hidden`), a legenda só aparece em `lg`. Direita (`hidden lg:block`): prévia decorativa (`aria-hidden`): dois cartões em pilha (o de trás rotacionado 4°, o da frente −3°), o "?" de papel, a frase **"Ninguém cai em fake news."** com o carimbo **Cheira mal**, e os três botões de resposta desenhados (sem ação). Enter inicia: um componente cliente pequeno dá foco ao link Começar ao montar quando `matchMedia('(min-width: 1024px)')` casa; o Enter então segue o link.

**Quiz (`Quiz.tsx`, `PilhaDeCartoes.tsx`, `CartaoAfirmacao.tsx`, `PainelVeredito.tsx`, `quiz/page.tsx`).** Container `lg:max-w-6xl lg:px-12`. Grade `lg:grid lg:grid-cols-[1fr_420px] lg:gap-x-10 lg:gap-y-3` com três linhas: topo (Ficha na coluna da esquerda, CarimbosDeProgresso na da direita, alinhados ao centro), e as duas colunas ocupando o resto da altura. Coluna esquerda: a pilha de cartões (`flex-1 min-h-0`, cartão com `lg:p-12`, texto até 32 px em `lg`: `tamanhoDoTexto` ganha uma escala `lg` com os mesmos degraus, cada um 8 px maior) e, embaixo, os três botões de resposta em linha (`lg:h-[68px] lg:flex-row lg:gap-3 lg:text-sm`, com `<kbd>` da seta antes do rótulo, `hidden lg:inline-flex`). Coluna direita: antes da resposta, a **caixa de dicas** (`hidden lg:flex`, superfície branca): legenda das teclas e "arraste com o mouse"; depois da resposta, o **painel do veredito** no lugar dela. O `PainelVeredito` passa a ter `lg:static lg:max-h-none lg:w-auto lg:max-w-none lg:translate-x-0` em vez de `fixed bottom-0`, a alça `lg:hidden`, o véu `lg:hidden`, borda e sombra na cor do veredito (como no mockup), botão **Próxima** com `<kbd>Enter</kbd>` e `mt-auto`. A entrada em `lg` é um deslizamento da direita (`lg:animate-...`), respeitando `motion-reduce`. Foco: igual a hoje (vai para Próxima; preso no painel enquanto aberto). O `data-conteudo-painel` continua rolável.

**Resultado (`ResultadoFinal.tsx`).** `lg:grid lg:grid-cols-2 lg:gap-14 lg:max-w-5xl lg:text-left`. Esquerda, na ordem de hoje: Ficha; linha com Placar (96 px) e a faixa carimbada lado a lado; texto da avaliação (20 px); viés; caixa de comparação; Compartilhar (linha de ícones alinhada à esquerda); "Continuar jogando" e "Jogar de novo" lado a lado (`lg:flex-row`), o segundo como botão secundário tracejado. Direita (superfície branca): **Suas respostas** com "N de 10" no canto; uma linha por afirmação, na ordem jogada: casa (acerto = cheia, erro = hachurada, quase = "?"), `texto`, selo do veredito nas cores de veredito; embaixo, os links "Como escolhemos" e "Todas as afirmações e fontes". **No celular a lista também existe** (pedido do Julio: "poderíamos trazer isso para a versão mobile"): fica abaixo de "Continuar jogando", como um `<details>` recolhido cujo `<summary>` é "Suas respostas (N de 10)"; em `lg` o `<details>` fica aberto (`open` controlado por `matchMedia`, ou `lg:` escondendo o summary e mostrando o conteúdo) na coluna da direita. É a única mudança de conteúdo abaixo de `lg`. Dados: `ResultadoFinal` ganha a prop `respostas: { id, texto, veredito, casa }[]`, montada no `Quiz` a partir de `ordem` e `respostas` (as mesmas de `casas`); `Partida`/páginas que renderizam `ResultadoFinal` passam o que têm.

**`/afirmacoes`.** `lg:max-w-5xl` e a lista de cada seção em `lg:grid lg:grid-cols-2 lg:gap-4`.

## Testes

- Unitários: continuam; os novos elementos (`kbd`, caixa de dicas, prévia, lista) são testados por presença e conteúdo (o jsdom não aplica media queries). `ResultadoFinal` com `respostas` renderiza a lista na ordem, com casa, texto e selo.
- `tests/app/textos-derivados.test.ts` continua valendo para os novos textos (sem números escritos à mão).
- Playwright: um `describe` com `test.use({ viewport: { width: 1280, height: 800 } })`: no quiz, depois de responder, o texto da afirmação **e** a explicação estão visíveis ao mesmo tempo e não há véu (`[data-backdrop]` não visível); no resultado, "Suas respostas" lista `TOTAL_AFIRMACOES` itens; na home, "Começar" tem o foco.
- Capturas a 1280×800 e 390×844, claro e noite, antes da PR; as de 390 comparadas com as de hoje (o mobile só pode mudar pela seção recolhida no placar).

## Deixado ao construtor

Nomes de classes e componentes novos (`PreviaDoCartao`, `CaixaDeDicas`, `SuasRespostas`, `Tecla`), a animação exata de entrada do painel, o tamanho dos degraus da escala `lg` do texto, e como a `/afirmacoes` divide a grade.

## Decisões do controlador (builder-check)

1. **Onde o painel vive.** O `PainelVeredito` deixa de ser um portal em `document.body` e passa a ser irmão de `data-conteudo` dentro da raiz do `Quiz` (fora do `div` com filtro, porque um ancestral com `filter` quebra o `fixed`). No celular continua `fixed bottom-0`, mesmo visual; em `lg` vira `static` na célula da direita. O bloqueio de scroll do `body` e o foco preso continuam.
2. **Coluna da direita nunca fica vazia.** A caixa de dicas aparece sempre que o painel não está aberto (inclusive em `respondendo` e `saindo`); no celular ela é `hidden`.
3. **Escurecimento e `inert`.** O `inert` em `data-conteudo` continua em todos os tamanhos (o cartão não é interativo com o painel aberto). O filtro de escurecimento sai em `lg` (`lg:filter-none`): o objetivo é ler os dois ao mesmo tempo.
4. **Semântica.** `role="dialog"`, `aria-modal` e o foco preso continuam iguais em todos os tamanhos: com o painel aberto, ele é a única coisa interativa.
5. **Véu e alça.** `data-backdrop` e a alça ganham `lg:hidden`; o clique fora para fechar continua valendo no celular, e os testes atuais seguem.
6. **Altura.** A raiz continua `h-dvh`; em `lg` a grade preenche a altura, o cartão usa `flex-1 min-h-0` e só o conteúdo do painel rola.
7. **`respostas` é opcional** em `ResultadoFinal` (padrão `[]`: a seção não aparece), para quem renderiza sem jogo.
