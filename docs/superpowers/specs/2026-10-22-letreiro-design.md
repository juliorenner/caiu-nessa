# Caiu Nessa? v3 — visual "Letreiro" (design)

Data: 2026-10-22. Decidido com o autor na conversa de design. Mockups das duas direções consideradas em `docs/superpowers/mockups/2026-10-22-letreiro/direcao-visual.html`; o autor escolheu a 2 ("gostei da opção 2, letreiro"). Pesquisa que embasa as escolhas em `docs/superpowers/notes/2026-10-22-arcade-ux-pesquisa.md`. Revisado por um construtor antes da entrega; as quatro dúvidas dele (placar em rodadas extras, tema escuro fora das superfícies, gerador do ícone, `12 DE 12`) estão resolvidas no texto e marcadas como decisão do controlador. O autor aprovou a direção e pediu a entrega ("ship the redesign with the design we agreed on").

## Intenção
O jogo funciona, mas a tela não convida: o cartão flutua num vazio em celulares altos, e a paleta verde/vermelho/âmbar é genérica e, pior, lembra cores de partido (vermelho = PT; verde e amarelo = o outro campo). O autor quer uma cara de **fliperama com sabor brasileiro**. A direção escolhida, "Letreiro", pega o letreiro pintado à mão e o cartaz de rua (papel quente, contorno preto grosso, sombra deslocada, letras de letreiro) e usa o **carimbo** do logo como gesto da marca: o veredito é carimbado em cima do cartão. O placar vira uma ficha de fliperama.

## Objetivos
- Ocupar a tela do celular em três zonas (ficha em cima, cartão no meio, painel de botões embaixo), sem espaço morto em telas altas e sem rolagem.
- Trocar as três cores de veredito por azul (Verdade), magenta (Mentira) e laranja (Cheira mal), cada uma sempre acompanhada de ícone e palavra; nenhuma cor de partido em lugar nenhum, inclusive no logo.
- Um só sistema visual em todas as telas: início, jogo, veredito, placar, `/afirmacoes`, `/como-escolhemos`, estados de erro e carregamento.
- Manter tudo que a v2 garante: gestos e botões equivalentes, painel de veredito obrigatório, neutralidade, acessibilidade (contraste AA, foco visível, movimento reduzido), dois temas.

## Não objetivos
- Mudar regras, dados, API, rodadas ou pontuação. É só interface e cópia de interface.
- Compartilhamento (botão/cartão de compartilhar). Fica para o ticket de engajamento.
- Sons, vibração, confete, mascote, vidas, sequência ("streak").
- Botão de tema: o tema segue o aparelho, como hoje.
- Imagem Open Graph e wordmark para redes.

## Anti-objetivos
- Parecer campanha: bandeira, verde-amarelo, vermelho de destaque, estrela, qualquer marca de programa de TV ou de time.
- Fonte de letreiro em texto corrido: afirmação, citação, explicação e mensagens longas ficam numa sans legível.
- Efeitos que atrapalham a leitura no sol: scanlines, brilho neon, texto com glow, animação em loop.
- Zombar de quem erra. Os textos de resultado continuam os de hoje.
- Quebrar o que já funciona: um gesto que deixe de registrar, um painel que dê para pular, uma tela que role na horizontal.

## Restrições
- Stack atual: Next.js 16 App Router, React 19, TypeScript 7, Tailwind 4. **Sem dependência nova de runtime.** Fontes via `next/font/google` (self-hosted no build, `display: swap`), subconjuntos `latin` e `latin-ext` para cobrir ã õ ç á é í ó ú â ê ô à.
- Largura alvo 320–430 px, coluna única; a tela do jogo cabe em 320×568 sem rolagem; botões ≥ 48 px de altura; texto de leitura ≥ 16 px; contraste ≥ 4,5:1 para texto e ≥ 3:1 para bordas e ícones, nos dois temas.
- `prefers-reduced-motion: reduce` desliga toda animação não essencial (as de hoje continuam desligadas; as novas, abaixo, também).
- Testes: Vitest + Testing Library como hoje. Os testes atuais que citam rótulos, ordem de botões e contador mudam junto.

## O que foi decidido (como)

### Tokens
Definidos em `globals.css` (`@theme`) e usados em todas as telas. Hex de referência; o construtor pode ajustar ±1 tom se um par não bater o contraste medido.

| Token | Claro ("Letreiro") | Escuro ("Letreiro noite") |
|---|---|---|
| fundo | `#fff3dc` papel quente | `#120f2b` tinta escura |
| hachura do fundo | tinta a 4,5% | papel a 5% |
| superfície (cartão, painel, quadro) | `#ffffff` | `#ffffff` (o cartão continua claro nos dois temas, como hoje) |
| tinta (texto, bordas, sombras duras) | `#1b1540` | `#1b1540` dentro de superfícies; `#ffe8b5` papel para bordas e texto sobre o fundo |
| texto secundário | `#5a5479` | `#c9c2ea` sobre o fundo; `#5a5479` dentro de superfícies |
| papel (ficha, detalhes) | `#ffe8b5` | `#ffe8b5` |
| Verdade | `#1d4ed8` | `#1d4ed8` em preenchimentos (texto branco); `#93c5fd` como texto sobre o fundo |
| Mentira | `#be185d` | `#be185d` em preenchimentos; `#f9a8d4` como texto sobre o fundo |
| Cheira mal | `#c2410c` | `#c2410c` em preenchimentos; `#fdba74` como texto sobre o fundo |

Contraste conferido na pesquisa: texto tinta sobre papel acima de 14:1; branco sobre os três preenchimentos 6,6 / 5,9 / 4,9. No escuro, os preenchimentos coloridos ganham borda papel, que faz a separação do fundo (o preenchimento azul sobre a tinta escura não chega a 3:1 sozinho). *(Decisão do controlador: manter os dois temas. O autor pediu os dois na v2 e o aparelho decide; o escuro é "tinta sobre papel escuro", mesma linguagem.)*

**Regra do tema escuro para o que fica sobre o fundo da página** (não dentro de uma superfície branca): tinta e papel trocam de lugar. Bordas, sombras duras e a hachura ficam papel; o botão primário passa a preenchimento papel com texto tinta; o botão fantasma fica transparente com borda e texto papel; a sombra dos botões de resposta fica papel; a sombra dupla do painel de veredito inverte (tinta por cima, papel por baixo). Dentro das superfícies brancas nada muda (tinta sobre branco). Pares a medir no escuro: papel sobre fundo escuro (texto e borda), tinta sobre papel (botão primário). *(Decisão do controlador, após a revisão do construtor.)*

### Tipografia
- **Bungee** (Google Fonts, só caixa alta) para letreiro: títulos, rótulos da ficha, palavras de veredito (carimbo e botões), botões de ação e o placar grande. Nunca em frases com mais de ~4 palavras, nunca abaixo de 11 px.
- **Bungee Shade** só no título "CAIU NESSA?" da tela de início. *(Decisão do controlador: é o único lugar onde o letreiro é o elemento memorável; um arquivo de fonte a mais.)*
- **Atkinson Hyperlegible** (400 e 700) para todo o resto: afirmação, citação, explicação, mensagens, parágrafos das páginas de texto. Substitui a Geist; a Geist Mono sai (não é usada).
- O construtor confere no build que Bungee, Bungee Shade e Atkinson renderizam `ÃÇÕÉÁ` (um teste visual na primeira execução; se faltar glifo em alguma, a palavra cai para a sans).

### Linguagem de forma
- Superfícies (cartão, quadro da home, painel de veredito, cartões de `/afirmacoes`): fundo branco, borda 3 px tinta, **sombra dura deslocada** (`6px 6px 0` tinta no cartão e no quadro; `4px 4px 0` nos cartões de lista), **sem raio** (cantos retos). No escuro a borda e a sombra são papel.
- Fundo da página: papel com hachura diagonal fina (repeating-linear-gradient a 135°, 2 px de traço a cada 12 px), estática.
- Botões "de apertar": borda 3 px tinta, sombra `0 5px 0` tinta, texto Bungee. Ao pressionar (`:active`) e no estado "escolhido" do botão de resposta, `translateY(5px)` e sombra zero (afunda). Os outros dois botões de resposta ficam a 35% de opacidade enquanto o escolhido está afundado, como hoje.
- Botão de ação primário: fundo tinta, texto papel. Secundário ("fantasma"): fundo branco, texto tinta, mesma borda e sombra.
- Foco de teclado: contorno 3 px tinta (papel no escuro) com 2 px de afastamento, como hoje.
- O logo: o mesmo carimbo de `src/app/icon.svg`, recolorido de rosa para **tinta `#1b1540` sobre papel `#fff3dc`**. Valem para `icon.svg`, `favicon.ico` e `apple-icon.png`. *(Decisão do controlador: o vermelho do carimbo era a última cor de partido do produto; a pesquisa pediu a troca.)* O gerador do ícone passa a viver no repositório (`scripts/icone/`), para a recoloração ser reproduzível. Ele **não redesenha** o carimbo: troca os dois hex no `icon.svg` (que já é só caminhos) e renderiza `favicon.ico` (PNG embutido em 16/32/48) e `apple-icon.png` (180) a partir dele. Usa o `sharp` que já vem instalado como dependência transitiva do Next (carregado via `createRequire`), roda à mão (`node scripts/icone/gerar.mjs`), não entra no CI, e falha com mensagem clara se o `sharp` não estiver presente. Nenhuma dependência é adicionada ao `package.json`. *(Decisão do controlador.)*

### Tela de início
De cima para baixo, centralizado, ocupando a altura disponível com `justify-content: center`:
1. **Ficha** (faixa de papel, borda tinta, dois furos redondos nas laterais, Bungee 12 px): à esquerda `CAIU NESSA?`, à direita `INSIRA A FICHA` em Atkinson 700 11 px espaçada.
2. **Quadro** (superfície com borda e sombra): o carimbo em tinta a 72 px, o título `CAIU NESSA?` em Bungee Shade ~36 px, e o parágrafo de hoje ("12 afirmações da eleição…") em Atkinson 17 px, texto secundário, centralizado.
3. Botão primário `COMEÇAR`.
4. Duas linhas de dica em Bungee 11 px, texto secundário, centralizadas: `← MENTIRA · ↑ CHEIRA MAL · VERDADE →` e `ARRASTE O CARTÃO OU TOQUE`. Substituem a frase "Arraste o cartão: direita é verdade…" de hoje; a frase continua existindo como texto só para leitor de tela.
5. Link `Como escolhemos as afirmações`, sublinhado, tinta.

### Tela do jogo (três zonas, sem rolagem)
**Ficha (topo).** A mesma faixa de papel com furos. Esquerda: `FICHA 03/12` em Bungee (o número grande, o `/12` menor). Direita: `PLACAR 02` em Atkinson 700 espaçada. O placar conta os **acertos desta rodada** (o de hoje, que zera a cada rodada; o acumulado da partida só aparece na tela de placar). Aparece desde o início com `00` e só muda quando o painel revela o veredito, como o contador de hoje; os carimbos de progresso mudam no mesmo instante. *(Decisão do controlador.)* *(Decisão do controlador: a v2 escondia o contador até a primeira resposta; placar zerado é a convenção do fliperama e evita a faixa mudar de tamanho.)* Em rodadas extras (6 afirmações) o total acompanha: `FICHA 03/06`; a rodada aparece em Atkinson 700 pequeno antes de FICHA: `RODADA 2 · FICHA 03/06`.

**Carimbos de progresso.** Logo abaixo da ficha, uma grade com uma casa por afirmação (12 ou 6), quadrados de 10 px com borda 2 px tinta. Estados, legíveis sem cor: pendente = branco; atual = papel com borda mais grossa (pulsa devagar só sem movimento reduzido); acerto = tinta cheia; erro = hachura diagonal tinta sobre branco. A grade é `role="progressbar"` com os mesmos `aria-*` de hoje (a barra fina de hoje sai).

**Cartão (meio, flexível).** Superfície branca, borda 3 px, sombra dura 6 px; ocupa a altura que sobra. Dentro: um `?` decorativo em Bungee 72 px na cor papel no canto superior esquerdo (aria-hidden), a afirmação em Atkinson 700 com os degraus de tamanho de hoje (20 → 18 → 16 px pelo comprimento), e as **dicas de gesto nas bordas do cartão**, em Bungee 11 px, aria-hidden: `↑ CHEIRA MAL` no topo centralizado (texto secundário), `← MENTIRA` embaixo à esquerda (magenta), `VERDADE →` embaixo à direita (azul). A linha de dica abaixo do cartão sai; o texto só para leitor de tela sobre as setas fica. O próximo cartão aparece atrás como hoje (mesma moldura, 95%, mais claro, sem texto).

**Carimbo do veredito.** O selo que aparece durante o arrasto e fica depois da resposta vira um carimbo: palavra em Bungee 22 px, borda 4 px na cor do veredito, raio 6 px, rotação −14°, fundo branco a 70% com `mix-blend-mode: multiply`, no canto superior direito. Cor e palavra pelo veredito escolhido (MENTIRA / CHEIRA MAL / VERDADE). Comportamento igual ao de hoje (opacidade cresce com o arrasto; fixa depois).

**Painel de botões (base).** Três botões em **três colunas, na ordem dos gestos: MENTIRA, CHEIRA MAL, VERDADE** (hoje é uma pilha VERDADE/MENTIRA/CHEIRA MAL). Cada botão: preenchimento na cor do veredito, texto branco, ícone em cima (X para Mentira, gancho de interrogação para Cheira mal, visto para Verdade; SVG inline, traço 3,5, pontas quadradas, 22 px) e a palavra em Bungee 11 px embaixo, podendo quebrar em duas linhas; altura mínima 56 px. O rótulo `ISSO ME CHEIRA MAL 🤔` vira `CHEIRA MAL` (botão e carimbo); o botão leva `aria-label="Isso me cheira mal: enganoso"`. Setas do teclado e gesto continuam iguais.

### Painel de veredito
O mesmo bottom sheet de hoje (portal, foco, alça, rolagem interna, ≤ 85dvh), com a cara nova: superfície branca, borda superior 3 px tinta, sombra dupla acima (`0 -8px 0` papel, `0 -12px 0` tinta), cantos retos. O fundo atrás escurece e dessatura (`brightness(.75) saturate(.6)` no conteúdo da página, além do backdrop), para o carimbo no cartão continuar visível quando o painel não cobre tudo. Ordem dentro do painel:
1. Palavra do veredito da checagem em estilo carimbo pequeno (Bungee 15 px, borda 3 px na cor do veredito, −3°), alinhada à esquerda. É o selo "Verdade / Mentira / Enganoso" de hoje com cara nova: aqui a palavra é a da checagem, então `ENGANOSO` (não "cheira mal").
2. A mensagem de hoje (`Você acertou.` etc.) em Atkinson 700 18 px.
3. `Quem disse: …`, a citação com barra tinta à esquerda, a explicação, a linha `{X}% das pessoas erraram esta.` quando houver, e o link `Ver a checagem (…)`, todos como hoje em Atkinson 16 px.
4. Botão primário `PRÓXIMA` ou `VER MEU RESULTADO`.

### Tela de placar (resultado)
1. Ficha: `FIM DE JOGO` à esquerda, `RODADA n` à direita (`RODADA 1` na primeira). *(Decisão do controlador: o mockup trazia `12 DE 12`, que só repetia o total.)*
2. Rótulo `PLACAR` em Bungee 13 px; o número grande `7/12` em Bungee 64 px, tinta, com sombra em camadas (`4px 4px 0` papel, `6px 6px 0` tinta). Em rodada extra: `RODADA 2` como rótulo, `4/6` grande, e abaixo `NA PARTIDA 11/18` em Bungee 16 px.
3. O título da avaliação (`Imune`, `Quase imune`, `Abre o olho`, `Caiu feio`) em caixa alta num **carimbo tinta** (Bungee 16 px, borda 3 px tinta, raio 6 px, −3°). Tinta, não cor de veredito: a faixa não é juízo de valor colorido.
4. Texto da avaliação, viés e comparação com outros jogadores, como hoje, em Atkinson 16 px; a comparação dentro de um quadro de papel com borda tinta.
5. Botões: primário `CONTINUAR JOGANDO` (ou o texto de fim "Acabaram as afirmações…"), fantasma `JOGAR DE NOVO`. A linha de texto de compartilhar e os dois links continuam como hoje. *(Decisão do controlador: a cópia do mockup "NOVA FICHA · CONTINUAR" ficou de fora; o botão diz o que faz.)*

### Estados de carregamento e erro
`Calculando seu resultado…` dentro de uma ficha centralizada. Erros (`limite`, `falha`, `invalido`) dentro de um quadro com borda tinta, texto Atkinson, botão primário como hoje. Mensagens iguais às de hoje.

### Páginas de texto (`/afirmacoes`, `/como-escolhemos`)
Mesma estrutura e textos de hoje, com os tokens novos: fundo papel com hachura, títulos em Bungee (h1 ~28 px, h2 ~18 px, h3 ~16 px; os títulos são curtos), parágrafos em Atkinson 17 px / 1,6, cartões de afirmação com borda 3 px e sombra 4 px, o selo de veredito no estilo carimbo pequeno. Em `/como-escolhemos`, o trecho `(o botão "Isso me cheira mal")` vira `(o botão "Cheira mal")`.

### Movimento
Só o que existe hoje (arrasto, inclinação, selo, voo do cartão, subida do painel) mais dois detalhes: o afundar dos botões ao pressionar (transição de 80 ms em `transform`) e o pulso lento da casa atual do progresso. Ambos desligam com `prefers-reduced-motion`.

### Textos novos ou alterados
`COMEÇAR` (era "Começar"), `CHEIRA MAL` (era "ISSO ME CHEIRA MAL 🤔"), `FICHA n/N`, `PLACAR n`, `RODADA n`, `FIM DE JOGO`, `n DE N`, `PRÓXIMA` / `VER MEU RESULTADO`, `CONTINUAR JOGANDO`, `JOGAR DE NOVO`, `INSIRA A FICHA`, `ARRASTE O CARTÃO OU TOQUE`. Caixa alta é da fonte (Bungee), então o texto no DOM fica em capitalização normal ("Começar", "Cheira mal") e o CSS não precisa de `text-transform`; leitores de tela leem normal. Todo o resto (mensagens de veredito, avaliações, erros, páginas de texto) não muda.

## Deixado para quem constrói
- Como organizar os tokens (`@theme` em `globals.css` + as constantes de `rotulos.ts`), nomes de classes, e se os botões de apertar viram um componente.
- Os ícones SVG exatos dos três botões e do gancho de interrogação.
- Como medir o contraste final (script ou tabela no PR) e como testar o estado dos carimbos de progresso.
- Valores de `clamp()` para o título e o placar grande em telas de 320 a 430 px.
- Se a ficha e o quadro usam pseudo-elementos ou SVG para os furos.

## Critério de pronto
Partida completa jogada por gestos e outra por botões, nos dois temas, a 320 e 390 px, sem rolagem horizontal nem erro de console; nenhuma cor verde, amarela ou vermelha de destaque em nenhuma tela (busca por classes `emerald`, `rose`, `amber`, `red`, `green`, `yellow` no `src/` sem resultado); contraste medido para os pares da tabela; testes atualizados (rótulos, ordem dos botões, placar desde `00`, estados dos carimbos de progresso, `aria-label` do botão Cheira mal) passando; `npm run lint`, `typecheck`, `test` e `build` verdes; os três ícones recoloridos e o gerador em `scripts/icone/`.
