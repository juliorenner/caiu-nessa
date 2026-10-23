# Regras de veredito, alcance e lote de outubro (2026-10-23)

## Intenção

Três decisões do Julio no mesmo dia, depois da varredura das agências (`docs/superpowers/notes/2026-10-23-varredura-de-checagens.md`):

1. **Rótulos de contexto contam como enganoso** e divergência se resolve por maioria: os 8 itens hoje "fora do jogo" voltam. Premissa mantida: só checagens das cinco agências; nada de reportagem como fonte ("vamos manter a premissa de notícias checadas por agências por hora").
2. **Alcance** (1 a 3) em cada afirmação, com critério objetivo e publicado, e a primeira rodada dando preferência aos de maior alcance, sem mudar a composição por lado e veredito ("acho que o critério alcance faz sentido").
3. **Lote de ~30 afirmações novas** da varredura, priorizando duas ou mais agências e debate/TV, para deixar cada par lado × veredito com ao menos 8 jogáveis.

## Regras novas (texto de "Como escolhemos", README e skill `revisao-de-fatos`)

- Mapeamento: verdadeiro = Verdadeiro/Fato; falso = Falso/Fake/Mentira; enganoso = Enganoso, Exagerado, Distorcido, Fora de contexto, **Falta contexto**, Impreciso, Não é bem assim, **Verdadeiro em partes**, **Subestimado**. Rótulos que não dizem se é verdade ou mentira (Insustentável, Contraditório, Ainda é cedo, Sem contexto suficiente) não contam como voto.
- Divergência entre agências: **verdadeiro contra falso = fora do jogo**; nos outros casos vale a **maioria** dos votos; empate entre verdadeiro e enganoso = enganoso; empate entre falso e enganoso = falso. (Decisão do Julio: "maioria ampla" no exemplo 3 a 1 é verdadeiro.)
- Alcance, publicado na página: **3** = dita em debate ou entrevista de TV nacional (Band, Globo, JN) **e** checada por duas ou mais agências; **2** = debate ou entrevista de TV nacional, uma agência; **1** = o resto (post, live, podcast, fala avulsa). "A primeira rodada dá preferência às afirmações de maior alcance, igualmente nos dois lados; a composição por lado e veredito não muda."

## Código

- `src/lib/afirmacoes.ts`: campo obrigatório `alcance: 1 | 2 | 3` (`z.union([z.literal(1), z.literal(2), z.literal(3)])`), tipo `Alcance`. `sortearRodada` ganha o parâmetro opcional `pesos?: Readonly<Record<Alcance, number>>`: com pesos, o sorteio dentro de cada par é **ponderado sem reposição** (sorteio de um item com probabilidade proporcional ao peso, remove, repete); sem pesos, igual a hoje. Fixtures e `criar()` dos testes ganham `alcance` (1 por padrão).
- `src/lib/rodadas.ts`: `PESO_POR_ALCANCE: Readonly<Record<Alcance, number>> = { 1: 1, 2: 2, 3: 4 }` e `PESOS_DA_PRIMEIRA = PESO_POR_ALCANCE` (as extras continuam sem peso). É a única knob: zerar a preferência é trocar os três números por 1.
- `src/lib/rodada-api.ts` (ou onde a primeira rodada é sorteada): passa `PESOS_DA_PRIMEIRA` só na primeira rodada.
- Testes: esquema recusa `alcance` ausente ou 4; `sortearRodada` com pesos {1:1, 2:1, 3:100} num par com um item de alcance 3 e nove de alcance 1 escolhe o de 3 em ≥ 95 % de 500 sorteios com RNG semeado; sem pesos, distribuição uniforme (cada item entre 5 % e 15 % em 2000 sorteios); composição por par continua exata; `tests/data/afirmacoes-reais.test.ts` exige `alcance` em todos e confere os critérios de forma heurística (item cujo `autor` menciona debate/Jornal Nacional/TV Globo tem alcance ≥ 2).
- Página `/como-escolhemos`: parágrafo das regras novas e do alcance; `tests/app/como-escolhemos` (se existir) atualizado; `textos-derivados` continua valendo.
- `/afirmacoes`: mostra o alcance de cada item como selo pequeno ("Alcance 3") para transparência.
- Skill `revisao-de-fatos`: tabela ganha `alcance` com o critério; mapeamento e divergência atualizados; o agente preenche `alcance` em novas e revisa nas existentes.

## Dados

- Os 8 itens com `observacao` voltam: tirar `observacao`, recalcular o veredito pela regra nova (agência a agência, citando todas na `explicacao`), e `alcance`. Previsão: 78% endividados e dívida de R$ 11 trilhões = verdadeiro (3 a 1); recorde de empresas fechadas = falso (2 a 1); penduricalhos, Lei Antifacção, sétima economia, 22 milhões de empregos e FMI = enganoso (empate ou só rótulos de contexto).
- `alcance` dos 45 atuais conforme a tabela aprovada pelo Julio (alcance 3: viagens com Janja, Nóbrega, "mentia 11 vezes", inflação de alimentos, e Ana Clara por AF + G1; podcast Flow e falas avulsas = 1; o resto = 2), revisto contra a varredura (segunda agência eleva para 3).
- Lote: ~30 novas da varredura, priorizando duas ou mais agências e debate/TV, até cada par ter ≥ 8 jogáveis (direita verdadeiro leva todos os 6 disponíveis). Cada nova com citação literal conferida na página, `explicacao` citando todas as agências e `alcance`. Tudo validado por `npm test`, `verificar-fontes`, `validar-revisao` (limite de 6 novas por rodada **não** vale para este lote humano: rodar com `LIMITES` relaxados ou pular o script neste PR) e `conferir-citacoes` nos itens novos e alterados.

## Non-goals

Reportagem como fonte; mudança de composição das rodadas; interface além do selo de alcance em `/afirmacoes`.

## Deixado ao construtor

Implementação do sorteio ponderado (uma função pura testada), a forma do selo de alcance, o texto exato dos parágrafos novos (dentro das regras acima).
