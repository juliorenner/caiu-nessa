# Varredura de checagens: o que falta no banco (23/10/2026)

## Método

1. Li `src/data/afirmacoes.json` (43 itens) e montei o conjunto (fonte_url, citação). Comparei cada fala checada com as citações do banco (normalização + sobreposição de palavras) e, depois, à mão, por assunto (a mesma fala aparece transcrita de jeitos diferentes em cada agência).
2. Baixei com `curl` (UA de navegador) e extraí com python estas páginas, todas responderam 200:
   - Aos Fatos: debate da Band (18/10), Flávio no JN (28/08), Lula no JN (27/08), Flávio na Globo (16/10), Lula na Globo (15/10), Lula no Flow (01/10), live de Flávio (01/10), crise no STF (17/09), "Presidenciáveis distorcem" (05/08) e 8 checagens de posts virais.
   - Lupa: debate da Band (18/10), Flávio no JN (28/08), Lula no JN (27/08), Lula no Flow (01/10), live de Flávio (01/10), pronunciamentos após o 1º turno (04/10), Lula na Globo (15/10), Flávio na Globo (16/10), "Tropa do Flávio" (13/10), virais (90% dos presos, aposentadoria aos 70).
   - Estadão Verifica: debate da Band, Lula no JN (27/08), Lula na Globo (15/10), Flávio na Globo (16/10). Quase tudo no Estadão é paráfrase ("O que Lula disse: que..."), sem fala literal; uso o Estadão só como segunda agência para a regra de divergência.
   - G1 Fato ou Fake: debate da Band (19/10), Lula na Globo (15/10), Flávio na Globo (16/10), página de eleições (lista de virais).
   - Comprova: nenhuma peça de agosto em diante com fala atribuível a um lado; a única de "gastos para se eleger" é de 2024.
3. Não encontrei checagem do G1 para as entrevistas do JN de agosto (busca sem resultado; não abri nenhuma página com esse conteúdo).
4. Rótulos: Lupa usa "Falta contexto", "Insustentável", "Subestimado", "Contraditório"; Estadão usa "Falta contexto", "Subestimado", "Verdadeiro em partes". Nenhum desses está na lista do jogo. **"Falta contexto" não está no mapeamento** (a lista diz "Fora de contexto"); tratei como fora, mas é decisão do dono.
5. Divergência aplicada como na página "Como escolhemos": V contra F/E = fora; F contra E = maioria, empate = falso. Rótulos fora dos três não contam como voto.

## Banco hoje (itens no jogo, sem `observacao`)

| | verdadeiro | falso | enganoso |
|---|---|---|---|
| direita | **3** | 12 | **3** |
| esquerda | 7 | 5 | 5 |

Pares magros: direita verdadeiro, direita enganoso; esquerda falso e esquerda enganoso também têm pouca folga.

## Observação sobre os dois itens que o dono achou

- **Policial que matou a criança de 5 anos**: a fala checada é de **Lula** (lado `esquerda`), não de Flávio: "foi interferir para que um policial que matou uma criança de 5 anos com uma bala de fuzil não fosse preso." Aos Fatos = verdadeiro; G1 = #FATO. No Flow (01/10), Lula disse algo parecido e o Aos Fatos deu "não é bem assim" (ver tabela de esquerda); são falas e ocasiões diferentes.
- **"nada contra ele" (Adriano da Nóbrega)**: Flávio, JN 28/08. Aos Fatos = falso; Lupa = falso.

## Candidatos: direita (Flávio Bolsonaro e aliados)

Alcance: D = debate da Band; TV = entrevista na TV Globo/JN; L = live/pronunciamento; V = post viral; O = outro.

### Verdadeiro (par mais magro)

| fala literal (agência) | agências e rótulos | jogo | alcance | explicação curta |
|---|---|---|---|---|
| "Ele [Lula] trocou os 27 superintendentes da [Polícia Federal] todos, de toda a federação." (Lupa) | Lupa Verdadeiro; G1 #FATO | verdadeiro | TV 16/10 | Lula trocou os 27 superintendentes da PF. [Lupa](https://www.agencialupa.org/checagem/2026/10/16/ao-vivo-checagem-da-entrevista-de-flavio-bolsonaro-na-globo/), [G1](https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/16/veja-o-que-e-fato-ou-fake-na-entrevista-de-flavio-bolsonaro-a-globo-no-2o-turno-das-eleicoes-2026.ghtml) |
| "Essa homenagem [a Adriano da Nóbrega] foi feita há mais de 20 anos, se não me engano." (Lupa) | Lupa Verdadeiro | verdadeiro | TV 28/08 | A homenagem é de mais de 20 anos atrás. [Lupa](https://www.agencialupa.org/checagem/2026/08/28/ao-vivo-checagem-da-entrevista-de-flavio-bolsonaro-ao-jornal-nacional/) |
| "A taxa de juro oficial, que é a Selic, vai lá para a lua. 14% é o maior juro real do mundo" (Lupa) | Lupa Verdadeiro | verdadeiro | TV 28/08 | Lupa confirmou o juro real mais alto. Mesma página |
| "Até fontes jornalísticas são ameaçadas [por decisões do STF], têm quebra de sigilos, sofrem busca e apreensão, lesando um direito sagrado de todo o jornalista de sigilo da sua fonte" (Lupa) | Lupa Verdadeiro | verdadeiro | TV 28/08 | Lupa registrou casos de quebra de sigilo de jornalistas. Mesma página |
| "[Flávio Dino] que já disse que [Jair] Bolsonaro era o demônio na terra." (Lupa) | Lupa Verdadeiro | verdadeiro | TV 16/10 | Lupa achou a fala de Dino. [Lupa](https://www.agencialupa.org/checagem/2026/10/16/ao-vivo-checagem-da-entrevista-de-flavio-bolsonaro-na-globo/) |
| "Um governo que vai indicar pelo menos quatro ministros do Supremo Tribunal Federal (STF)" (Lupa) | Lupa Verdadeiro | verdadeiro | L 04/10 | Quatro vagas abrem no próximo mandato. [Lupa](https://www.agencialupa.org/checagem/2026/10/04/apos-confirmacao-do-2o-turno-lula-erra-sobre-superavit-e-flavio-sobre-reeleicao-e-endividamento/) |
| "Mais de 40 milhões do Brasil moram em áreas conflagradas, áreas que são dominadas por esses narcoterroristas." (G1) | G1 #FATO; Lupa Subestimado; Estadão Subestimado | verdadeiro só pelo G1 (dono decide: "subestimado" está fora dos três) | D | O número real é maior. [G1](https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/19/veja-o-que-e-fato-ou-fake-nas-falas-de-flavio-bolsonaro-e-lula-no-debate-da-band-no-2o-turno-das-eleicoes-2026.ghtml) |

Fora: "juros futuro já caiu 2%" (AF não é bem assim × Estadão verdadeiro); "recorde de mulher assassinada" (G1 FATO × AF não é bem assim); dívida de R$ 11 trilhões na Globo (o banco já tem a versão do debate, hoje fora do jogo).

### Enganoso (par magro)

| fala literal (agência) | agências e rótulos | jogo | alcance | explicação curta |
|---|---|---|---|---|
| "73% dos presidiários votaram em você?" (AF) | AF Não é bem assim; G1 #NÃOÉBEMASSIM; Lupa e Estadão Falta contexto | enganoso | D | Só presos provisórios votam; seções incluem funcionários e adolescentes. [AF](https://www.aosfatos.org/noticias/checamos-lula-flavio-bolsonaro-debate-band/) |
| "não foi você que prendeu o Vorcaro, foi o ministro André Mendonça." (AF) | AF Não é bem assim; G1 #NÃOÉBEMASSIM | enganoso | D | A 1ª prisão foi autorizada por juiz federal; Mendonça só na 2ª. AF, G1 (debate) |
| "Eu já assinei a CPMI e eu pedi que ela acontecesse, ..." (AF) | AF Não é bem assim; Lupa Exagerado ("Eu pedia muito que houvesse a CPMI do Banco Master") | enganoso | TV 28/08 | Houve cinco pedidos de CPMI; ele não assinou três. [AF](https://www.aosfatos.org/noticias/checamos-flavio-bolsonaro-globo/), [Lupa](https://www.agencialupa.org/checagem/2026/08/28/ao-vivo-checagem-da-entrevista-de-flavio-bolsonaro-ao-jornal-nacional/) |
| "O atual presidente da República […] já gastou quase 350 bilhões de reais para tentar se reeleger." (Lupa) | Lupa Exagerado (repetido no debate e no pronunciamento de 04/10, Lupa Exagerado nas três) | enganoso | TV 16/10, D, L | Valor inflado. [Lupa](https://www.agencialupa.org/checagem/2026/10/16/ao-vivo-checagem-da-entrevista-de-flavio-bolsonaro-na-globo/) |
| "Se você pegar o boletim Focus de outubro de 2022, [...] a estimativa de taxa de juro era para estar, neste momento, em torno de 7%. Hoje, a taxa de juros está em 14%." (G1) | G1 #NÃOÉBEMASSIM; Estadão Impreciso; Lupa Falta contexto | enganoso | TV 16/10 | O Focus projetava 8%, não 7%. G1, Estadão (Globo) |
| "Hoje, vocês sabem que o atual governo tem 39 ministérios." (G1) | G1 #NÃOÉBEMASSIM; Estadão Impreciso | enganoso | TV 16/10 | São 38 hoje (37 no início). G1, Estadão (Globo) |
| "Vocês sabem qual foi a bancada que insistiu ali para fazer uma emendinha [...]? Foi a bancada do PT." (AF) | AF Não é bem assim; Estadão Falta contexto | enganoso | D | PT apresentou emendas, mas não foi o único; MP de Bolsonaro também afrouxou. AF (debate) |
| "Inclusive o Lula tomou vacina, né? Ele tomou vacina, quem comprou vacina? O presidente Bolsonaro." (AF) | AF Não é bem assim | enganoso | D | A Coronavac de Lula veio do Butantan/SP, que Bolsonaro chamava de "vachina". AF (debate) |
| "Ele nunca pediu tarifas para empresas brasileiras." (AF) | AF Não é bem assim; Lupa Falta contexto | enganoso | TV 28/08 | Eduardo discutiu taxação com autoridades dos EUA. AF (JN) |
| "... que deu um patrocínio de 160 milhões de reais para um programa do Luciano Huck aqui da Globo." (AF) | AF Não é bem assim | enganoso | TV 28/08 | Patrocínio existiu; valor sem evidência. AF (JN) |
| "... não tem absolutamente nada de irregular nesse filme." (AF) | AF Não é bem assim | enganoso | TV 28/08 | Investigação da PF segue aberta. AF (JN) |
| "Mais uma vez, eu vou esclarecer quantas vezes forem necessárias: eu estou falando de um pedido de patrocínio privado para um filme privado, sem absolutamente nenhuma contrapartida pelo fato de eu ser senador da República [...]." (G1) | G1 #NÃOÉBEMASSIM; Lupa Falta contexto | enganoso | TV 16/10 | PF investiga a origem do dinheiro. G1 (Globo) |
| "que eu privatizaria Banco do Brasil, Caixa, Petrobras," (AF) | AF Não é bem assim | enganoso | TV 16/10 | Ele mesmo já sinalizou privatizações. [AF](https://www.aosfatos.org/noticias/checamos-flavio-bolsonaro-globo-segundo-turno/) |
| "Com esse Prontuário Único Eletrônico, eu vou conectar todas as informações [...]" (AF) | AF Não é bem assim (debate e Globo) | enganoso | D, TV | O sistema já existe desde 2020. AF |
| "A Lei 1.079, que é a lei de impeachment, estabelece lá quais são os crimes de responsabilidade [...] é obrigação do Senado Federal iniciar um processo de impeachment." (G1) | G1 #NÃOÉBEMASSIM | enganoso | TV 16/10 | G1 (Globo) |
| "Hoje, o golpe que está acontecendo é o do atual presidente. O golpe que ele se vinga, por exemplo, [...] dos motoboys de São Paulo [...]" (G1) | G1 #NÃOÉBEMASSIM | enganoso | TV 16/10 | G1 (Globo) |
| "Ele mesmo [Lula] falou 'quanto mais inteligente for o povo menos o povo vota no PT'" (AF, fala de 13/06) | AF Não é bem assim | enganoso | O | Distorção de fala de 2023. [AF 05/08](https://www.aosfatos.org/noticias/presidenciaveis-distorcem-inventam-fatos-atacar-adversarios/) (fala anterior a agosto) |

Duvidoso: "O áudio do Vorcaro falou que é dinheiro por fora [...] R$ 30 milhões para o Instituto Lula" (Lupa Insustentável; G1 #NÃOÉBEMASSIM; Estadão Falta contexto): só o G1 dá rótulo que cabe; eu deixaria fora.

### Falso

| fala literal (agência) | agências e rótulos | jogo | alcance | explicação curta |
|---|---|---|---|---|
| "Não tinha feito absolutamente nada de errado, não tinha nada contra ele nesta época." (AF) | AF Falso; Lupa Falso | falso | TV 28/08 | Adriano já tinha problemas com a Justiça nas duas homenagens. AF, Lupa (JN) |
| "Eu fui até lá aos Estados Unidos para defender as empresas e os produtos brasileiros. Sabe o que o governo fez? Não mandou ninguém. [...]" (AF) | AF Falso; Lupa Falso; G1 #FAKE; (no JN, "o único agente público brasileiro que foi para os Estados Unidos defender o Brasil foi Flávio Bolsonaro", AF Falso) | falso | D, TV | Governo fez mais de 30 reuniões, Lula esteve com Trump. AF (debate) |
| "a criminalidade explodiu no Brasil." (AF) | AF Falso; Lupa Falso; G1 #FAKE | falso | D | Mortes violentas caem desde 2021. AF (debate). Tema próximo de item já no banco ("recordista em criminalidade") |
| "Bom, você está vendo as propostas [...] Vocês estão vendo a redução aí de roubo de celular?" (AF) | AF Falso; Lupa Falso; G1 #FAKE | falso | D | Roubos de celular caíram. AF (debate) |
| "a produtora do filme aqui no Brasil, ela prestou conta de tudo." (AF) | AF Falso; Lupa Falso; G1 #FAKE | falso | TV 16/10 | Perícia sem notas e recibos. AF (Globo) |
| "... jamais questionei a questão do processo eleitoral." (AF) | AF Falso; Lupa Falso | falso | TV 28/08 | Vários registros dele contra as urnas. AF (JN) |
| "Eu acho que tem eventos climáticos extremos. Tem épocas cíclicas [...] eu não acho que isso tem a ver diretamente só com a influência do ser humano." (AF) | AF Falso; Lupa Falso | falso | TV 28/08 | Consenso científico de mais de 99%. AF (JN) |
| "isso aí é o que está na Constituição, o direito à legítima defesa." (AF) | AF Falso; Lupa Falso | falso | TV 16/10 | Está no Código Penal, não na Constituição. AF (Globo) |
| "no primeiro ano de governo, [...] a taxa de homicídio caiu 17% [...] o que botou por água abaixo essas teses aí malucas [...]" (AF) | AF Falso; Lupa Falso; G1 #NÃOÉBEMASSIM | falso (maioria) | TV 16/10 | Pesquisas não sustentam a conclusão. AF (Globo) |
| "[Lula deixou o povo brasileiro] com fome." (AF) | AF Falso; Lupa Falso | falso | L 01/10 | Fome no menor patamar já registrado. [AF](https://www.aosfatos.org/noticias/checamos-live-flavio-bolsonaro/) |
| "Eu tenho um irmão exilado nos Estados Unidos" (AF); no debate: "Ele [Eduardo Bolsonaro] está exilado, perseguido." (G1) | live: AF Falso, Lupa Exagerado; debate: G1 #FAKE, Lupa Exagerado | falso (empate = falso) | L, D | Eduardo se mudou voluntariamente. AF (live), G1 (debate) |
| "O Pix, que foi ali criado no governo do presidente Bolsonaro" (Lupa) / "Foi feito na gestão do presidente Bolsonaro." (AF) | Lupa Falso; AF Não é bem assim | falso (empate) | TV 28/08 | Estudos começaram em 2014-2016. Lupa, AF (JN) |
| "Não tem taxa no Pix porque o Bolsonaro exigiu que não tivesse [...]" (AF) | AF Falso; Lupa Falta contexto | falso | TV 28/08 | Gratuidade foi decisão do BC. AF (JN) |
| "Não foi encontrada uma arma no 8 de Janeiro, Tralli." (AF) | AF Falso (JN); G1 #FAKE na versão da Globo | falso | TV 28/08 e 16/10 | Armas do GSI foram roubadas. AF (JN) |
| "como tem no atual governo, que faz uma política de desencarceramento, que coloca nas ruas marginais perigosos [...]" (AF) | AF Não é bem assim; Lupa Falso | falso (empate) | D | Não há soltura automática por falta de vaga. AF, Lupa (debate) |
| "E ele [Lula] fez de tudo, até acionou a justiça para tentar fazer com que a saidinha voltasse a valer" (Lupa) | Lupa Falso; Estadão Enganoso (paráfrase) | falso (empate) | D | Lupa (debate) |
| "Eu não mantenho escritório com o Careca, Lula." (AF) | AF Falso | falso | D | Empresa dele divide endereço com 16 firmas do Careca do INSS. AF (debate) |
| "O Careca do INSS foi do seu governo." (AF) | AF Falso | falso | D | Não tinha cargo no governo. AF (debate) |
| "Ele foi para lá para defender CV e PCC," (AF) | AF Falso | falso | D | AF (debate) |
| "Diferente do que faz esse atual governo, que acha que [...] os pedófilos, eles são pessoas doentes. Não são pessoas criminosas." (AF) | AF Falso | falso | D | Lula sancionou penas maiores. AF (debate) |
| "Você, por exemplo, quer revender alguma coisinha na internet [...] você vai poder fazer isso de dentro da sua casa" (AF) | AF Falso | falso | D | Já é permitido desde 2016. AF (debate) |
| "Você [Lula] liberou as armas para os traficantes" (Lupa) | Lupa Falso; (Globo: "autoriza os marginais a comprarem armas de guerra," AF Falso) | falso | D, TV | Lupa (debate), AF (Globo) |
| "Estão vendo algum combate a quem revende um celular [roubado]?" (Lupa) | Lupa Falso | falso | D | Lupa (debate) |
| "A única relação que eu tinha com ele, Renata, era sobre esse filme e mais nada." (AF) | AF Falso; Estadão Falso ("ele não tinha suspeitas", paráfrase) | falso | TV 28/08 | Chamavam-se de "irmão". AF (JN) |
| "Simples assim, uma relação privada, um dinheiro totalmente lícito," (AF) | AF Falso | falso | TV 16/10 | PF investiga lavagem. AF (Globo) |
| "Vocês acham que é sentar uma senhorinha lá na cadeira de presidente da República [...] uma tentativa de golpe em prédios vazios?" (AF) | AF Falso | falso | TV 16/10 | AF (Globo) |
| "Isso poderia trazer mais de 100 bilhões de reais também de largada." (AF) | AF Falso | falso | TV 16/10 | Margem Equatorial. AF (Globo) |
| "Tem a questão também da margem equatorial, os royalties do petróleo, que já estavam na proposta de governo do presidente Bolsonaro lá em 2022." (Lupa) | Lupa Falso | falso | TV 16/10 | Lupa (Globo) |
| "[Jair] Bolsonaro troca um [comando da Polícia Federal], tem esse questionamento. Ele [Lula] troca 27, e não tem questionamento nenhum." (Lupa) | Lupa Falso | falso | TV 16/10 | Lupa (Globo) |
| "O presidente Bolsonaro extinguiu mais de 20 mil cargos em comissão." (G1) | G1 #FAKE; Estadão Impreciso | falso (empate) | TV 16/10 | G1 (Globo) |
| "Eu não posso compactuar com censura, com interferência do Judiciário." (AF) | AF Falso | falso | L 01/10 | Campanha pediu remoção de dezenas de posts. AF (live) |
| "O debate da Globo foi censurado" (Lupa) | Lupa Falso | falso | L 01/10 | [Lupa live](https://www.agencialupa.org/checagem/2026/10/01/ao-vivo-checagem-da-live-de-flavio-bolsonaro/) |
| "Não tinha corrupção [no governo de Jair Bolsonaro]" (Lupa) | Lupa Falso | falso | L 01/10 | Lupa (live) |
| "Eu sou o único candidato que assumiu o compromisso pelo fim da reeleição" (Lupa) | Lupa Falso | falso | L 04/10 | Lupa (04/10) |
| "Eu queria muito que todos do Supremo fossem iguais ao Mendonça, não pesassem para lado nenhum. [...]" (AF) | AF Falso | falso | O 11/09 | [AF](https://www.aosfatos.org/noticias/lula-flavio-crise-stf/) |
| "Todo mundo viu o PGR, que é citado nas investigações, dando sua opinião também [...]" (AF) | AF Falso | falso | O 15/09 | AF (STF) |
| "Não tem absolutamente nada de errado com esse filme, não tem um centavo de dinheiro público, eu já cansei de falar." (AF) | AF Falso | falso | O 10/09 | PF apura emendas de R$ 2 milhões. AF (STF) |
| "Eu lembro de uma frase que o Luiz falou, [...] eu vou fazer o diabo para me eleger." (AF, fala de 16/05) | AF Falso | falso | O | A frase é de Dilma, 2013. AF (05/08; fala anterior a agosto) |

Viral (lado `direita` só onde a agência liga o post à campanha):
- Posts de que Lula defendeu pedofilia no discurso de Belém (28/09): AF Falso ([link](https://www.aosfatos.org/noticias/lula-discursa-cancer-de-prostata-nao-sobre-defesa-pedofilia/), 29/09; 100 mil visualizações no X). A Lupa ([13/10](https://www.agencialupa.org/noticias/2026/10/13/tropa-do-flavio-canal-do-pl-ja-enviou-imagens-falsas-e-falas-editadas-de-lula/)) mostra o vídeo no canal da campanha e nos perfis oficiais do PL. **Sem citação literal do post** na checagem do AF (só a fala de Lula, "as mulheres aprendem a tomar toque desde pequenas"); precisaria de uma citação do post para entrar.
- "a gente não acredita em Deus" (AF Falso, 25/08, 102,5 mil interações); a Lupa diz que o canal "Tropa do Flávio" repostou. Mesmo problema: a citação é a fala distorcida.
- "Mais de 90% dos presos votaram em Lula" (Lupa Falso, [12/10](https://www.agencialupa.org/eleicoes/2026/10/12/e-falso-que-mais-de-90-dos-presos-votaram-em-lula/)): a Lupa não atribui o post a um lado.
- Vídeo do Círio de Nazaré como ato de Flávio (AF Falso, 16/10, compartilhado pelo próprio Flávio): sem fala; não cabe.

## Candidatos: esquerda (Lula e aliados)

### Verdadeiro

| fala literal (agência) | agências e rótulos | jogo | alcance | explicação curta |
|---|---|---|---|---|
| "foi interferir para que um policial que matou uma criança de 5 anos com uma bala de fuzil não fosse preso." (AF) | AF Verdadeiro; G1 #FATO | verdadeiro | D | Flávio assinou recurso ao STJ pela defesa do PM do caso Ana Clara. AF, G1 (debate) |
| "No governo deles, eles liberaram mais de um milhão de armas." (AF) | AF Verdadeiro; Lupa Verdadeiro; G1 #FATO | verdadeiro | D | Registros de armas do período Bolsonaro. AF (debate) |
| "só no caso Vorcaro ele contou 43 mentiras, 43 mentiras." (AF) | AF Verdadeiro; Estadão Verdadeiro | verdadeiro | D | Levantamento do próprio AF. AF (debate) |
| "não tem nenhuma acusação [contra meu filho]. São ilações, ilações, ilações tiradas de telefonemas." (AF) | AF Verdadeiro; Lupa Verdadeiro ("Veja, primeiro, não tem nenhuma acusação [contra o Lulinha]") | verdadeiro | TV 27/08 | Investigado, sem denúncia. [AF](https://www.aosfatos.org/noticias/checamos-entrevista-lula-globo/), [Lupa](https://www.agencialupa.org/checagem/2026/08/27/ao-vivo-checagem-da-entrevista-de-lula-ao-jornal-nacional/) |
| "o Canella, que foi preso e que a mãe do Flávio ia ser suplente dele no Senado." (AF) | AF Verdadeiro; G1 #FATO; Estadão Verdadeiro | verdadeiro | TV 15/10 | [AF](https://www.aosfatos.org/noticias/checamos-lula-globo-segundo-turno/) |
| "você queria tirar a marca da bala," (AF) | AF Verdadeiro | verdadeiro | D | Par do item de Flávio "Nunca quis tirar nada disso" (já no banco, falso). AF (debate) |
| "Esse cidadão ganha o mesmo salário que eu." (AF) | AF Verdadeiro | verdadeiro | D | AF (debate) |
| "É importante lembrar que esse país cresceu 7,5% em 2010" (AF) | AF, Lupa, Estadão Verdadeiro; G1 #FATO nessa parte | verdadeiro | D | Banco já tem a versão da Globo (fora do jogo). |
| "nós apresentamos o orçamento com superávit primário." (AF) | AF Verdadeiro; G1 #FATO; Lupa Verdadeiro (debate) | verdadeiro | TV, D | PLOA 2027 com 0,1%. AF (Globo) |
| "Anistiei 12,6 bilhões de dívida dos MEI" (Lupa) | Lupa Verdadeiro; G1 #FATO (debate e Globo); Estadão Verdadeiro (Globo) | verdadeiro | D, TV | [Lupa](https://www.agencialupa.org/checagem/2026/10/18/ao-vivo-checagem-do-debate-entre-lula-e-flavio-bolsonaro-na-band/) |
| "É importante dizer que quando eu cheguei na Presidência, nós tínhamos 5 milhões de trabalhadores [...] com diploma universitário. Hoje nós temos 25 milhões" (AF) | AF Verdadeiro; Lupa Verdadeiro | verdadeiro | TV 27/08 | AF (JN) |
| "Quando eu voltei, tinha 33 milhões de pessoas passando fome outra vez" (Lupa) | Lupa Verdadeiro; G1 #FATO nessa parte | verdadeiro | TV 15/10 | [Lupa](https://www.agencialupa.org/checagem/2026/10/15/ao-vivo-checagem-da-entrevista-de-lula-na-tv-globo/) |
| "Em 2025, nós fizemos 15 milhões de cirurgias eletivas." (G1) | G1 #FATO; Estadão Verdadeiro | verdadeiro | TV 15/10 | [G1](https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/15/veja-o-que-e-fato-ou-fake-na-entrevista-de-lula-a-globo-no-2o-turno-das-eleicoes-2026.ghtml) |
| "Agora, aquele que cometeu crime hediondo, esse não sai [...]. Aquele que praticou estupro não sai. [...]" (Lupa) | Lupa Verdadeiro | verdadeiro | D | Lupa (debate) |
| "Acabou de ser expulso da Polícia Federal. O Eduardo [Bolsonaro]." (Lupa) | Lupa Verdadeiro | verdadeiro | O (Flow) | [Lupa](https://www.agencialupa.org/checagem/2026/10/01/ao-vivo-checagem-da-entrevista-de-lula-no-flow/) |

Duvidosos: "um bilhão e cem milhões de balas" (AF Verdadeiro, G1 #FATO, Lupa Insustentável); "seis mil obras paralisadas" (AF Verdadeiro, Lupa e Estadão Subestimado).

### Falso

| fala literal (agência) | agências e rótulos | jogo | alcance | explicação curta |
|---|---|---|---|---|
| "Mas o Jaques Wagner não tem nada a ver com isso [Banco Master]" (AF) | AF Falso | falso | O (Flow, 01/10) | PF apontou indícios contra Wagner. [AF](https://www.aosfatos.org/noticias/checamos-entrevista-lula-ao-flow/) |
| "Esse rapaz [Flávio Bolsonaro] foi vereador com 21 anos." (Lupa) | Lupa Falso; AF Não é bem assim | falso (empate) | O (Flow) | Foi deputado estadual aos 21. Lupa, AF (Flow) |
| "[Flávio Bolsonaro] empregou a mulher dele [Adriano da Nóbrega], ou a irmã dele, ou a mãe durante vários anos no Senado." (Lupa) | Lupa Falso | falso | O (Flow) | Os empregos foram na Alerj, não no Senado. Lupa (Flow) |
| "Ele sabe que, quando eles governaram o país, [...] ficou um déficit de 2,8%." (G1, debate) | debate: G1 #FAKE, Lupa Falso. Globo (15/10): Lupa Falso, G1 #FAKE, Estadão Falso, **AF Verdadeiro** | debate: falso; Globo: fora (V × F) | D, TV | 2022 fechou com superávit. **Atenção**: AF deu verdadeiro à mesma frase na Globo; o dono decide se a divergência contamina a versão do debate. |
| "Se você fizer uma pesquisa sobre quem é favorável à pena de morte, vai dar 90%" (Lupa) | Lupa Falso | falso | O (Flow) | Lupa (Flow) |
| "O [Brasil foi o] único país do G20 [a registrar superávit primário entre 2003 e 2010]" (Lupa) | Lupa Falso; Estadão Enganoso (JN, paráfrase) | falso (empate) | L 04/10 | Lupa (04/10) |
| "Por menos que isso, Joaquim Silvério dos Reis, delator de Tiradentes, foi enforcado. [...]" (AF, fala de 02/06) | AF Falso | falso | O | AF (05/08; fala anterior a agosto) |

O "só voltou a crescer acima de 3% depois que eu voltei" (AF, Lupa, G1, Estadão contra; repetido no JN, no Flow, na Band) já está no banco, na versão do Flow.

### Enganoso

| fala literal (agência) | agências e rótulos | jogo | alcance | explicação curta |
|---|---|---|---|---|
| "Um senador da República que tem coragem de assinar uma petição defendendo o assassino de uma criança de cinco anos de idade." (AF) | AF Não é bem assim | enganoso | O (Flow) | O PM ainda não foi condenado. AF (Flow) |
| "Vocês fizeram ele um banqueiro e eu fiz ele um prisioneiro, provando que ele tinha quebrado, dado um golpe de 60 bilhões de reais." (AF) | AF Não é bem assim | enganoso | D | Nem a compra nem a prisão foram decisão dos presidentes. AF (debate) |
| "nós conseguimos debelar essa quadrilha e prendemos muita gente e já arrecadamos R$ 6 bilhões da quadrilha" (AF) | AF Não é bem assim | enganoso | D | R$ 6 bi foram bloqueados, não recuperados. AF (debate) |
| "Uma quadrilha que foi montada em 2019. Inclusive com a participação do ministro da Previdência daquela época." (AF) | AF Não é bem assim; Estadão Enganoso; Lupa Falta contexto | enganoso | TV 27/08 | Desvios começaram antes de 2019. AF (JN) |
| "Eu tinha acabado com a fome em 2014" (Lupa) | Lupa Exagerado; G1 #NÃOÉBEMASSIM; Estadão Falta contexto | enganoso | TV 15/10 | Sair do Mapa da Fome não é erradicar a fome. Lupa (Globo) |
| "O salário mínimo comprava 1.8 cesta básica [no governo Bolsonaro]. No meu governo, já tá comprando 2.2 cesta básica" (Lupa) | Lupa Exagerado | enganoso | D | Hoje compra 1,8. Lupa (debate) |
| "A economia brasileira voltou a crescer, o PIB industrial é de 3.4%" (Lupa) | Lupa Exagerado; G1 #NÃOÉBEMASSIM | enganoso | D | Lupa, G1 (debate) |
| "Todo mundo sabe que a Constituição de 88 garantiu que a segurança pública era uma das responsabilidades dos Estados." (AF) | AF Não é bem assim | enganoso | D | Art. 144 inclui polícias federais. AF (debate) |
| "[...] a gente tinha 20 e poucos mil médicos. Quando eu voltei para a Presidência, eu tinha apenas 12 mil. Nós já contratamos 16 mil [...]" (G1) | G1 #NÃOÉBEMASSIM; Estadão Exagerado | enganoso | TV 15/10 | Pico de 18 mil; acréscimo de 12,9 mil. G1 (Globo). A versão do debate é fora (G1 FATO × Estadão impreciso) |
| "Emprestei R$ 15 bilhões depois da crise subprime ao FMI [Fundo Monetário Internacional]" (Lupa) | Lupa Exagerado; Estadão Exagerado | enganoso | TV 15/10 | Foram US$ 10 bi. Lupa (Globo) |
| "Eu cheguei no governo, você tinha o país com 10 mil ambulâncias precisando renovar, tivemos que comprar 10 mil ambulâncias no Samu [...]" (G1) | G1 #NÃOÉBEMASSIM; Estadão Exagerado | enganoso | TV 15/10 | G1 (Globo) |
| "eu fui acusado de ter uma chácara que eu não tinha –" (AF) | AF Não é bem assim | enganoso | TV 27/08 | A acusação não era só de propriedade. AF (JN) |
| "[Fiz] mais de 200 institutos federais" (Lupa) | Lupa Exagerado | enganoso | TV 27/08 | Lupa (JN) |
| "Alexandre de Moraes, sabe, mandou prender o cara que matou a Marielle" (AF) | AF Não é bem assim | enganoso | O 16/09 | Lessa foi preso pela Polícia Civil em 2019. AF (STF) |
| "Só é importante você lembrar que a primeira reforma no Poder Judiciário fui eu que fiz" (AF, 15/09) | AF Não é bem assim; (na Globo, Lupa Verdadeiro × G1 #NÃOÉBEMASSIM = fora) | enganoso só a versão de 15/09 | O | AF (STF) |

Fora (esquerda): Lei Antifacção (AF e Lupa V × G1 NBA); dois graus de investimento (AF e Estadão V × G1 NBA); "deu emprego para a irmã e para a mulher do cara [...] do escritório do crime" (Lupa V × G1 NBA); salário mínimo acima da inflação (G1 FATO × Estadão enganoso); "acabei com a fome duas vezes" no JN (Estadão V × AF NBA, Lupa exagerado); "todos os partidos participaram" (AF V × G1 NBA).

Viral do lado esquerda: não achei checagem desde agosto em que a agência ligue o post a Lula, ao PT ou à campanha. Os deepfakes de Flávio (cortes no 13º: AF e G1 Falso; aposentadoria aos 70: Lupa Falso; privatizar o SUS: AF Falso) circulam, mas as agências não atribuem a um lado. Se o dono aceitar "quem se beneficia" como lado, eles entram; pelas regras atuais, não.

## Contagem dos candidatos que cabem nas regras (sem os duvidosos)

| | verdadeiro | falso | enganoso |
|---|---|---|---|
| direita | 6 (+1 duvidoso) | 38 | 17 |
| esquerda | 15 (+2 duvidosos) | 7 | 15 |

## Os 10 mais importantes que faltam

1. **Flávio, JN: Adriano "não tinha nada contra ele"**: falso (AF + Lupa). Direita falso.
2. **Lula, Band: PM que matou criança de 5 anos**: verdadeiro (AF + G1). Esquerda verdadeiro.
3. **Flávio, Band: "fui aos EUA... o governo não mandou ninguém"**: falso (AF + Lupa + G1; repetido no JN). Direita falso.
4. **Flávio, Band: "73% dos presidiários votaram em você"**: enganoso (AF + G1). Direita enganoso (par magro).
5. **Flávio, Globo: "a produtora prestou contas de tudo" (Dark Horse)**: falso (AF + Lupa + G1). Direita falso.
6. **Flávio, Globo: "Lula trocou os 27 superintendentes da PF"**: verdadeiro (Lupa + G1). Direita verdadeiro (par mais magro).
7. **Lula, Band: "liberaram mais de um milhão de armas"**: verdadeiro (AF + Lupa + G1). Esquerda verdadeiro.
8. **Flávio, Band: "não foi você que prendeu o Vorcaro, foi o André Mendonça"**: enganoso (AF + G1). Direita enganoso.
9. **Lula, Flow: "o Jaques Wagner não tem nada a ver com isso [Master]"**: falso (AF). Esquerda falso (par com pouca folga).
10. **Flávio, JN: "jamais questionei o processo eleitoral"**: falso (AF + Lupa). Direita falso. Empatado com "a criminalidade explodiu" e "redução de roubo de celular?" (3 agências cada, mas o primeiro é tema já coberto no banco).

Para equilibrar sem inflar o direita-falso: priorizar 4, 6, 8, "CPMI" (AF + Lupa, enganoso), "350 bilhões" (Lupa, 3 ocasiões, enganoso), "Focus 7% / 14%" e "39 ministérios" (G1 + Estadão, enganoso), e, do lado esquerda, "quadrilha de 2019" (AF + Estadão, enganoso) e "vereador com 21 anos" (Lupa + AF, falso).

## Não verificado / limites

- G1 Fato ou Fake das entrevistas do JN de agosto: não achei a página.
- Comprova: nenhum item do período com fala atribuída a um lado.
- Estadão: só paráfrases, então nenhum item entra com fonte Estadão sem achar a fala literal em outra agência.
- As citações acima foram copiadas da transcrição de cada agência (colchetes e reticências delas). Antes de entrar no banco, conferir na página, como manda a skill.
