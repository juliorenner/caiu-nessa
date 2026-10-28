# Lote de afirmações fora da eleição (27/10/2026)

## Origem

Com a eleição de 2026 encerrada, o jogo passa a ser um quiz de afirmações do mundo político brasileiro em geral (esquerda contra direita), não só da disputa presidencial. O dono pediu um lote de cerca de 20 afirmações que não fossem da campanha. Entraram 20: 10 `esquerda` e 10 `direita`. Nenhum item existente foi alterado.

## Regras do lote

- Lado: político claramente de esquerda (PT, PSOL, PCdoB, PDT, Rede, PSB e seus ministros) ou de direita (PL, Novo, bolsonaristas declarados como Tarcísio, Nikolas Ferreira, Zema, Caiado, Eduardo Bolsonaro). Centrão (MDB, PSD, União, PP, Republicanos) só quando alinhado publicamente a um dos lados. Post viral sem autor só entra quando a própria agência diz qual campo o espalhou.
- Atemporal: a afirmação precisa fazer sentido depois da eleição. Ficaram de fora promessas de campanha, comícios, pesquisas, "se eleito", candidaturas e logística de debate.
- Checagens de 2025 e 2026 valem. Sem duplicar, pelo sentido, o que já está no banco.
- Prioridade aos pares (lado, veredito) com menos jogáveis: antes do lote, `esquerda`+`falso` tinha 15 e `direita`+`verdadeiro` tinha 21.
- `citacao` copiada da página da agência; sem fala literal, o item não entra. Veredito = rótulo da agência pelo mapeamento da skill `revisao-de-fatos`; rótulo que não conta como voto, fora.
- Ambiguidade (passo 4 da skill): o cartão tem de ser fiel à fala sem confundir. Se o veredito depende de um contexto que não cabe no cartão, o item não entra.
- `alcance` pelo critério da skill. Considerei o Roda Viva (TV Cultura) entrevista de TV nacional: alcance 2 com uma agência.
- Páginas lidas com `npx tsx scripts/pagina.ts`; todas as fontes são Lupa ou Aos Fatos (as buscas no G1 e no Comprova não trouxeram falas fora da campanha com citação literal; o Estadão não pôde ser buscado).

O teste `tests/data/afirmacoes-reais.test.ts` exigia `data_checagem` a partir de 01/01/2026 (início da campanha). Com o reposicionamento, o limite passou para 01/01/2025.

## Novas

| id | lado | veredito | alcance | autor | agência |
|---|---|---|---|---|---|
| 5f8c9c58 | esquerda | falso | 1 | Lula (PT), discurso na Toyota, mar/2025 | Lupa |
| c5c0d208 | esquerda | falso | 1 | Lula (PT), entrevista a rádios de MG, fev/2025 | Lupa |
| 58c97fd0 | esquerda | falso | 1 | Lula (PT), coletiva em Brasília, jan/2025 | Lupa |
| ce4cd6d6 | esquerda | falso | 1 | Lula (PT), entrevista ao DCM, Fórum e TV 247, abr/2026 | Lupa |
| 9e18be62 | esquerda | falso | 1 | posts de perfis de esquerda (sem autor identificado) | Aos Fatos |
| 5d58b9fe | esquerda | enganoso | 1 | Lula (PT), discurso na Toyota, mar/2025 | Lupa |
| c394058d | esquerda | enganoso | 1 | Lula (PT), entrevista a rádios de MG, fev/2025 | Lupa |
| efc8d8e0 | esquerda | enganoso | 1 | Lula (PT), BandNews FM, ago/2025 | Lupa |
| c05c31c9 | esquerda | verdadeiro | 1 | Lula (PT), discurso na ONU, set/2025 | Aos Fatos (e Lupa) |
| 78e90acc | esquerda | verdadeiro | 1 | Lula (PT), discurso na ONU, set/2025 | Aos Fatos |
| a6e9acd6 | direita | verdadeiro | 1 | Jair Bolsonaro (PL), ato na Paulista, abr/2025 | Lupa |
| 4d3f0110 | direita | verdadeiro | 1 | Flávio Bolsonaro (PL), Flow Podcast, dez/2025 | Lupa |
| 2f5fb5bd | direita | verdadeiro | 1 | Flávio Bolsonaro (PL), Flow Podcast, dez/2025 | Lupa |
| 022a897b | direita | verdadeiro | 1 | Romeu Zema (Novo), post no Instagram, dez/2025 | Lupa |
| 85d87122 | direita | verdadeiro | 2 | Romeu Zema (Novo), Roda Viva, ago/2025 | Lupa |
| 9ee2a698 | direita | verdadeiro | 2 | Romeu Zema (Novo), Roda Viva, ago/2025 | Aos Fatos |
| 7c6680c3 | direita | enganoso | 1 | Jair Bolsonaro (PL), ato na Paulista, abr/2025 | Lupa |
| 291b5e2a | direita | enganoso | 1 | Tarcísio de Freitas (Republicanos), Pânico, jun/2026 | Lupa |
| 126d70da | direita | falso | 1 | Tarcísio de Freitas (Republicanos), ato de 7 de setembro de 2025 | Aos Fatos |
| e3b17a42 | direita | falso | 1 | Michelle Bolsonaro (PL), ato de 7 de setembro de 2025 | Aos Fatos |

Jogáveis por par depois do lote: `esquerda` verdadeiro 46, falso 20, enganoso 38; `direita` verdadeiro 27, falso 66, enganoso 38.

## Decisões de lado

- Tarcísio de Freitas (Republicanos) como `direita`: o partido é do centrão, mas ele é bolsonarista declarado; a regra do lote o cita como exemplo. As duas falas dele são de defesa de Bolsonaro ou de ataque ao governo Lula.
- Romeu Zema (Novo) como `direita`: o Novo está na lista de partidos de direita do lote.
- 9e18be62 (voto de Nikolas Ferreira e a conta de luz) como `esquerda`: o post não tem autor, mas o Aos Fatos diz que a desinformação foi "propagada por perfis de esquerda" contra o deputado do PL.

## Candidatos que ficaram de fora

- Lula, ONU (set/2025), "o Parlamento brasileiro corretamente apressou-se" no ECA Digital: Aos Fatos Falso, Lupa Falta contexto (vale falso). Fora por ambiguidade: a Câmara de fato acelerou o projeto depois do vídeo do Felca; o veredito depende de contar a tramitação desde 2022, que não cabe no cartão.
- Lula, Toyota (mar/2025), "[Tivemos que recuperar o] Ministério do Trabalho, que não existia mais": Lupa Falso. Fora por ambiguidade: o ministério de 2021 era o do Trabalho e Previdência; quem sabe da extinção de 2019 tende a responder verdade, e o veredito depende dessa distinção.
- Lula, discurso na GM (dez/2025), "53% de energia renovável": Lupa Exagerado (50% da matriz energética). Fora: a fala não diz se é matriz energética ou elétrica (esta passa de 80%), e a citação literal da página tem um erro de digitação ("játem") que teria de ir para o cartão público.
- Bolsonaro, Copacabana (mar/2025), "Compramos 600 milhões de doses de vacinas": Lupa Falta contexto. Fora por ambiguidade: o número é verdadeiro; o veredito depende do atraso nas compras, que não está na fala.
- Tarcísio, Flow (nov/2025), menores índices de crimes em SP "desde 2001": Lupa Verdadeiro, mas o texto da checagem fala em "mínima histórica desde 2021". Fora pela inconsistência da própria página.
- Caiado, "sou o mais bem avaliado governador do país": pesquisa de opinião, fora pelas regras do lote.
- Michelle Bolsonaro, "meu movimento feminino se tornou o maior da história": Lupa Verdadeiro, mas a explicação mostra que o PL segue entre os partidos com menos mulheres; o cartão confundiria.
- Já no banco por sentido: Lula e o PIB acima de 3% desde 2010 (a88285e0), Bolsonaro e o Bolsa Família de R$ 600 (b430643c), o Pix criado por Bolsonaro (31b0b1d8, 12ef6a7e), Lula e o roubo de celular para cerveja (50b79160), 20 milhões de empregos (fb1c8e61).
- Sem fala literal ou sem lado atribuído: posts anônimos sobre o tarifaço (Aos Fatos, jul/2025) e as peças sobre a Lei Rouanet nos atos de setembro de 2025 (nota, sem selo por fala).
- Preteridos por já haver muitas `direita`+`falso`: Rogério Marinho (PL) e Tarcísio sobre a "única delação" de Mauro Cid, Zema sobre o 8 de Janeiro e o Mensalão, Flávio sobre "anistia eleitoral" e o atentado de Adélio, Bolsonaro sobre Lula e o Hamas.
