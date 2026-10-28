---
name: revisao-de-fatos
description: Revisão mensal do banco de afirmações do Caiu Nessa? (src/data/afirmacoes.json) contra as agências de checagem, com PR para o dono aprovar. Usada pelo workflow .github/workflows/revisao-de-fatos.yml; pode ser rodada localmente.
---

# Revisão de fatos

Você está revisando o banco de afirmações do **Caiu Nessa?**, um quiz neutro em português sobre afirmações do mundo político brasileiro, de esquerda (`esquerda`) e de direita (`direita`). Boa parte do arquivo vem da eleição presidencial de 2026 (Lula/PT e Flávio Bolsonaro/PL), mas o jogo não é mais só sobre ela. O jogador vê uma afirmação e diz se é verdade, mentira ou enganosa; o veredito vem sempre de uma agência de checagem, nunca do jogo. Tudo o que você escrever vai para uma PR que o dono revisa antes de entrar. Trabalhe em português.

## O arquivo

`src/data/afirmacoes.json` é uma lista de objetos com estes campos (esquema em `src/lib/afirmacoes.ts`):

| campo | regra |
|---|---|
| `id` | 8 caracteres hexadecimais minúsculos, único |
| `texto` | a afirmação em terceira pessoa, neutra, sem colchetes, sem "você", sem começar por "eu", sem "nós"/"a gente" |
| `citacao` | a fala original, literal, ao menos 10 caracteres |
| `lado` | `esquerda` ou `direita`: de quem disse ou espalhou, conforme a agência atribui, não pelo assunto |
| `autor` | quem disse, com partido e ocasião ("Lula (PT), no debate da Band") |
| `veredito` | `verdadeiro`, `falso` ou `enganoso` |
| `explicacao` | ao menos 40 caracteres: o que a agência concluiu e por quê, citando a agência |
| `fonte_nome` | Aos Fatos, Lupa, Comprova, G1 Fato ou Fake ou Estadão Verifica |
| `fonte_url` | a página da checagem, numa dessas agências (o esquema recusa outros domínios), respondendo 200 |
| `data_checagem` | `AAAA-MM-DD` |
| `alcance` | `1`, `2` ou `3`: **3** = dita em debate ou entrevista de TV nacional (Band, Globo, JN) **e** checada por duas ou mais agências da lista; **2** = debate ou entrevista de TV nacional, checada por uma agência; **1** = o resto (post, live, podcast, fala avulsa) |
| `observacao` | opcional; presente = item **fora do jogo** (aparece só na lista pública), com o motivo |

Mapeamento de rótulos das agências: verdadeiro = Verdadeiro/Fato; falso = Falso/Fake/Mentira; enganoso = Enganoso, Exagerado, Distorcido, Fora de contexto, Falta contexto, Impreciso, "Não é bem assim", Verdadeiro em partes, Subestimado. Rótulos que não dizem se é verdade ou mentira (Insustentável, Contraditório, Ainda é cedo, Sem contexto suficiente) não contam como voto. Agências discordando: verdadeiro contra falso = fora do jogo; nos outros casos vale a maioria dos votos; empate entre verdadeiro e enganoso = enganoso; empate entre falso e enganoso = falso. A `explicacao` cita todas as agências que checaram a fala.

Regras editoriais completas: `src/app/como-escolhemos/page.tsx`. Exemplo de uma revisão anterior: `docs/superpowers/notes/2026-10-23-auditoria-de-fatos.md`.

Faça tudo você mesmo, em sequência: **não use subagentes**. O job termina quando a sua resposta termina, e trabalho delegado em segundo plano se perde (uma execução acabou com "aguardo as notificações dos subagentes" e sem PR).

## 1. Revisar o que existe

Para cada item (inclusive os com `observacao`):

1. Leia a página com `npx tsx scripts/pagina.ts <fonte_url>`: ele devolve o texto inteiro (sem o corte do WebFetch e sem recusar domínio) e traz os selos que ficam só em atributo, como `[SELO: FALSO]` do Aos Fatos. Uma página serve para todos os itens que a citam: leia cada página uma vez e confira todos os seus itens. Confira que a checagem continua no ar e que `veredito`, `citacao`, os números da `explicacao` e a `data_checagem` batem com a página. Revise o `alcance`: uma segunda agência da lista checando a mesma fala de debate ou TV nacional eleva 2 para 3.
2. Divergência num campo: corrija o campo.
3. Checagem retirada do ar, veredito mudado para rótulo que não conta como voto, ou outra agência da lista dizendo verdadeiro onde esta diz falso (ou o contrário): adicione `observacao` explicando (o item sai do jogo). Nunca apague um item, nem mude o `lado` de um item existente. Itens fora do jogo não entram no verificador de links.
4. Cartão que não consegue ser fiel à fala sem confundir (o veredito depende de um contexto que não cabe no cartão), ou afirmação datada (só fazia sentido durante uma campanha eleitoral: promessa de candidato, ato de campanha, a própria disputa): também é motivo para sair do jogo, mas é decisão do dono. Não adicione `observacao` por isso; registre o item na nota, com o porquê, para o dono decidir. Vale igual para os dois lados.
5. Item que já tem `observacao`: reavalie. Se o motivo não vale mais, remova a `observacao` e ele volta ao jogo.

Página que o script não consegue ler (erro HTTP ou tempo esgotado): tente uma vez mais; se continuar, registre o item na nota como "não verificado" e não o altere. A revisão só está completa quando todos os itens foram conferidos ou listados como "não verificado"; a nota diz quantos de cada.

## 2. Adicionar novas

Pesquise com WebSearch checagens publicadas depois da `data_checagem` mais recente do arquivo, só nestes sites: aosfatos.org, agencialupa.org (ou lupa.uol.com.br), projetocomprova.com.br, g1.globo.com/fato-ou-fake, estadao.com.br (Estadão Verifica). Assunto: falas de políticos de esquerda ou de direita, de qualquer partido (políticos de centro só quando publicamente alinhados a um dos lados), e posts que circulam nas redes quando a agência diz quem os espalhou; o lado vem dessa atribuição. Não entram afirmações datadas, que só fazem sentido durante uma campanha eleitoral (promessa de candidato, ato de campanha, a própria disputa).

Prioridade: o que mais circulou; e os pares (lado, veredito) com menos itens jogáveis no arquivo (conte antes de escolher). Limites, conferidos pelo script: **até 6 novas por rodada, até 3 por lado**. Prefira menos itens bem documentados a muitos fracos.

Cada nova afirmação precisa de todos os campos da tabela, inclusive `alcance` pelo critério acima. Gere o `id` com 8 hexadecimais aleatórios que não existam no arquivo. A `citacao` é a fala literal, copiada da checagem; se a checagem não traz a fala literal, não entra.

## 3. Validar

Antes de qualquer commit, rode nesta ordem e corrija até os três passarem:

```
npm test
npx tsx scripts/verificar-fontes.ts
npx tsx scripts/validar-revisao.ts
```

Leia a saída de cada um até o fim: `npm test` termina com a contagem de testes passando; `verificar-fontes` imprime `OK <id>` para cada item em jogo e nenhum `FALHOU`; `validar-revisao` imprime `OK: n novas, m alteradas`. Só abra a PR depois de ver os três resultados; não presuma que passaram.

Falha que você não consegue resolver: descarte o item novo que a causou, ou desfaça a mudança no item existente; nunca abra PR com algo vermelho.

## 4. Entregar

- `git diff --stat src/data/afirmacoes.json` vazio (nenhuma mudança, nem em `observacao`): termine sem PR e diga no log o que conferiu.
- Caso contrário:
  1. Escreva `docs/superpowers/notes/AAAA-MM-DD-revisao-de-fatos.md` (data de hoje) com: como verificou, a tabela id / lado / veredito / fonte OK? / veredito bate? / mudança, e a lista de novas com fonte.
  2. `git checkout -b bot/revisao-de-fatos-AAAA-MM-DD`, `git add src/data/afirmacoes.json docs/superpowers/notes/AAAA-MM-DD-revisao-de-fatos.md`, um commit com título `revisão de fatos de <mês>/<ano>` e corpo resumindo contagens.
  3. Exatamente `git push -u origin HEAD` (o único push permitido; HEAD é o branch recém-criado).
  4. `gh pr create` com título `Revisão de fatos de <mês>/<ano>` e corpo em três listas, **Corrigidas**, **Fora do jogo** (ou de volta) e **Novas**, cada linha com id, lado, veredito e o link da fonte; depois a linha de rodapé: `🤖 PR automática da revisão mensal; revise antes de mesclar.`
- Antes de abrir, `gh pr list --state open --json headRefName` e procure um `headRefName` começando com `bot/revisao-de-fatos-`: se já houver, não abra outra; diga isso no log.

## Nunca

- Inventar citação, fonte, data ou número. Sem página da agência, o item não existe.
- Dar veredito próprio ou "ajustar" o rótulo da agência.
- Editar qualquer arquivo além de `src/data/afirmacoes.json` e da nota em `docs/superpowers/notes/`.
- Mesclar a PR, mexer na `main` ou fechar PRs.
