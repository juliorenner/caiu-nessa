# Afirmações do debate da Globo (23/10/2026)

47 afirmações novas do debate de Lula (PT) e Flávio Bolsonaro (PL) na TV Globo, em 23/10/2026: 22 de Lula (`esquerda`) e 25 de Flávio (`direita`). Nenhum item existente foi alterado. A primeira leva tinha 6 itens (3 por lado), respeitando o limite da rodada mensal. O dono liberou o limite para esta PR e pediu a varredura completa: entraram mais 41.

## Como verifiquei

- Páginas lidas com `npx tsx scripts/pagina.ts <url>` em 24/10/2026:
  - Lupa: https://www.agencialupa.org/checagem/2026/10/23/ao-vivo-checagem-do-ultimo-debate-entre-lula-e-flavio-bolsonaro-no-segundo-turno/ (mais de 40 falas, com citação literal e selo)
  - G1 Fato ou Fake: https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/23/veja-o-que-e-fato-ou-fake-nas-falas-de-flavio-bolsonaro-e-lula-no-debate-da-globo-no-2o-turno-das-eleicoes-2026.ghtml (55 checagens, com citação literal e selo)
  - Estadão Verifica: https://www.estadao.com.br/estadao-verifica/debate-tv-globo-checagem-tempo-real-ao-vivo/ (só paráfrase, sem fala literal: usado para contar agências e votos, nunca como fonte de citação)
  - Aos Fatos: https://www.aosfatos.org/noticias/checamos-flavio-bolsonaro-lula-debate-globo/. O texto da página traz só o resumo. As falas e os selos ficam num widget de transcrição, carregado de `https://www.aosfatos.org/api/escriba/177500de-f763-4f91-894c-981086c9bbe3/` (endereço encontrado no JavaScript da página). Li esse JSON: 60 falas comentadas, 46 com selo. Ele serviu para contar agências e votos. Não serviu como fonte: a fala não está no texto da página do Aos Fatos, e um JSON não é página de checagem. Falas sem selo no JSON (checagem pendente) não contam como voto.
  - Comprova: nenhuma checagem de falas do debate.
- Citação: toda `citacao` foi copiada da Lupa ou do G1, da página que está em `fonte_url`. `npx tsx scripts/conferir-citacoes.ts --estrito` confirma as 47.
- Votos: rótulos mapeados como manda a skill (Falta contexto, Exagerado, Subestimado, Impreciso, #NÃOÉBEMASSIM e "não é bem assim" = enganoso; Insustentável não conta). Empate entre verdadeiro e enganoso dá enganoso; empate entre falso e enganoso dá falso; verdadeiro contra falso tira a fala do jogo.
- `alcance`: 3 quando duas ou mais agências da lista checaram a mesma fala (com ou sem voto), 2 quando só uma.
- Duplicatas: comparei `citacao` e `texto` do banco com cada fala. Falas já presentes no banco (de outra ocasião) e falas que só repetem o mesmo fato de um item existente ficaram de fora.

## Novas

| id | lado | veredito | alcance | agências (selo) | fonte |
|---|---|---|---|---|---|
| 0236f27b | esquerda | falso | 3 | Lupa (Falso), G1 (#FAKE), Estadão (Falso) | Lupa |
| 122ae1d2 | esquerda | falso | 2 | G1 (#FAKE) | G1 |
| d7028255 | esquerda | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Lupa (Falta contexto) | G1 |
| 408fb766 | esquerda | verdadeiro | 3 | Lupa (Verdadeiro), G1 (#FATO), Aos Fatos (Verdadeiro) | Lupa |
| 9f24e2ac | esquerda | verdadeiro | 3 | Lupa, Estadão, Aos Fatos (Verdadeiro), G1 (#FATO) | G1 |
| 050c519c | esquerda | verdadeiro | 3 | Lupa, Estadão, Aos Fatos (Verdadeiro), G1 (#FATO) | Lupa |
| 46d0e04f | esquerda | enganoso | 3 | Lupa (Falta contexto), Aos Fatos (Não é bem assim), G1 (#FATO) | Lupa |
| 31e53d8f | esquerda | enganoso | 3 | Lupa (Subestimado), G1 (#FATO) | Lupa |
| c2c07c7c | esquerda | verdadeiro | 2 | Lupa (Verdadeiro) | Lupa |
| 6c86cfa6 | esquerda | verdadeiro | 3 | Lupa, Aos Fatos (Verdadeiro), G1 (#NÃOÉBEMASSIM) | Lupa |
| 9b79d9d9 | esquerda | verdadeiro | 3 | Lupa (Verdadeiro), G1 (#FATO) | Lupa |
| 53fd4e41 | esquerda | enganoso | 3 | Lupa (Falta contexto), Estadão (Enganoso) | Lupa |
| a4682c08 | esquerda | verdadeiro | 3 | G1 (#FATO), Estadão (Verdadeiro), Aos Fatos (Não é bem assim) | G1 |
| 626beb06 | esquerda | verdadeiro | 2 | G1 (#FATO) | G1 |
| f2231e34 | esquerda | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Estadão (Impreciso), Aos Fatos (Verdadeiro) | G1 |
| 5a604d0f | esquerda | verdadeiro | 3 | G1 (#FATO), Estadão, Aos Fatos (Verdadeiro) | G1 |
| 525dba64 | esquerda | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Estadão (Falta contexto), Aos Fatos (Verdadeiro) | G1 |
| 9eedbce1 | esquerda | verdadeiro | 3 | G1 (#FATO), Aos Fatos (Verdadeiro) | G1 |
| 3d8b71e2 | esquerda | enganoso | 2 | G1 (#NÃOÉBEMASSIM) | G1 |
| f6de005c | esquerda | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Estadão (Verdadeiro) | G1 |
| 5e05c974 | esquerda | verdadeiro | 2 | G1 (#FATO) | G1 |
| b01f33aa | esquerda | enganoso | 3 | G1 (#FATO), Estadão (Falta contexto) | G1 |
| 3db29d6e | direita | verdadeiro | 3 | Lupa (Verdadeiro), G1 (#FATO) | Lupa |
| 665b6616 | direita | verdadeiro | 2 | G1 (#FATO) | G1 |
| 7be06631 | direita | verdadeiro | 3 | Lupa (Verdadeiro), G1 (#FATO) | Lupa |
| f316ee02 | direita | falso | 3 | Lupa (Falso), G1 (#NÃOÉBEMASSIM) | G1 |
| f5ae3786 | direita | enganoso | 3 | Lupa (Exagerado), G1 (#NÃOÉBEMASSIM) | Lupa |
| 0bd23b76 | direita | verdadeiro | 2 | Lupa (Verdadeiro) | Lupa |
| bba014ee | direita | enganoso | 3 | Lupa (Exagerado), G1 (#NÃOÉBEMASSIM), Estadão (Enganoso) | Lupa |
| c55efd48 | direita | falso | 3 | Lupa, Estadão, Aos Fatos (Falso), G1 (#FAKE) | Lupa |
| 65e218f6 | direita | enganoso | 2 | Lupa (Falta contexto) | Lupa |
| 8255f909 | direita | falso | 2 | Lupa (Falso) | Lupa |
| 86bd926c | direita | enganoso | 3 | Lupa (Falta contexto), G1 (#NÃOÉBEMASSIM) | Lupa |
| 79858823 | direita | enganoso | 2 | Lupa (Falta contexto) | Lupa |
| e1fd5967 | direita | enganoso | 2 | Lupa (Falta contexto) | Lupa |
| 33cd0720 | direita | falso | 3 | Aos Fatos (Falso), G1 (#NÃOÉBEMASSIM), Lupa (Insustentável, sem voto) | G1 |
| 9aea7fbe | direita | falso | 3 | Lupa, Aos Fatos (Falso), G1 (#FAKE) | Lupa |
| 60ed9042 | direita | enganoso | 3 | Lupa (Falta contexto), Aos Fatos (Não é bem assim) | Lupa |
| 4a2e691c | direita | verdadeiro | 2 | G1 (#FATO) | G1 |
| 2f62e6eb | direita | verdadeiro | 3 | Estadão, Aos Fatos (Verdadeiro), G1 (#NÃOÉBEMASSIM) | G1 |
| d0df7fda | direita | verdadeiro | 2 | G1 (#FATO) | G1 |
| 47dced44 | direita | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Aos Fatos (Verdadeiro) | G1 |
| e9ac7108 | direita | verdadeiro | 2 | G1 (#FATO) | G1 |
| c7bec08f | direita | falso | 2 | G1 (#FAKE) | G1 |
| 57311a1f | direita | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Estadão (Enganoso) | G1 |
| 91a21883 | direita | enganoso | 3 | G1 (#FATO), Aos Fatos (Não é bem assim) | G1 |
| 897095a3 | direita | enganoso | 2 | G1 (#NÃOÉBEMASSIM) | G1 |

## Checadas, mas fora

- Já no banco (mesma fala ou mesmo fato):
  - de Lula: PIB acima de 3% (a88285e0), 33 milhões passando fome (2027f3bc), fim da fome (eaa6facd), 6 mil obras paradas (311499c1), licença-maternidade (9ffc66a8), perdão de dívidas de MEIs (c6a6d3f6), defesa do policial no caso Ana Clara (cbfe2cc3), casa de R$ 10 milhões (3d13028f)
  - de Flávio: "pai do tigrinho" (6b98ca43), roubo de celular para "cervejinha" (50b79160), Bolsa Família de R$ 600 (b430643c), dívida de R$ 11 trilhões (912298e6), população de rua dobrou (c6e52312), 80 milhões com contas atrasadas (5c9b6e39), Selic perto de 14% e "uma das maiores taxas de juros do mundo" (b6039b81), previsão de juros de 7% (6b1e2a40), saidinhas (fbf784ba), Roberta Luchsinger (ad602974), marcação de munições (b2d99249, 9d9d9871), relatório da PF sobre dinheiro público no "Dark Horse" (929b9a8b), recorde de mulheres assassinadas (f0fe3e98), recorde de carga tributária (15897b12)
- Agências em conflito verdadeiro x falso: Flávio sobre as 11,5 mil obras paralisadas e o "cemitério de obras" (Estadão: verdadeiro; G1 e Aos Fatos: falso).
- Rótulo que não conta como voto, sem outra agência: Flávio sobre os R$ 30 milhões ao Instituto Lula (Lupa: Insustentável).
- Sem fala literal na página de uma agência:
  - só o Estadão (paráfrase): de Lula, Ceará e o ITA, primeira universidade em 1920, fotos de Flávio com Vorcaro, Willer Tomaz sócio de Flávio (inconclusivo), Desenrola com 16 milhões e computador quântico (também no JSON do Aos Fatos); de Flávio, pedágio zero para motos, meta de saneamento adiada para 2050, reajuste do Bolsa Família, facada por ex-filiado do Psol, uísque de R$ 500 mil, chuvas no Sul, recorde de violência contra a mulher e números de água e esgoto
  - só o Aos Fatos (citação só no JSON do widget): de Lula, investimento recorde em infraestrutura, investimentos "três ou quatro vezes" maiores, "abrir a porteira", supercomputador em Natal, Rio Grande do Sul com mais aposentados, barco no dia de 1.100 mortes e vacinas da Covaxin que não vieram; de Flávio, IVA de 28%, Argentina governada 20 anos pela esquerda, Cracolândia, Santas Casas, Pisa, ilha do Richarlison, "Dark Horse" sem dinheiro público, mais de 30 impostos
- Selo pendente (sem voto) e sem outra agência com citação: Flávio sobre o Comando Vermelho no Nordeste e sobre a ferrovia entre as capitais do Nordeste (Aos Fatos, sem selo).

## Validação

- `npm test`: `Test Files  57 passed (57)`, `Tests  738 passed (738)`
- `npx tsx scripts/verificar-fontes.ts`: 226 `OK`, nenhum `FALHOU`
- `npx tsx scripts/validar-revisao.ts`: `PROBLEMA 47 novas, limite 6`, `PROBLEMA 22 novas à esquerda, limite 3`, `PROBLEMA 25 novas à direita, limite 3`. É só o limite da rodada mensal, que o dono liberou para esta PR; não houve outro problema.
- `npx tsx scripts/conferir-citacoes.ts --estrito`: `47 conferidas, 0 sem citação encontrada`
