# Auditoria de fatos das 43 afirmações (2026-10-23)

Escopo: `src/data/afirmacoes.json` (43 itens, incluindo os com `observacao`), conferido contra as regras de `src/app/como-escolhemos/page.tsx`. Nenhum arquivo do jogo foi alterado.

Como verifiquei: baixei as 13 URLs distintas de `fonte_url` (todas responderam HTTP 200 em 2026-10-23) e li o texto. Nas páginas do Aos Fatos, o rótulo veio do atributo `data-stamp` de cada checagem (`verdadeiro` / `falso` / `nao_e_bem_assim`). Para conferir o que as `explicacao` e `observacao` dizem sobre outras agências, baixei também:
- Lupa, debate da Band: https://www.agencialupa.org/checagem/2026/10/18/ao-vivo-checagem-do-debate-entre-lula-e-flavio-bolsonaro-na-band/
- Estadão Verifica, entrevista de Lula à Globo (15/10): https://www.estadao.com.br/estadao-verifica/entrevista-jn-globo-lula-checagem-verdadeiro-falso/
- Estadão Verifica, entrevista de Flávio à Globo (16/10): https://www.estadao.com.br/estadao-verifica/flavio-bolsonaro-entrevista-tv-globo-eleicoes-2026-2-turno/

Legenda: **verificado** = li na URL citada; **não verificado** = não encontrei a fonte.

Severidade:
- **A**: corrigir antes de compartilhar
- **B**: deveria corrigir
- **C**: cosmético

## Tabela-resumo

Fontes abreviadas: AF = Aos Fatos, G1 = G1 Fato ou Fake, EV = Estadão Verifica.

| id | lado | veredito | fonte OK? | veredito bate? | problema? |
|---|---|---|---|---|---|
| 5fdfac58 | esq | verdadeiro | sim (AF VERDADEIRO) | sim | não |
| 9ffc66a8 | esq | verdadeiro | sim (G1 #FATO) | sim | **B**: "de 49 deputados" contradito pelo AF (54 a 1) |
| aa857dcd | esq | falso | sim (G1 #FAKE) | sim | não |
| ad602974 | esq | falso | sim (AF FALSO) | sim | não |
| 3d13028f | esq | enganoso | sim (AF NÃO É BEM ASSIM) | sim | não |
| 392ba64f | esq | enganoso | sim (EV enganoso) | sim | **B**: citação é paráfrase |
| 0e702aab | dir | verdadeiro | sim (AF VERDADEIRO) | sim | não |
| fbf784ba | dir | verdadeiro | sim (G1 #FATO) | sim | não |
| 9f37b191 | dir | falso | sim (AF FALSO) | sim | não |
| 523042a9 | dir | falso | sim (AF FALSO) | sim (maioria falso) | não |
| b430643c | dir | enganoso | sim (G1 #NÃOÉBEMASSIM) | sim | não |
| 0386e511 | dir | enganoso | sim (AF NÃO É BEM ASSIM) | sim | não |
| 3c13f8ef | esq | verdadeiro | sim (EV verdadeiro) | sim | **B**: citação é paráfrase |
| 8b01a7f6 | esq | verdadeiro | sim (AF VERDADEIRO) | sim | não |
| 0d095310 | esq | verdadeiro (fora) | sim (AF VERDADEIRO) | n/a | C: parte da `observacao` não verificada |
| 4372b28f | esq | verdadeiro | sim (AF VERDADEIRO) | sim | C: falta a ressalva de método |
| cb76e4b6 | esq | verdadeiro | sim (AF VERDADEIRO) | sim | não |
| b36811f1 | esq | falso | sim (AF FALSO) | sim | não |
| a88285e0 | esq | falso | sim (AF FALSO) | sim | não |
| d07912c0 | esq | verdadeiro (fora) | sim (AF VERDADEIRO) | n/a | não (`observacao` verificada) |
| 6bf3e590 | esq | enganoso | sim (AF NÃO É BEM ASSIM) | sim | não |
| 226b7d8c | esq | enganoso | sim (EV exagerado) | sim | **B**: citação é paráfrase |
| 09406cc5 | esq | verdadeiro (fora) | sim (EV verdadeiro) | n/a | C: citação é paráfrase |
| 912298e6 | dir | verdadeiro (fora) | sim (G1 #FATO) | n/a | C: a `observacao` mistura duas ocasiões |
| 068625bc | dir | falso | sim (G1 #FAKE) | sim | não |
| 6b98ca43 | dir | falso | sim (AF FALSO) | sim | **A**: texto "tigrinho" fica onde a checagem é mais contestável |
| d8286620 | dir | falso | sim (AF FALSO) | sim | C: omite as decisões judiciais no cancelamento |
| 125e9fc9 | dir | falso | sim (AF FALSO) | sim | não |
| 0458cba4 | dir | falso | sim (AF FALSO) | sim | não |
| ce1109ff | dir | verdadeiro (fora) | sim (G1 #FATO) | n/a | não (`observacao` verificada) |
| 3715fbb7 | dir | falso | sim (AF FALSO) | sim | não |
| b96d3fc1 | dir | enganoso (fora) | sim (EV enganoso) | n/a | C: citação é paráfrase e omite "até" |
| 483d6a7b | esq | verdadeiro | sim (EV verdadeiro) | sim | **B**: citação é paráfrase |
| 5fc452a2 | esq | falso | sim (AF FALSO) | sim | C: `autor` sem local nem data |
| fb1c8e61 | esq | enganoso (fora) | sim (AF NÃO É BEM ASSIM) | n/a | não (`observacao` verificada) |
| b8b388ad | esq | enganoso | sim (AF NÃO É BEM ASSIM) | sim | não |
| 66c41a5f | dir | verdadeiro | sim (AF VERDADEIRO) | sim | não |
| b2d99249 | dir | falso | sim (EV falso) | sim | não |
| 01702d43 | dir | enganoso | sim (EV exagerado) | sim | **B**: citação é paráfrase |
| 4998ed8f | dir | falso | sim (AF FALSO) | sim | não |
| bf0bc02b | dir | falso | sim (EV falso) | sim | **B**: generalização contradita pelo AF; citação é paráfrase |
| 7bb5f029 | dir | falso | sim (AF FALSO) | **não** pela regra de divergência (EV "falta contexto") | **A**: deveria estar fora do jogo; "25 vezes" sem fonte |
| 641a29c1 | dir | falso | sim (Lupa FALSO) | sim | **A**: citação atribuída a Flávio não é dele e foi alterada |

Totais: **26 OK** · **3 A** · **7 B** · **7 C**.

Nenhuma URL está morta. Nenhuma URL trata de outro assunto. Todos os rótulos das agências citadas cabem no veredito do jogo.

---

## Itens com problema

### A1. 641a29c1: vídeo de mulher com suposta droga (Lupa)
Fonte (verificado): https://www.agencialupa.org/eleicoes/2026/10/12/video-de-mulher-com-suposta-droga-nao-e-de-ato-pro-lula-em-sp/ (rótulo FALSO).

**Atribuição errada.** A frase da `citacao` é a "Legenda de post no Instagram, com 30 mil visualizações". A Lupa não diz de quem é esse post e não a atribui a Flávio. O que a Lupa diz de Flávio é outra coisa: ele "publicou as imagens do deputado federal eleito pelo Rio Grande do Sul, Rony Gabriel, que usou o vídeo para criticar o ato pró-Lula, associando o vídeo a cenas de vandalismo e depredação". O `autor` também afirma que a postagem de Flávio foi "no Instagram", e a Lupa não diz a plataforma.

**Citação alterada.** O original diz "teriam consumido substâncias **supostamente** ilícitas neste domingo (11)". O colchete do jogo virou "[teriam consumido substâncias ilícitas durante o ato...]". Tirar o "supostamente" deixa a frase mais forte do que a original.

**Explicação.** "A legenda no Instagram teve cerca de 30 mil visualizações": com o `autor` atual, o leitor entende que o post é de Flávio, e não é. "Tarcísio de Freitas (Republicanos) também publicou vídeo criticando o ato": a Lupa só cita o UOL e não diz que Tarcísio usou o vídeo falso. A frase envolve um terceiro sem necessidade (neutralidade).

**Correção sugerida:**
- `citacao`: usar a legenda literal, com o "supostamente".
- `autor`: "Post nas redes, compartilhado por Flávio Bolsonaro (PL) ao repostar o deputado federal eleito Rony Gabriel, segundo a Lupa".
- `explicacao`: tirar a frase das 30 mil visualizações (ou dizer "um dos posts com a alegação teve 30 mil visualizações") e tirar a frase sobre Tarcísio.

### A2. 7bb5f029: "recorde de empresa fechada" (Aos Fatos)
Fontes:
- Aos Fatos, FALSO (verificado): https://www.aosfatos.org/noticias/checamos-lula-flavio-bolsonaro-debate-band/
- G1, #FAKE (verificado): https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/19/veja-o-que-e-fato-ou-fake-nas-falas-de-flavio-bolsonaro-e-lula-no-debate-da-band-no-2o-turno-das-eleicoes-2026.ghtml
- Estadão Verifica, **"falta contexto"** (verificado): https://www.estadao.com.br/estadao-verifica/checamos-o-debate-entre-lula-e-flavio-na-band/

O Estadão diz que "a série histórica anual do DataSebrae aponta um aumento de CNPJs baixados no atual governo", ao lado de um recorde de aberturas: 2,8 milhões de CNPJs encerrados em 2025 e 5,1 milhões abertos.

O problema é de consistência com a regra publicada. "Falta contexto" não está entre os rótulos aceitos. O próprio arquivo já tira do jogo, por esse mesmo motivo, os itens b96d3fc1 (enganoso × "falta contexto"), 912298e6, ce1109ff e 0d095310. Também é um risco de reputação: "empresa fechada" pode ser lida como CNPJ baixado, e por esse critério houve aumento. As agências falam de falências.

Além disso, a `explicacao` diz "Flávio repetiu a afirmação ao menos 25 vezes em 2026". Esse número **não aparece em nenhuma das páginas** que baixei. Não achei a fonte na busca: **não verificado**.

**Correção sugerida:** adicionar `observacao` ("Fora do jogo: Aos Fatos e G1 dizem falso e o Estadão Verifica diz 'falta contexto'.") e tirar a frase das "25 vezes". Se o item sair, conferir se a composição de rodadas do lado direita/falso continua cumprível com o pool que sobra.

### A3. 6b98ca43: "pai do tigrinho" (Aos Fatos)
Fonte (verificado): https://www.aosfatos.org/noticias/checamos-live-flavio-bolsonaro/ (FALSO). A explicação do jogo reproduz fielmente a da agência: bets legalizadas em 2018 por Temer, sem regulamentação; regulamentação pela Lei 14.790/2023, no governo Lula.

O risco está no `texto`, que reescreve a fala como "responsável pela liberação do 'jogo do tigrinho'". O "tigrinho" não é aposta esportiva, é um jogo de cassino on-line. A Lei 14.790/2023, sancionada por Lula, incluiu os "jogos on-line" (cassino) entre as modalidades autorizadas; a lei de 2018 tratava de apostas de quota fixa. Essa informação é **não verificada** na fonte da agência. Vem de reportagens achadas em busca, por exemplo https://www.moneytimes.com.br/pl-das-apostas-esportivas-preve-regulamentacao-de-polemico-jogo-do-tigrinho/ e https://sbtnews.sbt.com.br/noticia/politica/jogo-do-tigrinho-pode-ser-legalizado-no-brasil-com-a-aprovacao-do-projeto-dos-cassinos.

Ou seja, o jogo afirma como "mentira" justamente o ponto em que a checagem é mais fácil de contestar. A regra do jogo é seguir a agência, então o veredito em si não está "errado". Mas o item é o mais vulnerável do lado direita.

**Correção sugerida, uma das duas:**
- (a) Tirar do jogo com `observacao`. É o mais seguro.
- (b) Trocar o `texto` para o enquadramento da agência ("Lula é o responsável pela liberação das bets, as apostas on-line, no Brasil") e manter a explicação.

### B1. 9ffc66a8: licença-maternidade na Alerj (G1)
- G1 #FATO (verificado): diz março de 2009, PEC 04/2007, Flávio "foi o único a declarar voto contrário"; não confirma o número 49.
- Aos Fatos VERDADEIRO (verificado): diz "maio de 2009", "A PEC 4/09 foi aprovada com 54 votos a favor e 1 contrário".
- Estadão e Lupa: verdadeiro (verificado).

O `texto` afirma como verdade que ele "foi o único de 49 deputados". O Aos Fatos indica 55 votantes. A data também diverge entre as agências (março × maio).

**Correção:** `texto`: "Em 2009, na Alerj, Flávio Bolsonaro, então deputado estadual, foi o único a votar contra a ampliação da licença-maternidade das servidoras." O "49" fica só na `citacao`, que é a fala de Lula. Na `explicacao`, trocar "Em março de 2009" por "Em 2009".

### B2. bf0bc02b: condenados do Mensalão (Estadão Verifica)
Fontes:
- Estadão Verifica, falso (verificado): https://www.estadao.com.br/estadao-verifica/checamos-o-debate-entre-lula-e-flavio-na-band/. Nomeia José Dirceu e Delúbio Soares, que "não foram eleitos".
- Aos Fatos, FALSO (verificado): https://www.aosfatos.org/noticias/checamos-lula-flavio-bolsonaro-debate-band/. Diz: "Dirceu, Soares e Cunha concorreram às eleições deste ano pelo PT, mas só o último conseguiu uma vaga na Câmara".

A `explicacao` do jogo generaliza: "petistas condenados que se candidataram a deputado federal e não foram eleitos". Pelo Aos Fatos, João Paulo Cunha foi eleito.

A `citacao` é a paráfrase do Estadão ("O que Flávio disse: que..."). A fala literal, pelo Aos Fatos: "Você está dando emprego para um monte de cara que foi condenado por corrupção no Mensalão."

**Correção:**
- `explicacao`: "...apoio declarado do presidente a petistas condenados no caso, como José Dirceu e Delúbio Soares, que se candidataram a deputado federal e não foram eleitos."
- `citacao`: a literal acima.

### B3. Citações que são paráfrases do Estadão (3c13f8ef, 226b7d8c, 483d6a7b, 01702d43, 392ba64f)
O site mostra a `citacao` entre aspas, como fala literal (`src/components/PainelVeredito.tsx:116` e `src/app/afirmacoes/page.tsx:23`). Nesses itens, porém, o texto é a reconstrução do "O que Lula/Flávio disse: que..." do Estadão. Os vereditos e explicações estão corretos; o problema é apresentar paráfrase como fala literal.

Falas literais encontradas (verificado nas transcrições):

| id | fala literal | fonte |
|---|---|---|
| 3c13f8ef | "já pagamos R$ 3 bilhões e meio aos aposentados." | transcrição do Aos Fatos, debate da Band |
| 226b7d8c | "O pai dele mentia 11 vezes por dia." | transcrição do Aos Fatos, fala de Lula |
| 483d6a7b | "Nós criamos o MEI [...]. Nós temos hoje 17,5 milhões de MEIs." | G1 |
| 01702d43 | "O PT já governa esse país há 20 anos dos últimos 24." | transcrição do Aos Fatos, fala de Flávio |
| 392ba64f | "Não tem um aposentado que foi roubado e que não foi devolvido o dinheiro." | transcrição do Aos Fatos, entrevista de 27/08 à Globo |

Para 392ba64f, a transcrição está em https://www.aosfatos.org/noticias/checamos-entrevista-lula-globo/.

**Correção:** trocar a `citacao` pela fala literal. Em 226b7d8c, a citação pode ficar "[Jair Bolsonaro] mentia 11 vezes por dia". O `texto` pode continuar como está.

### C1. 09406cc5 e b96d3fc1 (fora do jogo): mesma questão de paráfrase
Esses itens aparecem em /afirmacoes. Em b96d3fc1 a fala literal é "com a lei antifacção que nós aprovamos, os líderes dessas organizações vão ficar **até** 80 anos presos" (Aos Fatos e Lupa, verificado). O `texto` e a `citacao` omitem o "até".

### C2. 912298e6 (fora do jogo): a `observacao` mistura duas ocasiões
G1, Aos Fatos e Lupa checaram a fala do debate da Band e disseram verdadeiro (verificado). O "falta contexto" do Estadão é sobre outra fala, da entrevista de Flávio à Globo em 16/10 ("a dívida pública do Brasil está em R$ 11 trilhões"; verificado em https://www.estadao.com.br/estadao-verifica/flavio-bolsonaro-entrevista-tv-globo-eleicoes-2026-2-turno/). O Estadão não checou essa frase no debate da Band. A exclusão é defensável, mas a `observacao` deveria dizer que a ressalva do Estadão foi sobre a mesma afirmação em outra entrevista. Pela regra, o item talvez pudesse até voltar ao jogo; a decisão é do dono.

### C3. 0d095310 (fora do jogo): `observacao` parcialmente não verificada
Aos Fatos verdadeiro e Estadão verdadeiro estão verificados. O "G1 verdadeiro" e o "Lupa falta contexto" são **não verificados**: não encontrei essas checagens.

### C4. 4372b28f: falta a ressalva de método
O Aos Fatos (https://www.aosfatos.org/noticias/checamos-entrevista-lula-ao-flow/) diz que o cálculo exclui o período 2015–2018 (Dilma 2 e Temer). A `explicacao` afirma "o menor percentual para o período equivalente de um mandato presidencial desde o início do Plano Real" sem essa ressalva. Sugestão: acrescentar "excluído o período 2015–2018, encurtado pelo impeachment".

### C5. d8286620: omite as decisões judiciais no cancelamento
O Aos Fatos diz: "Com a desistência de Flávio e as determinações judiciais, a Globo decidiu cancelar o debate." A `explicacao` atribui o cancelamento só à desistência. Sugestão: "com a desistência dele e as determinações judiciais, a emissora cancelou o debate."

### C6. 5fc452a2: `autor` sem local nem data
O `autor` é só "Lula (PT)". O Aos Fatos (https://www.aosfatos.org/noticias/lula-flavio-crise-stf/) data a fala de 16 de setembro de 2026, sem dizer onde foi. Sugestão: "Lula (PT), em 16 de setembro de 2026, segundo o Aos Fatos".

---

## Itens totalmente OK (26)

Em todos estes, a fonte abre e é da agência citada, o rótulo bate, a citação e a atribuição conferem e os números da explicação estão na fonte (verificado):

5fdfac58, aa857dcd, ad602974, 3d13028f, 0e702aab, fbf784ba, 9f37b191, 523042a9, b430643c, 0386e511, 8b01a7f6, cb76e4b6, b36811f1, a88285e0, d07912c0, 6bf3e590, 068625bc, 125e9fc9, 0458cba4, ce1109ff, 3715fbb7, fb1c8e61, b8b388ad, 66c41a5f, b2d99249, 4998ed8f.

Notas sobre alguns deles:
- **5fdfac58:** o que a explicação diz de outras agências está verificado. G1 #FATO e Lupa VERDADEIRO, com IPCA de 54,2% (jan/2019 a jul/2022) e 13,6% nos primeiros 43 meses.
- **523042a9:** verificado que Lupa e G1 dizem falso e o Estadão diz "enganoso" (475 mil pessoas, jan/2023 a mai/2026). A maioria diz falso, então o veredito segue a regra.
- **b430643c:** a Lupa também diz "exagerado" para as duas partes da fala, o que é coerente com enganoso.
- **3d13028f:** o Estadão diz "exagerado" e o G1 diz #NÃOÉBEMASSIM. Todos cabem em enganoso.
- **Itens com `observacao` verificada:**
  - d07912c0 e fb1c8e61: Estadão "verdadeiro em partes".
  - ce1109ff: Estadão "falta contexto".
  - b96d3fc1: Lupa "falta contexto".
  - 09406cc5: Lupa "subestimado".

---

## Aplicado em 2026-10-23

Nenhum `veredito` nem `data_checagem` mudou.

- **641a29c1 (A1):** `citacao` virou a legenda literal da Lupa, com o "supostamente"; `autor` passou a ser o post compartilhado por Flávio ao repostar Rony Gabriel, segundo a Lupa; na `explicacao`, "um dos posts com a alegação teve cerca de 30 mil visualizações" e saiu a frase sobre Tarcísio.
- **7bb5f029 (A2):** ganhou `observacao` (fora do jogo: Aos Fatos e G1 falso, Estadão Verifica "falta contexto"); saiu a frase das "25 vezes".
- **6b98ca43 (A3):** opção (b): `texto` no enquadramento da agência (bets, apostas on-line); explicação mantida.
- **9ffc66a8 (B1):** `texto` sem o "de 49 deputados"; `explicacao` diz "Em 2009" em vez de "Em março de 2009".
- **bf0bc02b (B2):** `citacao` literal do Aos Fatos; `explicacao` nomeia Dirceu e Delúbio em vez de generalizar.
- **3c13f8ef, 226b7d8c, 483d6a7b, 01702d43, 392ba64f (B3):** `citacao` trocada pela fala literal da tabela B3.
- **4372b28f (C4):** `explicacao` ganhou a ressalva "excluído o período 2015–2018, encurtado pelo impeachment".
- **d8286620 (C5):** `explicacao` cita a desistência e as determinações judiciais no cancelamento.
- **5fc452a2 (C6):** `autor` com a data, 16 de setembro de 2026, segundo o Aos Fatos.

Não aplicado:
- **09406cc5 (C1):** o relatório não traz a fala literal.
- **b96d3fc1 (C1):** item fora do jogo; a correção seria em `texto` e `citacao`, não na `observacao`, e ficou para o dono decidir.
- **912298e6 (C2):** o relatório não traz o texto exato da nova `observacao`; voltar ao jogo é decisão do dono.
- **0d095310 (C3):** o trecho em dúvida é **não verificado**, e o relatório não sugere o texto.

Pool depois da mudança: `npm run lint`, `npm run typecheck` e `npm test` verdes (46 arquivos, 405 testes), incluindo os testes de dados reais que conferem a primeira rodada e uma extra.
