# Rodadas: pool único, sorteio e "Continuar jogando" (design)

Data: 2026-10-22. Ticket de rodadas no Linear. Decisão do dono em 2026-10-22: "as 12 perguntas eram só pra iniciar, a ideia é que tenhamos mais e depois que randomizemos elas, e que as pessoas possam então continuar jogando"; proposta abaixo aprovada ("gosto da proposta").

## O que muda para quem joga

- Cada visita a `/quiz` sorteia 12 afirmações do pool inteiro, sempre 2 de cada veredito por lado. Duas pessoas (ou a mesma pessoa duas vezes) podem ver conjuntos diferentes.
- No resultado aparece **Continuar jogando**. Cada rodada seguinte tem 6 afirmações (1 de cada veredito por lado) que a pessoa ainda não viu nesta partida. A rodada extra termina com o seu próprio resultado: acertos da rodada, a faixa (Imune etc.), o acumulado da partida e de novo **Continuar jogando**.
- Quando o pool não consegue fechar mais uma rodada balanceada, o botão dá lugar a "Acabaram as afirmações por enquanto. Volte depois: a lista cresce." e fica **Jogar de novo**.
- A comparação com os outros jogadores ("Você acertou mais que X%") só aparece na primeira rodada: é a única com 12 e a única que entra no ranking.

## Pool

- `src/data/afirmacoes.json` passa a ser o pool inteiro (hoje 41 itens: 34 jogáveis + 7 com `observacao` "Fora do jogo"). `afirmacoes-reserva.json` deixa de existir. A ordem no arquivo não importa.
- Jogável = item sem `observacao`. Itens com `observacao` são exibidos em /afirmacoes na seção "Fora do jogo" e nunca sorteados.
- Validação do pool (substitui a regra "exatamente 12"): ids únicos; cada item válido pelo esquema de hoje; cada par (lado, veredito) tem ao menos `POR_VEREDITO_POR_LADO` (2) itens jogáveis, para a primeira rodada sempre fechar. Hoje: esquerda 7/5/5, direita 3/11/3.
- Regra de neutralidade por rodada: toda rodada tem o mesmo número de afirmações de cada lado e, dentro de cada lado, o mesmo número de cada veredito. Primeira rodada 2 por par; extras 1 por par. Nenhuma rodada desbalanceada é sorteada nem aceita pela API.

## Sorteio

`sortearRodada(pool, porPar, excluir, aleatorio)`: para cada um dos 6 pares (lado × veredito), embaralha os jogáveis fora de `excluir` e pega `porPar`; devolve `null` se algum par não tem itens suficientes. O resultado é embaralhado antes de ir para o cliente e nunca carrega `lado`.

- Primeira rodada: sorteada no servidor em `/quiz` (como hoje), `porPar = 2`, `excluir = []`.
- Rodadas extras: `POST /api/rodada` com `{ vistas: string[] }` (ids já respondidos nesta partida, acumulados no cliente) devolve `{ afirmacoes: AfirmacaoNoQuiz[], erroPorAfirmacao }` com `porPar = 1`, ou `{ afirmacoes: null }` quando não fecha. Sem gravação, sem limite de taxa (é leitura).
- Com o pool de hoje: 1 rodada de 12 e depois 1 rodada de 6 (o gargalo são as 3 verdadeiras e 3 enganosas da direita: a primeira rodada usa 2 de cada, sobra 1 de cada). Mais rodadas dependem de curadoria (ticket de curadoria no Linear).

## Resultado e nota para qualquer tamanho

- `POST /api/resultado` aceita respostas cujas chaves são ids jogáveis do pool, com 12 ou 6 chaves, balanceadas (2 ou 1 por par). Qualquer outra coisa é 400. A jogada é gravada com `total` = 12 ou 6 (coluna já existe; sem migração).
- `calcularResultado` passa a informar também a composição da rodada (verdadeiras e não verdadeiras por lado), porque os textos de avaliação usam essas bases.
- Faixas por fração do total: `acertos === total` → Imune; `acertos >= ceil(0,75 × total)` → Quase imune; `acertos >= ceil(0,4 × total)` → Abre o olho; senão Caiu feio. Para 12 isso dá 12 / 9 / 5 (igual a hoje); para 6 dá 6 / 5 / 3.
- Estatísticas: média por lado, histograma e percentil só contam jogadas com `total = 12` (ranking comparável). "% das pessoas erraram esta" passa a usar, por afirmação, o número de jogadas em que a afirmação apareceu como denominador, e só aparece quando a afirmação apareceu em ao menos 30 jogadas (`MINIMO_POR_AFIRMACAO`); o portão geral de 100 jogadas continua valendo para o ranking.

## Tela

- O quiz recebe `rodada` (1, 2, …) e mostra "Afirmação n de 12" ou "n de 6"; o contador de acertos recomeça a cada rodada.
- Resultado da primeira rodada: como hoje, mais o botão **Continuar jogando** (abaixo de "Jogar de novo" vira o secundário; o primário é continuar).
- Resultado de rodada extra: "Rodada 2: 4 de 6", título e texto da faixa, viés como hoje, linha "Na partida: 12 de 18", sem a comparação com os outros, **Continuar jogando** e **Jogar de novo**.
- Enquanto a próxima rodada carrega, o botão mostra "Sorteando…" e fica desabilitado; falha de rede mostra "Não deu para sortear. Tente de novo." e mantém o botão.
- Um componente cliente `Partida` guarda `vistas`, `acumulado` e `rodada`, pede a próxima rodada e remonta o quiz (`key={rodada}`) com as novas afirmações.

## Páginas e textos

- /afirmacoes: seções "No jogo" (jogáveis, agrupadas por lado para leitura) e "Fora do jogo"; a introdução explica que cada rodada é sorteada do pool.
- /como-escolhemos: "cada rodada tem o mesmo número de afirmações de cada lado e, em cada lado, de cada veredito: a primeira tem 12, as seguintes 6".
- Landing continua dizendo 12 afirmações (é a primeira rodada). README atualizado.

## Fora do escopo

- Lembrar entre visitas o que a pessoa já viu (sem login e sem cookie por decisão de privacidade); cada visita recomeça do pool inteiro.
- Rodadas extras de 12 (precisam de curadoria da direita).
- Ranking por rodada extra.
