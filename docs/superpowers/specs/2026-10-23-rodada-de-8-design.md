# Primeira rodada de 8 (design)

Data: 2026-10-23, madrugada. Decisão do autor depois da avaliação de tempo ("12 não são muitas perguntas, devido ao tempo que as pessoas estão dispostas a gastar?"): primeira rodada de **8** afirmações, com **4 de cada lado** e, em cada lado, **1 verdadeira, 2 falsas e 1 enganosa** ("as duas a mais, uma de cada, podem ser mentiras: 1 verdade, 1 enganoso, 2 mentiras"). As rodadas extras continuam com 6 (1 de cada por lado). Revisado por um construtor antes da entrega; as três dúvidas dele (links antigos com 12, rodadas de 12 em andamento no deploy, mínimo do pool) estão resolvidas abaixo como decisão do controlador.

## Intenção
Doze cartões com veredito e explicação levam de 5 a 8 minutos; um link de WhatsApp segura uns 3. Com 8 a pessoa chega ao placar e ao compartilhar em uns 4 minutos e, se quiser, continua de 6 em 6. A composição 1/2/1 por lado mantém a simetria entre os lados (o que importa para a neutralidade: os dois lados têm exatamente o mesmo perfil) e dá peso às mentiras, que são o que mais circula.

## Objetivos
- Primeira rodada: 8 afirmações, composição por lado `{ verdadeiro: 1, falso: 2, enganoso: 1 }`, idêntica nos dois lados; ordem embaralhada como hoje.
- Rodadas extras: 6, composição `{ 1, 1, 1 }` por lado, como hoje.
- Tudo que hoje diz "12" passa a dizer "8": home, descrição do site e prévia do link, /como-escolhemos, /afirmacoes, página do amigo (`Rodada de 8`), texto compartilhado (`Fiz 5/8`).
- A comparação com outros jogadores e o histograma passam a olhar rodadas de 8; as faixas (Imune, Quase imune, Abre o olho, Caiu feio) já são proporcionais ao total e não mudam de regra.
- Imagens e grade: 8 casas em duas linhas de 4; 6 casas continuam numa linha de 6.

## Não objetivos
- Mudar a pontuação, os eixos de erro ou os textos das faixas.
- Migrar o banco: jogadas de 12 antigas ficam gravadas; só deixam de entrar na comparação (o ranking exige 100 jogadas de 8 para aparecer, como antes exigia 100 de 12).
- Permitir composições arbitrárias; só as duas acima existem.

## Anti-objetivos
- Qualquer assimetria entre os lados na composição ou no sorteio.
- Um pool que não sustenta a primeira rodada (precisa de ≥ 2 falsas jogáveis por lado, além de ≥ 1 verdadeira e ≥ 1 enganosa; hoje tem) sem erro claro.
- Resquício de "12" em texto, `alt`, schema ou teste.

## Decisões do controlador após a revisão
- **Links e imagens já compartilhados com 12 continuam funcionando.** `src/lib/rodadas.ts` lista, além das composições atuais, as **históricas** (`COMPOSICOES_HISTORICAS = [{ 2, 2, 2 }]`, tamanho 12). `/cartao` e `/r/<código>` aceitam qualquer tamanho configurado (atuais + históricos); a grade usa `porLinha(12) = 6`.
- **Rodadas de 12 em andamento na hora do deploy terminam bem.** `ehRodadaBalanceada` aceita as composições atuais e as históricas; `/api/resultado` grava a jogada normalmente; só a comparação com outros jogadores e o histograma filtram `total = TOTAL_AFIRMACOES` (8). Uma composição que não esteja em nenhuma lista continua sendo rejeitada.
- **Mínimo do pool** (`POR_VEREDITO_POR_LADO = 2`) fica como está; a curadoria (JUL-112) é quem cuida de manter folga.

## Restrição que manda: fácil de mudar de novo
O autor avisou que isso "pode ser mudado mais vezes". Então: **um único ponto de configuração**, `src/lib/rodadas.ts`, com `COMPOSICAO_PRIMEIRA` e `COMPOSICAO_EXTRA` (por lado, `Record<Veredito, number>`). Tudo o mais deriva dali: `TOTAL_AFIRMACOES`, `TAMANHOS_DE_RODADA`, `MAXIMO_ACERTOS`, o schema de `t` em `/cartao` e `/r`, o número de casas por linha das grades (`porLinha(total)`), o filtro das estatísticas, e **todo texto que cita o número** (`${TOTAL_AFIRMACOES} afirmações`, `Rodada de ${t}`, a frase de /como-escolhemos montada a partir da composição: "de cada lado, 1 verdadeira, 2 falsas e 1 enganosa"). Um teste varre `src/` e falha se encontrar `\b\d+ afirmaç` ou `de cada por lado` escrito à mão fora de `rodadas.ts`. Mudar para 6, 10 ou 12 de novo = editar duas linhas e rodar os testes.

## Restrições
- A composição é um `Record<Veredito, number>` por lado (`COMPOSICAO_PRIMEIRA = { verdadeiro: 1, falso: 2, enganoso: 1 }`, `COMPOSICAO_EXTRA = { 1, 1, 1 }`) em `src/lib/rodadas.ts`; `sortearRodada(pool, composicao, excluir)` sorteia, por lado e veredito, a quantidade da composição; `ehRodadaBalanceada` aceita exatamente as composições configuradas (pelo tamanho), nada mais.
- `TOTAL_AFIRMACOES`, `TAMANHOS_DE_RODADA`, `MAXIMO_ACERTOS` derivados das composições (não números soltos); a consulta de estatísticas filtra `total = TOTAL_AFIRMACOES`.
- `/cartao` e `/r/<código>`: `t` ∈ `TAMANHOS_DE_RODADA`; grades com `porLinha(total)` por linha (`total ≤ 6 → total; 8 → 4; 12 → 6`; regra: o maior divisor ≤ 6 que dá linhas iguais).
- Fixtures de teste: a lista válida passa a ter a composição da primeira rodada (8) e continua existindo uma de 6; o pool real (`src/data/afirmacoes.json`) precisa ter pelo menos 2 falsas jogáveis por lado (conferir no teste de dados reais).
- Commits sem `JUL-`.

## O que foi decidido (como)
- `src/lib/afirmacoes.ts`: `Composicao = Record<Veredito, number>`; `COMPOSICAO_PRIMEIRA`, `COMPOSICAO_EXTRA`; `tamanhoDa(composicao)` = 2 × soma; `sortearRodada(pool, composicao, excluir, aleatorio?)`; `ehRodadaBalanceada` compara a contagem por par com a composição cujo tamanho bate.
- Textos: home `8 afirmações sobre a eleição…`; `DESCRICAO` `8 afirmações da eleição. Verdade, mentira ou cheira mal? Descubra em quantas você caiu.`; imagem OG da home; `/como-escolhemos` ("a primeira rodada tem 8 afirmações: de cada lado, 1 verdadeira, 2 falsas e 1 enganosa; as seguintes têm 6, 1 de cada por lado"); `/afirmacoes` ("a primeira tem 8 afirmações, as seguintes 6, sempre com o mesmo número de cada lado e o mesmo perfil de vereditos nos dois lados"); página do amigo e sua descrição (`8 afirmações da eleição…`).
- `src/lib/cartao.ts` schema `t` ∈ {6, 8}; `GradeDeCasas`, `Cartao` (stories) e `CartaoOg`: `porLinha = total === 8 ? 4 : 6`.
- Estatísticas: `MAXIMO_ACERTOS = 8`, filtro `total = TOTAL_AFIRMACOES`; o gate de 100 jogadas continua.

## Deixado para quem constrói
- Como representar a composição no `sortearRodada` sem duplicar o laço por par.
- Nomes das fixtures (`afirmacoesValidas` com 8? manter 12 itens e derivar `rodadaDeOito`?); o que for menos invasivo nos testes.
- Ajuste fino da grade de 2×4 nas imagens (tamanho das casas).

## Critério de pronto
`/quiz` entrega 8 afirmações com 4 por lado e 1/2/1 por lado; rodada extra entrega 6; `/api/resultado` aceita as duas e rejeita qualquer outra composição; textos sem "12"; `/cartao?t=8` e `/r/…-8-…` renderizam 2×4; testes, lint, typecheck e build verdes; checagem visual do placar com 8 e da imagem dos stories com 8.
