# Auditoria de ambiguidade, segunda passada (24/10/2026)

Base: `src/data/afirmacoes.json` no commit cc4bf89. São 180 itens, 2 deles fora do jogo, então **178 lidos**: 77 da esquerda e 101 da direita.

## Por que uma segunda passada

Hoje dois itens confundiram o dono, e eles definem a calibragem desta passada:

- **c4b9a095** (Flávio, clima, falso) foi **reescrito**. O veredito dependia da pergunta que ele respondia ("existe aquecimento global?"), e o cartão não trazia essa pergunta. A auditoria de 23/10 tinha marcado o item como "média" e mesmo assim ele confundiu o dono, por isso a régua agora está mais alta.
- **ef0309f9** (Lula, segurança pública, enganoso) foi **tirado do jogo**. A paráfrase deixava a fala mais forte do que ela era, o termo "Estado"/"estados" é ambíguo, e a versão fiel ao que ele disse é quase verdadeira, com uma ressalva que depende do contexto da fala.

Critério: a regra publicada em /como-escolhemos. Sai do jogo o item cujo cartão não consegue ser fiel à fala sem confundir quem joga, e a regra vale igual para os dois lados. Considero **alta** a gravidade quando um jogador atento marca outro botão com convicção.

## Método

Fiz a triagem de todos os itens em jogo comparando texto, citação, veredito e explicação, à procura de cinco padrões:

- veredito que depende de um contexto omitido;
- paráfrase mais forte ou mais fraca que a fala;
- termo ambíguo ("criar", "fechada", unidade, período);
- explicação que concede o veredito oposto;
- versão fiel quase verdadeira com veredito falso ou enganoso.

Depois li com `scripts/pagina.ts` as 15 páginas das fontes dos candidatos:

- Aos Fatos: debate da Band, Flávio na Globo, Flávio na Globo no 2º turno, live do Flávio, Lula na Globo no 2º turno e Lula no Flow;
- Lupa: debate da Band, Lula na Globo, Lula no JN, Flávio no JN, discurso na ONU e pontapé da campanha;
- G1: debate da Band;
- Estadão Verifica: debate da Band e Lula na Globo.

## Aplicado

| id | lado | veredito | mudança | motivo |
|---|---|---|---|---|
| 412551cb | esquerda | enganoso | fora do jogo | A Lupa confirma o crescimento e a queda das emissões; o "falta contexto" vem de fora da fala. |
| 04651f56 | esquerda | enganoso | fora do jogo | A Lupa não contesta nenhum fato; a ressalva é o risco ambiental. |
| 36f50005 | esquerda | verdadeiro | fora do jogo | "Criar empregos" aqui conta vínculos brutos; no mesmo texto, a Lupa julga Bolsonaro pelo saldo líquido. |
| a38f9b27 | esquerda | enganoso | fora do jogo | A fala diz R$ 15 bi e a Lupa compara com US$. Não achei a transcrição do JN que resolvesse a unidade. |
| 311499c1 | esquerda | enganoso | fora do jogo | Sai em par com 0aa8cac6: o enganoso vem só da regra do subestimado, e o Aos Fatos deu verdadeiro. |
| 0aa8cac6 | direita | enganoso | fora do jogo | "Mais de 40 milhões" continua correto com 50 a 61 milhões; o G1 deu fato. |
| 31b0b1d8 | direita | falso | fora do jogo | "Criado" pode ser lido como lançado (2020, no governo Bolsonaro); o Aos Fatos deu "não é bem assim". |
| 8ecc47f3 | direita | enganoso | fora do jogo | O Estadão deu verdadeiro e o Aos Fatos admite a queda; a diferença é ponto percentual contra percentual. |
| 7bb5f029 | direita | falso | fora do jogo | "Empresa fechada" pode ser falência ou CNPJ baixado, e as agências mediram coisas diferentes. A falência já está em 9b9c9f37. |
| d58b61f7 | esquerda | enganoso | texto e explicação | O cartão não dizia o período, e a indústria cresceu 3,3% em 2024. O novo texto segue a fala, que está no presente. |
| b8b388ad | esquerda | enganoso | texto e explicação | O cartão traz o contexto ("99%") que explica o enganoso; a explicação passa a citar o Aos Fatos. |
| 068625bc | direita | falso | texto | Sai do cartão "citado em acusações", que não está na fala e contradiz c116b6d0. |
| e7107746 | esquerda | enganoso | explicação | Passa a dizer que as médias estão certas e o que a comparação omite. |
| 1d026a0f | esquerda | enganoso | explicação | Passa a dizer por que a omissão conta. |
| cbfe2cc3 | esquerda | verdadeiro | explicação | Entra a prisão preventiva, que liga a defesa ao "não fosse preso". |
| c1a7f728 | esquerda | verdadeiro | explicação | Entra que o Aos Fatos chama as declarações de "43 mentiras". |
| b050f376 | esquerda | verdadeiro | explicação | Entra que o Aos Fatos considerou o número próximo do real. |
| c6a6d3f6 | esquerda | verdadeiro | explicação | Entra que a Lupa deu verdadeiro antes da sanção. |

Ficam como estão, depois de relidos: 6cb41c76, 39d72128, 3bd5c055, f0fe3e98, 6b98ca43, 66c9e995, ac343dd1, d8286620, cdb9ede4, 912298e6, 715b54f2, fbf784ba e 392ba64f. Em todos, a explicação diz por que o veredito vale.

## Contagem por lado

- Candidatos: 13 de 77 na esquerda (16,9%) e 13 de 101 na direita (12,9%). A diferença vem em boa parte de três "falta contexto" da Lupa em discursos de Lula em que a agência confirma os fatos. Repassei a direita procurando o mesmo padrão, e foi assim que entraram 8ecc47f3 e 0aa8cac6.
- Saem 5 itens da esquerda e 4 da direita. Os pares tratados juntos são 0aa8cac6 com 311499c1 (subestimado) e 412551cb com 8ecc47f3 (fala quase verdadeira, admitida pela agência).
- Itens em jogo, antes → depois:
  - esquerda: 77 → 72 (verdadeiro 34 → 33, enganoso 30 → 26, falso 13);
  - direita: 101 → 97 (falso 60 → 58, enganoso 28 → 26, verdadeiro 13).

## Não verificado

- **a38f9b27:** se Lula disse reais ou dólares no JN. A Lupa transcreve "R$" e compara com "US$", e não achei outra checagem da mesma fala. Se a transcrição mostrar dólares, o item pode voltar com o cartão em US$.
- **7bb5f029:** se 2025 foi recorde de CNPJs baixados. O Sebrae fala em 2,8 milhões em 2025 contra 2,4 milhões em 2024, com recortes diferentes, e não encontrei fonte que fale em recorde.
- **6b98ca43:** se a Lei 14.790/2023 liberou os jogos de cassino online, como o "tigrinho".
- Não reli as páginas dos itens sem candidato; a triagem desses foi só pelo JSON.
