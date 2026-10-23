# Varredura de virais do lado de Flávio Bolsonaro (23/10/2026)

Contrapartida da checagem dos reels de Lula: o que circula nos vídeos, reels, posts, lives e canais aliados de Flávio Bolsonaro (PL, Tropa do Flávio, Nikolas, Gayer, deputados do PL, site Direita Já) desde 01/08/2026, com checagem de agência. Debates e entrevistas de TV ficaram de fora (já estão na varredura anterior, `docs/superpowers/notes/2026-10-23-varredura-de-checagens.md` no commit e077dc9).

## Método

1. Li a skill `revisao-de-fatos`, os 45 itens de `src/data/afirmacoes.json` e a varredura anterior.
2. Busquei (WebSearch restrito por domínio) em Aos Fatos, Lupa, G1 Fato ou Fake e Comprova; Estadão pela página de listagem com `curl`. Também baixei as listagens: Lupa `/eleicoes/` (páginas 1 a 6) e `/verificacao/` (1 e 2; páginas 3 e 4 deram **HTTP 429**, não lidas), G1 `/fato-ou-fake/eleicoes/`, Estadão `/estadao-verifica/`, Aos Fatos `?tag=` flavio-bolsonaro, nikolas-ferreira, michelle-bolsonaro, eduardo-bolsonaro, jair-bolsonaro, pl.
3. Abri e li cerca de 70 páginas. Todas as citadas abaixo responderam 200 e estão salvas (HTML e TXT) nesta pasta (`varredura-direita/`, subpasta `lupa-batch/`).
4. Regra de lado: só entra como `direita` o que a agência liga a Flávio, à campanha, ao PL ou a aliado nominal (post, repost, live, canal oficial, anúncio). Posts anônimos pró-Flávio vão para uma lista à parte.
5. Rótulos: mapeamento da skill (verdadeiro / falso / enganoso; "Exagerado" conta como enganoso). "Falta contexto" e "Insustentável" ficam fora, como na varredura anterior.
6. Aos Fatos não mantém uma contagem de "mentiras de Flávio" com citações; o que existe são peças temáticas ("mentiu 25 vezes sobre falências", "43 vezes sobre Vorcaro"). A do dia 20/10 (falências) não traz nenhuma fala nova fora de debate, TV ou live.

Datas: a Lupa põe o comício de lançamento em 16/08 na checagem de 17/08 e em "16 de setembro" na checagem de 16/10 (ossos). O lançamento oficial da campanha foi 16/08; trato como 16/08 (**não verificado** fora da Lupa).

## Candidatos com checagem, prontos para entrar (lado `direita`)

Alcance: C = comício; L = live de Flávio (01/10); P = post ou reel de Flávio/PL/aliado; W = canal de WhatsApp Tropa do Flávio; A = anúncio pago.

| # | quem disse ou espalhou (e por quê é `direita`) | citação literal (como a agência transcreve) | rótulo → jogo | agência, data, URL | explicação curta | alcance | 2ª agência |
|---|---|---|---|---|---|---|---|
| V1 | Flávio Bolsonaro (PL), discurso de lançamento da campanha, Copacabana | "E o atual governo que ainda corta a verba das Forças Armadas, mais de R$ 4,2 bilhões." | Verdadeiro → **verdadeiro** | Lupa, 17/08 — https://www.agencialupa.org/noticias/2026/08/17/em-pontape-da-campanha-flavio-e-lula-cometem-erros-sobre-desempenho-de-gestoes-passadas/ | Houve contingenciamento de R$ 4,3 bi na Defesa em maio; a Lupa ressalva que é bloqueio, não corte definitivo. | C | não achei |
| V2 | Flávio Bolsonaro (PL), mesmo discurso | "São mais de 80 milhões […] de pessoas endividadas." | Verdadeiro → **verdadeiro** | Lupa, 17/08 — mesma URL | Serasa: 83,9 milhões de inadimplentes em julho. | C | não achei |
| V3 | Daniella Marques (PL), coordenadora econômica da campanha, na live de Flávio | "[O Brasil bateu]…recorde de carga tributária" | Verdadeiro → **verdadeiro** | Lupa, 01/10 — https://www.agencialupa.org/checagem/2026/10/01/ao-vivo-checagem-da-live-de-flavio-bolsonaro/ | Receita: 32,4% do PIB em 2025, maior da série. | L | não (o Aos Fatos checou só falas de Flávio na live) |
| V4 | Douglas Ruas (PL), candidato ao governo do RJ, na live de Flávio | "E aqui no Rio, Flávio, o meu adversário é o Eduardo Paes, que foi pego num grampo da Polícia Federal, se apresentando para o Lula como seu soldado" | Verdadeiro → **verdadeiro** | Lupa, 01/10 — mesma URL | Grampo da Lava Jato de 2016. Assunto regional; prioridade baixa. | L | não |
| E1 | Flávio Bolsonaro (PL), discurso de lançamento; a mesma alegação aparece num vídeo do PL no site Direita Já e no áudio do vídeo de ossos que Flávio e o PL postaram | "As pessoas em situação de rua que dobraram […], dobrou o número de pessoas em situação de rua" | Exagerado → **enganoso** | Lupa, 17/08 — URL do V1. Reforço: Lupa, 03/09 (reportagem do Direita Já) e 16/10 (ossos) | Cresceu cerca de 40% (Ipea/CadÚnico), ou 51% pela UFMG; não dobrou. | C, P | não achei |
| F1 | Flávio Bolsonaro (PL), discurso de lançamento | "Porque hoje todo mundo vê que Bolsonaro nunca foi ameaça pra democracia" | Falso → **falso** | Lupa, 17/08 — URL do V1 | Ataques ao STF e às urnas; condenação por tentativa de golpe. | C | não achei |
| F2 | Post do próprio Flávio Bolsonaro (PL) e de aliados no Instagram | "Histórico o bloco do 22, hoje, em Minas! A direita começou a ir pra rua no 2º turno" | Falso → **falso** | Aos Fatos, 16/10 — https://www.aosfatos.org/noticias/video-cirio-nazare-ato-flavio/ | O vídeo é do Círio de Nazaré, em Belém, de 10/10; o Aos Fatos diz: "O próprio candidato veiculou a desinformação". | P, 260 mil curtidas | não achei |
| F3 | Guilherme Derrite (PP), candidato ao Senado por SP, na live de Flávio; o mesmo boato aparece em anúncios pagos de deputados do PL (Coronel Alberto Feitosa, Anderson Moraes, Ramatis de Oliveira, Wagner Galardão) e aliados | "O mesmo presidente que acha normal o roubo de celular quando o indivíduo comete um crime para comprar uma cervejinha" (Lupa). Na versão do anúncio do PL: "Ainda tem um presidente da República que passa pano e diz que essas pessoas são vítimas da sociedade e que ela pode fazer isso para roubar um celular e tomar uma cervejinha" (Estadão, Feitosa) | Falso → **falso** | Lupa, 01/10 — URL do V3. Estadão Verifica, 22/10 — https://www.estadao.com.br/estadao-verifica/deputados-impulsionaram-anuncios-com-boato-falso-sobre-lula-e-roubo-de-celular/ | Vídeo de 2017 editado; Lula falava de desesperança e, em outro trecho, de torcidas tomando cerveja juntas. | L, A (4,6 milhões de impressões nos anúncios) | **sim**: Lupa e Estadão, os dois falso. A do Estadão é reportagem, não checagem com selo |
| F4 | Guilherme Derrite (PP), na live de Flávio; a narrativa saiu dos perfis do PL, de Nikolas Ferreira e Mário Frias (PL) e da Tropa do Flávio | "Tem um presidente da República que fala que as mulheres estão acostumadas a serem tocadas desde pequenas, desde garotas. Fazendo brincadeirinha, piadinha com meninas, [...] Fazendo piadinha com abusadores" | Falso → **falso** | Lupa, 01/10 — URL do V3 | Lula falava de exame ginecológico e de toque de próstata. | L, P, W | **sim**, para a narrativa: Aos Fatos 29/09 (https://www.aosfatos.org/noticias/lula-discursa-cancer-de-prostata-nao-sobre-defesa-pedofilia/) e Lupa 29/09 (https://www.agencialupa.org/eleicoes/2026/09/29/lula-nao-defendeu-nem-normalizou-a-pedofilia-em-discurso-no-para/), os dois falso. Tema sensível |
| F5 | Daniella Marques (PL), na live de Flávio | "[Nos últimos quatro anos, o Brasil bateu]…recorde de falência de empresas" | Falso → **falso** | Lupa, 01/10 — URL do V3 | Falências caíram de 823 (2023) para 686 (2025). | L | **sim**: o Aos Fatos de 20/10 cita a mesma fala de Daniella como mentira (https://www.aosfatos.org/noticias/flavio-bolsonaro-mente-recorde-falencias-empresas/). **Repete o tema** do item 7bb5f029, que já está no banco |
| F6 | Deputado e senador eleito Gustavo Gayer (PL-GO), em 08/10, repostado pela Tropa do Flávio (segundo o Aos Fatos de 14/10) | "Hoje, durante o lançamento da campanha de Eduardo Paes ao Governo do Estado, [...] Lula fez uma declaração que não poderia passar despercebida. Em sua própria fala, disse: 'a gente que não acredita em Deus'." | Falso → **falso** | Aos Fatos, 25/08 — https://www.aosfatos.org/noticias/lula-acredita-deus/ (a atribuição a Gayer e à Tropa está em https://www.aosfatos.org/noticias/tropa-do-flavio-mensagens-enganosas/) | Lula disse "há gente que não acredita em Deus". | P, W, 102,5 mil interações | a Lupa (13/10) descreve o corte como fora de contexto, sem selo próprio |
| F7 | Tropa do Flávio, canal de WhatsApp oficial da campanha (Lupa e Aos Fatos) | "Enquanto o Brasil celebra o feriado, trabalhadora limpa pichações deixadas após ato pró-Lula na Avenida Paulista." | Falso → **falso** | Lupa, 12/10 — https://www.agencialupa.org/eleicoes/2026/10/12/imagem-de-trabalhadora-limpando-pichacoes-na-paulista-foi-gerada-por-ia/ | Imagem gerada por IA a partir de foto da CPTM; postada sem aviso de IA. | W (1,5 milhão de inscritos), redes | **sim**: Aos Fatos 12/10 (https://www.aosfatos.org/noticias/imagem-de-trabalhadora-limpando-metro-na-paulista-foi-alterada-por-ia/) e G1 13/10 (#FAKE) |
| F8 | Tropa do Flávio, em 10/10 (segundo a Lupa de 13/10) | "O crime organizado já escolheu o dele / Marcola, chefão do PCC, confessa que Lula é o melhor para o crime organizado" | Falso → **falso** | Lupa, 15/10 — https://www.agencialupa.org/verificacao/2026/10/15/e-falso-que-marcola-tenha-declarado-voto-em-lula/ (atribuição: https://www.agencialupa.org/noticias/2026/10/13/tropa-do-flavio-canal-do-pl-ja-enviou-imagens-falsas-e-falas-editadas-de-lula/) | Áudio de 2022 sem declaração de voto; o TSE mandou remover. A checagem de 15/10 cita um post do Facebook; a ligação com a Tropa vem da reportagem de 13/10. | W, P | não achei |
| F9 | Deputado federal Zé Trovão (PL-SC) e outros parlamentares (segundo a Lupa) | "Campanha de Lula vira ritual de invocação" | Falso → **falso** | Lupa, 12/10 — https://www.agencialupa.org/jornalismo/2026/10/12/video-de-homem-cantando-ponto-de-umbanda-nao-foi-gravado-em-ato-de-lula-em-sp/ | O vídeo é da 4ª Marcha para Exu, de 16/08, não do ato pró-Lula de 11/10. | P | **sim**: G1 13/10 (#FAKE), que não cita quem postou. Tema de intolerância religiosa; avaliar o tom do `texto` |
| F10 | Nikolas Ferreira (PL-MG), story no Instagram (ele admitiu o repost e apagou) | "Caiu por terra a narrativa foi em menos de 24h: PF diz em relatório que não há indícios de crimes do deputado Nikolas Ferreira em conversa com Vorcaro." | Falso → **falso** | Lupa, 04/09 — https://www.agencialupa.org/jornalismo/2026/09/04/laudo-falso-atribuido-a-pf-sobre-dialogo-de-nikolas-e-vorcaro-foi-gerado-com-ia/ | A PF nega o documento; marca d'água da OpenAI. | P, 500 mil visualizações no X | **sim**: Aos Fatos 03/09 (https://www.aosfatos.org/noticias/falso-documento-pf-nikolas-vorcaro/) e Comprova 04/09, os dois falso |

Contagem: **4 verdadeiro, 1 enganoso, 10 falso** (15 itens). Do banco, só F5 repete um tema (7bb5f029).

### Checados, mas fora do jogo ou com lado frágil

- **Rótulo fora dos três**: o vídeo de ossos postado nos perfis de Flávio e do PL e na Tropa. "Lula prometeu picanha, mas entregou a fila do osso (…) Quem esperava picanha, ficou só no osso. Dá pra confiar?" Lupa, **Falta contexto**, 16/10 (https://www.agencialupa.org/verificacao/2026/10/16/videos-de-doacao-de-ossos-em-fortaleza-circulam-fora-de-contexto-e-nao-tem-relacao-com-o-governo-lula/). 4 milhões de visualizações. Só entra se o dono aceitar "Falta contexto" como enganoso.
- **Lado frágil**: a lista "42 realizações de Bolsonaro", Lupa, 22/10 (https://www.agencialupa.org/noticias/2026/10/22/lista-viral-de-42-realizacoes-de-bolsonaro-inclui-obras-de-outros-governos-e-nome-de-rodovia-que-nao-existe/). Quem postou foi Pablo Marçal (529 mil curtidas); o perfil de Flávio só **curtiu**. Os itens têm citação literal e selo:
  - Falso: "[Bolsonaro] Criou o Pix."; "Aumentou o Bolsa Família de R$ 80 para R$ 600." (atenção: o banco tem b430643c, que é a versão do debate com G1 #NÃOÉBEMASSIM); "Reduziu 40% da taxa de homicídios no Brasil."; "Aumentou em 30% a assistência à saúde para os povos indígenas."; "Tornou possível a criação da vacina 100% brasileira para Covid/Versamune."
  - Verdadeiro: "Bateu recorde de lucro pela Caixa Econômica."; "Trouxe a tecnologia 5G para o Brasil."; "Implementou a prova de vida dos idosos pelo celular."; "Entregou mais de 1,2 milhão de casas pelo projeto Casa Verde e Amarela."; "Aumentou a validade da carteira de motorista. Agora válida por 10 anos."
  - Só entram se "curtiu" ou "aliado repostou" bastar para o lado.
- **Já no banco por outra ocasião**: o reel de Flávio de 17/09 com os "R$ 7 bilhões" de Lula e Janja em viagens (Lupa, 30/09) está no banco como 523042a9 (versão do debate). O vídeo da mulher com droga, repostado por Flávio, está como 641a29c1.

### Pró-Flávio, mas sem atribuição a um lado (não entram pelas regras atuais)

Checados como falsos, sem a agência ligar o post a Flávio, ao PL ou a aliado: fraude no 1º turno (votos dos senadores do PL contra Flávio, AF 05/10 e Lupa 06/10; queda no percentual, AF 07/10; "Flávio teve 54,98%", Lupa 12/10; demora do TSE, Lupa 06/10; alteração na transmissão, Estadão 22/10; "cidades com mais votos que habitantes", Estadão 22/10); "mais de 90% dos presos votaram em Lula" (Lupa 12/10); frases falsas de Lula sobre o Nordeste (Lupa 15/10); "mulher é que nem milho" (G1 09/10, Lupa 09/10); Lula "jogou a bandeira no chão" (G1 e Lupa 04/10); Xuxa contra Lula (Lupa 03/10); eleitores de tornozeleira (G1 07/10); deepfake de William Waack sobre o PT "não aceitar a derrota" (Lupa 03/10); vídeos antigos como atos de Flávio (7 de Setembro: AF 08/09 e Lupa 11/09; carreata em Maceió: AF 26/08); Corinthians apoiando Flávio (AF 09/10); "Lula chorou na Record" (AF 16/10, 1,4 milhão de visualizações); capas falsas da Veja (Lupa 02/10). Se o dono aceitar "quem se beneficia" como lado, esta é a fila; é a mesma decisão pendente para os deepfakes de Flávio do lado esquerda.

Fora do período: Comprova sobre o post de Flávio contra o Datafolha (enganoso, mas de **2022**); vídeo dos "R$ 300 bi" (2024); Exército na Amazônia (2024); Estadão "homem negro sem dentes" (2025).

## Circula, mas sem checagem com selo (a lista simétrica do "Marielle")

| # | o que circula | quem | onde aparece | por que não entra |
|---|---|---|---|---|
| S1 | print atribuído a Ana Elisa (PT-MG) pedindo a Lula que feche as igrejas | Nikolas Ferreira (PL-MG), 08/10, mais de 1 milhão de visualizações | Comprova, 14/10 | o Comprova diz que "não é possível verificar"; não há selo |
| S2 | vídeo dizendo que Lula fecharia as igrejas | "outro deputado do PL" (sem nome), 374 mil visualizações | mesma peça do Comprova | sem checagem própria; o Comprova só lembra desmentidos anteriores |
| S3 | "consórcio" entre Alexandre de Moraes e Lula | Flávio, discurso de 7 de Setembro na Paulista | Aos Fatos 08/09 diz "sem apresentar provas" | sem checagem do discurso; não achei Lupa nem G1 |
| S4 | o Brasil precisa "voltar a crescer" e "voltar a gerar empregos" | página oficial de doações de Flávio | Aos Fatos 14/10 (reportagem) contesta com dados | reportagem, sem selo |
| S5 | "nunca recebeu um tostão" de Vorcaro | Nikolas Ferreira, vídeo repostado pela Tropa | Aos Fatos 14/10: "o que não é verdade" (jatinho em 2022) | reportagem, sem selo nem checagem própria |
| S6 | a Gaviões da Fiel retratou Jesus "derrotado" por Satanás em 2019 | Nikolas Ferreira, vídeo na Tropa | Aos Fatos 14/10, descrito como enganoso | reportagem, sem selo |
| S7 | Lula recebeu o dinheiro de Vorcaro pelo documentário (áudio da Veja) | Tropa do Flávio, 4 vezes em 09/10 | Lupa 13/10: "não há até o momento evidências" | sem selo. A versão de Flávio na Globo já está no banco (0458cba4) |
| S8 | montagem com IA de Lula abraçado a Vorcaro, "Conselheiro do Master" | site Direita Já e Instagram do PL | Lupa 15/09 (reportagem sobre IA sem aviso) | a peça trata do aviso de IA, não dá veredito sobre o fato |
| S9 | "o PIX foi feito no governo Bolsonaro" (card com Lula gerado por IA) | site Direita Já (PL) | Lupa 03/09 (reportagem: "Isso é falso") | o card só aparece numa reportagem; a alegação tem selo em outras versões ("Criou o Pix", lista dos 42; Flávio no JN, varredura anterior) |

Nove itens sem checagem com selo. Limite: só achei o que as agências **mencionam**; uma busca no X, Instagram ou WhatsApp sem nenhuma checagem por trás está fora do que dá para fazer daqui.

## Top 10

1. **F3**, "Lula acha normal roubar celular para tomar uma cervejinha": Derrite na live de Flávio e anúncios pagos de deputados do PL. Falso (Lupa e Estadão). 4,6 milhões de impressões.
2. **F7**, imagem com IA da faxineira limpando pichações do ato pró-Lula: canal oficial da campanha. Falso (Lupa, Aos Fatos e G1).
3. **F10**, laudo falso da PF inocentando Nikolas: story do Nikolas. Falso (Lupa, Aos Fatos e Comprova).
4. **V1**, "o governo corta R$ 4,2 bi das Forças Armadas": comício de Flávio. Verdadeiro (Lupa). Par magro (direita verdadeiro).
5. **E1**, "dobrou a população de rua": comício, vídeo do PL e reel de Flávio. Enganoso (Lupa, Exagerado). Par magro.
6. **F2**, "bloco do 22 em Minas", que era o Círio de Nazaré: post do próprio Flávio. Falso (Aos Fatos). 260 mil curtidas.
7. **V3**, "recorde de carga tributária": Daniella Marques na live. Verdadeiro (Lupa).
8. **F9**, "campanha de Lula vira ritual de invocação": Zé Trovão (PL). Falso (Lupa e G1).
9. **F6**, "a gente não acredita em Deus": Gayer e Tropa. Falso (Aos Fatos).
10. **V2**, "mais de 80 milhões de endividados": comício de Flávio. Verdadeiro (Lupa).

Em seguida: F1 ("Bolsonaro nunca foi ameaça à democracia", Lupa falso), F4 (narrativa da pedofilia, 3 checagens, tema sensível), F8 (Marcola).

## Limites

- Lupa `/verificacao/page/3` e `/page/4`: HTTP 429, não lidas.
- Estadão: a busca do WebSearch é bloqueada; li só a listagem atual (cerca de 20 peças) e 7 artigos.
- Não achei checagem do Aos Fatos nem do G1 para o comício de lançamento; o V1, V2, E1 e F1 têm só a Lupa.
- Citações copiadas das páginas salvas aqui; conferir na página antes de entrar no banco, como manda a skill.
