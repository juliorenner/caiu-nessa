# Regras novas aplicadas: os 8 de volta e o alcance dos 45 (23/10/2026)

Spec: `docs/superpowers/specs/2026-10-23-regras-alcance-lote-design.md`. Regras: `.claude/skills/revisao-de-fatos/SKILL.md` e `/como-escolhemos`.

## Como verifiquei

Baixei com `curl` (UA de navegador), em 23/10/2026, todas com HTTP 200, as checagens de cada ocasião nas quatro agências que cobriram a campanha (Comprova não tem peça do período com fala atribuída a um lado):

| ocasião | Aos Fatos | Lupa | G1 Fato ou Fake | Estadão Verifica |
|---|---|---|---|---|
| debate da Band (18/10) | checamos-lula-flavio-bolsonaro-debate-band | ao-vivo-checagem-do-debate-entre-lula-e-flavio-bolsonaro-na-band | 2026/10/19 debate da Band | checamos-o-debate-entre-lula-e-flavio-na-band |
| Lula na Globo (15/10) | checamos-lula-globo-segundo-turno | 2026/10/15 entrevista de Lula na TV Globo | 2026/10/15 entrevista de Lula à Globo | entrevista-jn-globo-lula-checagem-verdadeiro-falso (15/10) |
| Flávio na Globo (16/10) | checamos-flavio-bolsonaro-globo-segundo-turno | 2026/10/16 entrevista de Flávio na Globo | 2026/10/16 entrevista de Flávio à Globo | flavio-bolsonaro-entrevista-tv-globo-eleicoes-2026-2-turno |
| Lula no JN (27/08) | checamos-entrevista-lula-globo | 2026/08/27 Lula ao JN | (não achei) | entrevista-jn-lula-checagem-verdadeiro-falso (27/08) |
| Flávio no JN (28/08) | checamos-flavio-bolsonaro-globo | 2026/08/28 Flávio ao JN | (não achei) | (não aberta) |

Rótulos lidos assim: Aos Fatos, atributo `data-stamp` do `blockquote` logo depois do trecho destacado (só conta trecho com selo; fala só transcrita não é checagem); Lupa, bloco `block-text` depois de cada citação; G1, a linha "A declaração é #..." de cada cartão; Estadão, "O Estadão Verifica checou e concluiu que: ...". Mapeamento e divergência como na skill: Falta contexto, Verdadeiro em partes, Subestimado, Exagerado, Impreciso e "não é bem assim" = enganoso; V contra F = fora; senão maioria; empate V/E = enganoso; empate F/E = falso.

## Os 8 itens que estavam fora do jogo

| id | lado | fala | agências e rótulos | votos | resultado | alcance |
|---|---|---|---|---|---|---|
| 0d095310 | esquerda | 78% da população endividada (Globo 15/10) | Aos Fatos verdadeiro; G1 #FATO; Estadão verdadeiro; Lupa Falta contexto | 3 V × 1 E | **verdadeiro** (maioria) | 3 |
| d07912c0 | esquerda | sétima economia do mundo em 2010 (Globo 15/10) | Aos Fatos verdadeiro; Lupa Verdadeiro; G1 #FATO (parte da economia); Estadão "verdadeiro em partes" (fala inteira, com os 22 milhões de empregos) | 3 V × 1 E | **verdadeiro** (maioria) | 3 |
| 09406cc5 | esquerda | US$ 30 bi ao FMI e US$ 270 bi de reservas (Band) | Aos Fatos verdadeiro; Estadão verdadeiro; G1 #FATO (parte do FMI); Lupa Subestimado (reservas: foram US$ 288,6 bi) | 3 V × 1 E | **verdadeiro** (maioria) | 3 |
| 912298e6 | direita | dívida de R$ 11 trilhões (Band) | G1 #FATO; Aos Fatos verdadeiro; Lupa Verdadeiro | 3 V | **verdadeiro** (unânime) | 3 |
| ce1109ff | direita | penduricalhos de R$ 24 bi (Globo 16/10) | G1 #FATO; Estadão Falta contexto (R$ 24,3 bi é só a elite jurídica; comissão do STF estima R$ 9,8 bi no total) | 1 V × 1 E | **enganoso** (empate V/E) | 3 |
| b96d3fc1 | direita | Lei Antifacção, 80 anos de prisão (Band) | Estadão enganoso; Lupa Falta contexto | 2 E | **enganoso** (unânime) | 3 |
| fb1c8e61 | esquerda | 22 milhões de empregos em oito anos (Globo 15/10) | Aos Fatos não é bem assim; G1 #NÃOÉBEMASSIM; Lupa Exagerado; Estadão verdadeiro em partes | 4 E | **enganoso** (unânime) | 3 |
| 7bb5f029 | direita | recorde de empresas fechadas (Band) | Aos Fatos falso; G1 #FAKE; Estadão Falta contexto | 2 F × 1 E | **falso** (maioria) | 3 |

Observações por item:

- 912298e6: a `observacao` antiga dizia que o Estadão deu "falta contexto", mas o Estadão não checou essa fala no debate; o "falta contexto" é da versão dita na entrevista à Globo de 16/10 (outra ocasião). Na Band, as três agências que checaram dizem verdadeiro.
- 09406cc5: a `citacao` era a paráfrase do Estadão ("Quando Lula assumiu..."), não a fala. Troquei pela fala literal na transcrição do Aos Fatos, que passou a ser a fonte (2026-10-18).
- b96d3fc1: a `citacao` era a paráfrase do Estadão. Troquei pela fala literal da Lupa ("A Lei Antifacção que nós aprovamos, os líderes dessas organizações vão ficar até 80 anos presos"), fonte Lupa (2026-10-18), e o `texto` ganhou o "até" que está na fala.
- 7bb5f029: a `citacao` "[Lula deixa] recorde de empresa fechada." não passava no `conferir-citacoes` por causa do colchete; virou "E um monte de recorde negativo: [...] recorde de empresa fechada,", literal no Aos Fatos.
- Lupa e Aos Fatos não checaram os penduricalhos (o Aos Fatos transcreve a fala sem selo); Aos Fatos e G1 não checaram a Lei Antifacção (o Aos Fatos transcreve sem selo); a Lupa não checou empresas fechadas.

## Alcance dos 45

Critério: 3 = debate ou TV nacional e duas ou mais agências na mesma fala e ocasião; 2 = debate ou TV nacional e uma agência; 1 = o resto.

### Alcance 3 (27)

| id | lado | veredito | fala | agências (mesma ocasião) |
|---|---|---|---|---|
| 5fdfac58 | esquerda | verdadeiro | inflação de alimentos (Band) | Aos Fatos, G1, Lupa |
| 9ffc66a8 | esquerda | verdadeiro | licença-maternidade na Alerj (Band) | G1 #FATO, Aos Fatos V, Lupa V, Estadão V |
| aa857dcd | esquerda | falso | maior demarcação de terras indígenas (Band) | G1 #FAKE, Aos Fatos falso |
| ad602974 | esquerda | falso | não conhece Roberta Luchsinger (JN 27/08) | Aos Fatos falso, Lupa Falso, Estadão falso |
| 3d13028f | esquerda | enganoso | casa de R$ 10 milhões (Band) | Aos Fatos não é bem assim, Estadão exagerado |
| fbf784ba | direita | verdadeiro | veto à saidinha (Band) | G1 #FATO, Lupa Verdadeiro |
| 523042a9 | direita | falso | R$ 7 bi em viagens com Janja (Band) | Aos Fatos, Lupa, G1 falso; Estadão enganoso |
| b430643c | direita | enganoso | Bolsa Família de R$ 600 (Band) | G1 #NÃOÉBEMASSIM, Lupa Exagerado |
| 3c13f8ef | esquerda | verdadeiro | R$ 3,5 bi devolvidos (Band) | Estadão V, Aos Fatos V |
| 0d095310 | esquerda | verdadeiro | 78% endividados (Globo) | ver acima |
| cb76e4b6 | esquerda | verdadeiro | dez ministérios desmontados (Globo 15/10) | Aos Fatos V, G1 #FATO, Lupa V |
| d07912c0 | esquerda | verdadeiro | sétima economia (Globo) | ver acima |
| 6bf3e590 | esquerda | enganoso | -9% com EUA, +20% com China (Globo 15/10) | Aos Fatos e G1 não é bem assim; Lupa Exagerado (20% China); Estadão exagerado |
| 09406cc5 | esquerda | verdadeiro | FMI e reservas (Band) | ver acima |
| 912298e6 | direita | verdadeiro | R$ 11 trilhões (Band) | ver acima |
| 068625bc | direita | falso | PF não foi atrás do filho de Lula (Band) | G1 #FAKE, Aos Fatos falso |
| 125e9fc9 | direita | falso | Dino na Maré sem segurança (Globo 16/10) | Aos Fatos falso, Lupa Falso |
| 0458cba4 | direita | falso | áudio de Vorcaro confirmado pela PF (Globo 16/10) | Aos Fatos falso, G1 #FAKE, Lupa Falso |
| ce1109ff | direita | enganoso | penduricalhos (Globo) | ver acima |
| b96d3fc1 | direita | enganoso | Lei Antifacção (Band) | ver acima |
| 483d6a7b | esquerda | verdadeiro | MEI e 17,5 milhões (Band) | Estadão V, Aos Fatos V, G1 #FATO |
| fb1c8e61 | esquerda | enganoso | 22 milhões de empregos (Globo) | ver acima |
| b2d99249 | direita | falso | nunca quis tirar o código das munições (Band) | Estadão falso, Aos Fatos falso, G1 #FAKE |
| bf0bc02b | direita | falso | emprego a condenados do Mensalão (Band) | Estadão falso, Aos Fatos falso |
| 7bb5f029 | direita | falso | recorde de empresas fechadas (Band) | ver acima |
| cbfe2cc3 | esquerda | verdadeiro | PM do caso Ana Clara (Band) | Aos Fatos V, G1 #FATO ([G1](https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/19/veja-o-que-e-fato-ou-fake-nas-falas-de-flavio-bolsonaro-e-lula-no-debate-da-band-no-2o-turno-das-eleicoes-2026.ghtml)) |
| 6938e526 | direita | falso | Adriano da Nóbrega "nada contra ele" (JN 28/08) | Aos Fatos falso, Lupa Falso |

Em todos os que subiram para 3, a `explicacao` passou a abrir com as agências e seus rótulos.

### Alcance 2 (9): debate ou TV, uma agência

| id | lado | fala | agência | por que não 3 |
|---|---|---|---|---|
| 392ba64f | esquerda | todo aposentado foi ressarcido (JN 27/08) | Estadão enganoso | o selo do Aos Fatos na mesma passagem é da frase seguinte (quadrilha de 2019) |
| 0e702aab | direita | recorde de mulher espancada (Band) | Aos Fatos V | o G1 checou "recorde de mulher assassinada", outra fala |
| 9f37b191 | direita | indústrias indo para o Paraguai (Globo 16/10) | Aos Fatos falso | nenhuma outra checou |
| 0386e511 | direita | não poupou os aposentados (Band) | Aos Fatos não é bem assim | nenhuma outra checou |
| 8b01a7f6 | esquerda | PEC da Transição (Globo 15/10) | Aos Fatos V | nenhuma outra checou nesta ocasião |
| 226b7d8c | esquerda | Bolsonaro mentia 11 vezes por dia (Band) | Estadão exagerado | **diverge da tabela aprovada (3)**: só o Estadão checou; o Aos Fatos transcreve a frase sem selo, Lupa e G1 não a checaram |
| 3715fbb7 | direita | recordista em criminalidade (Globo 16/10) | Aos Fatos falso | nenhuma outra checou nesta ocasião |
| b8b388ad | esquerda | "conseguimos aprovar tudo" (Globo 15/10) | Aos Fatos não é bem assim | o G1 deu #NÃOÉBEMASSIM a outra frase da mesma entrevista ("aprovamos 99% de tudo [...]"); tratei como fala diferente. Se o dono considerar a mesma, sobe para 3 |
| 01702d43 | direita | PT governou 20 dos últimos 24 anos (Band) | Estadão exagerado | o Aos Fatos transcreve sem selo |

### Alcance 1 (9)

4372b28f, b36811f1, a88285e0 (podcast Flow); 6b98ca43, d8286620, 66c41a5f (live); 4998ed8f, 641a29c1 (posts); 5fc452a2 (fala avulsa de 16/09).

## Outras correções de fonte e citação

Para cada item alterado passar no `conferir-citacoes`:

- 3c13f8ef e bf0bc02b: fonte passa do Estadão (paráfrase) para o Aos Fatos, que tem a fala literal (2026-10-18).
- 483d6a7b: fonte passa para o G1, de onde a `citacao` já era copiada (2026-10-19).
- b2d99249: fonte G1 e `citacao` literal do G1 ("[Eu] Nunca quis tirar nada disso [código de rastreamento de munições].").
- cb76e4b6, 0458cba4, 0e702aab: tirei o colchete de glosa da `citacao`, que ficou só com a fala literal do Aos Fatos.
- 226b7d8c e 01702d43 seguem com AVISO no `conferir-citacoes --todas`: a única fonte é o Estadão, que parafraseia.

## Contagem depois (todos no jogo, nenhum fora)

| | verdadeiro | falso | enganoso |
|---|---|---|---|
| direita | 4 | 14 | 5 |
| esquerda | 11 | 5 | 6 |

## Validação

- `npm test`: 49 arquivos, 495 testes passando. Um teste de `/afirmacoes` exigia ao menos um item fora do jogo; ajustei para aceitar a seção vazia.
- `npx tsx scripts/verificar-fontes.ts`: 45 OK.
- `npx tsx scripts/conferir-citacoes.ts --todas`: 43 OK, 2 AVISO (só Estadão, acima). Com `BASE_REF=origin/main` o script quebra: o pool da `main` não tem `alcance` e o esquema novo o recusa; rodei com `--todas` e com `BASE_REF=ea09c6f` (29 alterados, todos OK).
- `npx tsx scripts/validar-revisao.ts`: com `origin/main`, mesmo problema do esquema; com `BASE_REF=ea09c6f`, "OK: 0 novas, 29 alteradas".

## Task 3: merge da main e lote da varredura (tudo que cabe nas regras)

Decisão do dono: entra tudo o que cabe nas regras publicadas, não só ~30.

### Merge da main (PR #47)

Os 16 virais do lado de Flávio (4 V, 2 E, 10 F) entraram sem `alcance`; todos ficaram com `alcance: 1` (posts, lives e comício; nenhum é debate ou TV nacional; 9c86cda9 e 7a23af63, também checados pelo Aos Fatos, e 50b79160, também pelo Estadão, seguem 1 porque a ocasião não é debate nem TV).

### Lote

Preparado em três frentes, cada uma com a citação conferida, literal, na página da `fonte_url` e o veredito pela regra da maioria. Antes de anexar, conferi de novo `id`, `texto` e `citacao` (normalizados como no teste) contra o pool já com os 16 da PR #47: nenhuma repetição.

| lote | itens | verdadeiro | enganoso | falso | alcance 3 / 2 / 1 |
|---|---|---|---|---|---|
| direita (debate, JN, Globo, live, pronunciamento, falas avulsas) | 63 | 5 | 21 | 37 | 28 / 25 / 10 |
| esquerda (debate, JN, Globo, Flow, falas avulsas) | 45 | 17 | 21 | 7 | 27 / 9 / 9 |
| esquerda, virais (comício, ONU, posts, anúncio) | 14 | 6 | 6 | 2 | 0 / 1 / 13 |
| **total** | **122** | 28 | 48 | 46 | 55 / 35 / 32 |

Pela regra nova entraram candidatos que a varredura dava como "fora" ou "duvidoso": na esquerda, as seis linhas "fora" e as duas "duvidosas" (por exemplo 84e1ab92 e 015f50ee, 2 V × 1 E = verdadeiro; 59fbe7ad, 28506065 e 64903478, empate V/E = enganoso; 311499c1, 1 V × 2 E = enganoso); na direita, quatro (8ecc47f3, f0fe3e98, 0aa8cac6 e 76505a59, todos enganoso). Nenhum candidato caiu por citação ausente da página.

### Fora do lote

| candidato | motivo |
|---|---|
| "não tinha nada contra ele" (Nóbrega, JN) | já no pool (6938e526) |
| "Essa homenagem foi feita há mais de 20 anos" (JN; Lupa Verdadeiro) | decisão do dono: o G1 checou essa frase junto com a de 6938e526 numa só citação (#NÃOÉBEMASSIM), mirando a outra; pela regra estrita daria enganoso para uma frase que a Lupa confirma |
| dívida de R$ 11 trilhões (Globo 16/10) | mesma alegação de 912298e6 (debate) |
| "O debate da Globo foi censurado" (live, Lupa Falso) | mesma alegação e ocasião de d8286620 |
| "Eu tenho um irmão exilado" (live); "o único agente público que foi para os EUA" (JN); prontuário eletrônico (Globo); "350 bilhões" (debate e 04/10); "não foi encontrada uma arma" (Globo) | mesma alegação de uma versão que entrou; a `explicacao` da versão escolhida cita as outras |
| Daniella Marques, "recorde de falência" | fora da seção da varredura; repete o tema de 7bb5f029 |
| "policial que matou uma criança de 5 anos" (debate) | já no pool (cbfe2cc3) |
| "só voltou a crescer acima de 3%" (debate, JN) | já no pool na versão do Flow (a88285e0) |
| déficit de 2,8% na Globo (15/10) | Aos Fatos verdadeiro × Lupa, G1 e Estadão falso: V contra F, fora (a versão do debate, só falsos, entrou) |
| superávit de 0,1% no debate; perdão de R$ 12,7 bi dos MEIs na Globo | mesma afirmação de uma versão que entrou (Globo e debate, respectivamente) |
| V1, diplomas no comício (virais da esquerda) | mesma afirmação de 0b57e8ba (JN, alcance 3) |
| E6, Moraes e Marielle (virais da esquerda) | `citacao` idêntica à de b9ce7b4e |
| ca503f1e, "primeira reforma do Judiciário" (15/09, Aos Fatos não é bem assim) | decisão do dono, depois do lote: afirmação idêntica à de f1011d11 (Globo 15/10, alcance 3); uma ocasião por afirmação quando ela é idêntica. A `explicacao` de f1011d11 cita a ocasião de 15/09 e o rótulo do Aos Fatos |

### Rulings das revisões

- 226b7d8c: a `explicacao` abre com o Estadão Verifica e o rótulo ("exagerado"); continua a única fonte (o Aos Fatos transcreve sem selo).
- d07912c0: `citacao` sem colchete, a frase literal com selo no Aos Fatos: "A gente era a sétima economia do mundo."
- 6938e526: a `explicacao` cita o G1 (#NÃOÉBEMASSIM, numa citação que junta esta frase à da homenagem); segue falso pela maioria (Aos Fatos e Lupa falso).
- 523042a9 (Estadão enganoso) e 7bb5f029 (Estadão falta contexto): a `explicacao` já citava o Estadão e o rótulo desde a Task 2; sem mudança.
- 01702d43: a `explicacao` abre com o Estadão Verifica e o rótulo ("exagerado", conferido na página do debate); continua a única fonte.
- b96d3fc1: na página da Lupa do debate (baixada em 23/10, HTTP 200), "A Lei Antifacção que nós aprovamos, os líderes dessas organizações vão ficar até 80 anos presos" é atribuída a "Flávio Bolsonaro (PL), candidato à Presidência"; a fala de Lula sobre a lei é outra ("Eu já fiz a Lei Antifacção, ela foi aprovada...", 84e1ab92). Sem mudança.

### Contagem final (183 itens, todos no jogo)

| | verdadeiro | falso | enganoso |
|---|---|---|---|
| direita | 13 | 61 | 28 |
| esquerda | 34 | 14 | 33 |

Alcance: 3 = 82 (41 de cada lado), 2 = 44 (direita 30, esquerda 14), 1 = 57 (direita 31, esquerda 26).

### Base tolerante a mudança de esquema

`compararPools` lê o pool de antes com um esquema que só exige `id` e `lado` (`lerPoolDeAntes`), e `validar-revisao` e `conferir-citacoes` usam o mesmo leitor: com `BASE_REF=origin/main` os dois rodam mesmo com a main sem `alcance`.

### Validação

- `npm run lint`, `npm run typecheck`: limpos. `npm test`: 52 arquivos, 661 testes passando.
- `npx tsx scripts/verificar-fontes.ts`: 184 OK (rodado antes da remoção de ca503f1e; nenhuma fonte nova depois).
- `BASE_REF=origin/main npx tsx scripts/validar-revisao.ts`: só os problemas de volume esperados num lote humano ("122 novas, limite 6", "59 novas à esquerda", "63 novas à direita"); nenhum removido, nenhum lado mudou, nenhum id inválido.
- `BASE_REF=origin/main npx tsx scripts/conferir-citacoes.ts`: 183 conferidas (todas mudaram, porque ganharam `alcance`), 181 OK; AVISO só em 226b7d8c e 01702d43, os dois com o Estadão como única fonte.
