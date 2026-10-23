# Ícones de fundo e som da urna (design)

Data: 2026-10-22, noite. Pedido do autor: "adicionar alguns ícones em locais específicos, como no fundo, de coisas que lembrem as eleições brasileiras: urna eletrônica, político (homem de terno), algo que lembre a praça dos 3 poderes [foto do Congresso], tudo no mesmo estilo letreiro/arcade; e também dar o som da urna eletrônica quando a pessoa acaba (pode ficar chato se for sempre, mas no final seria legal)". O autor dispensou perguntas ("faça 2"); as escolhas de como fazer estão aqui como decisão do controlador. Revisado por um construtor antes da entrega; as três observações dele (momento do som, cor da urna na ficha, ficha compartilhada) estão resolvidas no texto como decisão do controlador.

## Intenção
Dar ao jogo mais sabor de eleição brasileira sem perder a neutralidade: três ícones em traço de tinta, no estilo dos letreiros, e o bipe de "fim" da urna eletrônica quando a pessoa termina a rodada. A urna é o objeto mais reconhecível da eleição no Brasil e não pertence a nenhum lado.

## Objetivos
- Um ícone por tela, em lugar fixo, sempre atrás ou ao lado do conteúdo, nunca sobre texto: **Congresso** (duas torres, cúpula e concha sobre a plataforma) na tela de início; **urna eletrônica** na tela do jogo; **político de terno** (silhueta de perfil, sem rosto) na tela de placar.
- Os três no mesmo traço: contorno grosso de tinta, cantos retos, sem preenchimento, como os ícones dos botões; em marca-d'água (baixa opacidade) quando ficam atrás do conteúdo.
- Ao terminar a rodada (toque em "Ver meu resultado"), tocar a sequência de bipes do "fim" da urna, curta, sintetizada no navegador; nunca durante as respostas.
- Botão de som na tela de início, lembrado no aparelho; ligado por padrão.

## Não objetivos
- Ícones em cada cartão, no painel de veredito ou nas páginas de texto.
- Som em qualquer outro momento (resposta, erro, botão), vibração, música.
- Arquivo de áudio; o som é gerado com Web Audio.
- Mudar a imagem dos stories ou a prévia do link.

## Anti-objetivos
- Qualquer coisa que leia como campanha: rosto reconhecível, bandeira, estrela, número de partido, verde-amarelo, vermelho.
- Caricatura do político (barriga, charuto, mala de dinheiro): é uma silhueta neutra de terno e gravata.
- Som alto, longo ou repetido; som que toque sem gesto do usuário (os navegadores bloqueiam, e assusta).
- Ícone que atrapalhe a leitura (contraste do texto cai) ou o gesto (captura o toque).

## Restrições
- Stack atual, sem dependência nova. Ícones como SVG inline em componentes React (`src/components/icones/`), `aria-hidden`, `pointer-events-none`, `fill="none"`, `stroke="currentColor"`, `strokeWidth` 3 a 3,5 numa `viewBox` de 64×64, pontas e junções retas (`square`/`miter`), como `IconeVeredito`.
- Cores: só tinta (claro) e papel (escuro), pela classe `text-tinta dark:text-papel`; marca-d'água com `opacity-[0.07]` no claro e `dark:opacity-[0.12]`.
- Som: `AudioContext` criado só dentro do gesto do usuário (o toque em "Ver meu resultado"); `OscillatorNode` tipo `square` com `GainNode` (ganho 0,08, rampa de 10 ms para não estalar); sequência de quatro notas aproximando o "fim" da urna: 1046 Hz, 1318 Hz, 1568 Hz por 90 ms cada com 30 ms de silêncio, e 2093 Hz por 350 ms; total ≈ 0,7 s. Qualquer erro (sem Web Audio, contexto bloqueado) é silencioso.
- Preferência de som em `localStorage` chave `caiu-nessa:som` com valores `'ligado'` | `'desligado'`; ausência ou erro de acesso = ligado.
- Testes: Vitest + Testing Library; o `AudioContext` é simulado nos testes (fábrica injetável).

## O que foi decidido (como)

### Ícones
- `src/components/icones/Urna.tsx`, `Politico.tsx`, `Congresso.tsx`: cada um exporta um componente `({ className?: string })` que desenha o SVG (64×64) e aceita classes de tamanho/cor. Desenho:
  - **Urna**: caixa vista de frente com a tampa chanfrada (trapézio em cima), tela retangular à esquerda, teclado 3×4 de quadradinhos à direita, uma fileira de três teclas maiores embaixo (BRANCO, CORRIGE, CONFIRMA, só como retângulos), e um pé. Nada de texto.
  - **Político**: silhueta de perfil do ombro para cima: cabeça (sem traços de rosto, só o contorno), pescoço, gola do paletó em V, nó de gravata, lapela. Contorno só.
  - **Congresso**: plataforma horizontal larga embaixo; ao centro, as duas torres gêmeas altas e estreitas, ligadas no meio por uma passarela; à esquerda a cúpula (semicírculo para cima) sobre a plataforma; à direita a concha (semicírculo para baixo, aberto para cima). Como na foto da Praça dos Três Poderes.
- Onde entram:
  - **Início**: `Congresso` como marca-d'água, `fixed` no rodapé da viewport, centralizado, largura `min(90vw, 480px)`, `z-index` abaixo do conteúdo. O `main` fica `relative z-10`.
  - **Jogo**: `Urna` a 18 px dentro da `Ficha`, à esquerda do rótulo `Ficha 01/12` (sem opacidade, é um ícone de interface, decorativo). A `Ficha` ganha uma prop opcional `icone?: ReactNode`, que só a tela do jogo passa; início, "Calculando…" e placar continuam sem ícone. Dentro da ficha a urna herda `currentColor` (tinta nos dois temas, porque a ficha é papel nos dois temas); a regra `text-tinta dark:text-papel` vale só para as marcas-d'água sobre o fundo da página. Em rodada extra a 320 px, se `Rodada 2 · Ficha 01/06` + ícone + `Placar 00` não couber numa linha, o ícone some (`hidden min-[360px]:inline-block`), não o texto. *(Decisão do controlador, após a revisão do construtor: a tela do jogo quase não tem fundo visível; uma marca-d'água atrás do cartão não apareceria no celular.)*
  - **Placar**: `Politico` como marca-d'água, `fixed` no canto inferior direito, 220 px, atrás do conteúdo; a tela de placar rola, a marca fica parada.
- As marcas-d'água e o ícone da ficha são `aria-hidden` e `pointer-events-none`; nunca entram na árvore acessível nem nos testes de nome acessível.

### Som
- `src/lib/som-urna.ts`: `export function somLigado(armazem?: Storage): boolean`; `export function definirSom(ligado: boolean, armazem?: Storage): void`; `export function tocarSomDaUrna(criarContexto?: () => AudioContext): void` (síncrona; cria o contexto, agenda as quatro notas com `start`/`stop` no relógio do contexto, fecha o contexto depois da última nota com `setTimeout`; engole qualquer exceção).
- `src/components/BotaoSom.tsx` (client): botão na tela de início, abaixo das dicas de gesto, estilo link (`LINK_PAGINA`), texto `Som da urna: ligado` / `Som da urna: desligado`, `aria-pressed`, alterna e grava. Lê a preferência no `useEffect` (não no render, para não divergir da hidratação); até ler, mostra "ligado".
- `Quiz.fechar()`: quando `ultima` e `somLigado()`, chama `tocarSomDaUrna()` **no início de `fechar()`**, antes de qualquer `setTimeout` (`depois()` atrasa o `enviar` em 300 ms fora do gesto, e o iOS bloquearia o `AudioContext`). *(Decisão do controlador, após a revisão do construtor.)*

### Textos novos
`Som da urna: ligado`, `Som da urna: desligado`.

## Deixado para quem constrói
- Os caminhos exatos dos três SVGs (manter o traço e a `viewBox` acima; olhar o resultado no navegador).
- Como simular `AudioContext` nos testes (fábrica injetável já prevista).
- Se o `BotaoSom` precisa de `suppressHydrationWarning` ou de um estado "lendo".

## Critério de pronto
Os três ícones visíveis nas três telas, nos dois temas, a 320 e 390 px, sem cobrir texto nem capturar toque; o som toca uma vez ao tocar em "Ver meu resultado" com a preferência ligada e não toca com ela desligada (teste com `AudioContext` simulado: quatro osciladores nas frequências e durações acima); o botão alterna e persiste; `npm run lint`, `typecheck`, `test` e `build` verdes.
