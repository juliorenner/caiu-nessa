---
name: revisao-de-fatos
description: Revisão mensal do banco de afirmações do Caiu Nessa? (src/data/afirmacoes.json) contra as agências de checagem, com PR para o dono aprovar. Usada pelo workflow .github/workflows/revisao-de-fatos.yml; pode ser rodada localmente.
---

# Revisão de fatos

Você está revisando o banco de afirmações do **Caiu Nessa?**, um quiz neutro em português sobre o segundo turno presidencial de 2026 (Lula/PT = `esquerda`, Flávio Bolsonaro/PL = `direita`). O jogador vê uma afirmação e diz se é verdade, mentira ou enganosa; o veredito vem sempre de uma agência de checagem, nunca do jogo. Tudo o que você escrever vai para uma PR que o dono revisa antes de entrar. Trabalhe em português.

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
| `observacao` | opcional; presente = item **fora do jogo** (aparece só na lista pública), com o motivo |

Mapeamento de rótulos das agências: verdadeiro = Verdadeiro/Fato; falso = Falso/Fake/Mentira; enganoso = Enganoso, Exagerado, Distorcido, Fora de contexto, Impreciso, "Não é bem assim". Rótulos fora desses três (Insustentável, Subestimado, Contraditório, Sem contexto suficiente etc.) não entram. Agências discordando: verdadeiro contra falso ou enganoso = fora do jogo; falso contra enganoso = vale a maioria, no empate falso.

Regras editoriais completas: `src/app/como-escolhemos/page.tsx`. Exemplo de uma revisão anterior: `docs/superpowers/notes/2026-10-23-auditoria-de-fatos.md`.

## 1. Revisar o que existe

Para cada item (inclusive os com `observacao`):

1. Busque a `fonte_url` com WebFetch. Confira que a checagem continua no ar e que `veredito`, `citacao`, os números da `explicacao` e a `data_checagem` batem com a página.
2. Divergência num campo: corrija o campo.
3. Checagem retirada do ar, veredito mudado para fora dos três, ou outra agência da lista com veredito incompatível: adicione `observacao` explicando (o item sai do jogo). Nunca apague um item, nem mude o `lado` de um item existente. Itens fora do jogo não entram no verificador de links.
4. Item que já tem `observacao`: reavalie. Se o motivo não vale mais, remova a `observacao` e ele volta ao jogo.

Páginas que não carregam no WebFetch: tente uma vez mais; se continuar, registre na nota como "não verificado" e não altere o item.

## 2. Adicionar novas

Pesquise com WebSearch checagens publicadas depois da `data_checagem` mais recente do arquivo, só nestes sites: aosfatos.org, agencialupa.org (ou lupa.uol.com.br), projetocomprova.com.br, g1.globo.com/fato-ou-fake, estadao.com.br (Estadão Verifica). Assunto: falas de Lula, Flávio Bolsonaro, seus vices e aliados sobre a disputa, atribuídas a um lado pela agência.

Prioridade: o que mais circulou; e os pares (lado, veredito) com menos itens jogáveis no arquivo (conte antes de escolher). Limites, conferidos pelo script: **até 6 novas por rodada, até 3 por lado**. Prefira menos itens bem documentados a muitos fracos.

Cada nova afirmação precisa de todos os campos da tabela. Gere o `id` com 8 hexadecimais aleatórios que não existam no arquivo. A `citacao` é a fala literal, copiada da checagem; se a checagem não traz a fala literal, não entra.

## 3. Validar

Antes de qualquer commit, rode nesta ordem e corrija até os três passarem:

```
npm test
npx tsx scripts/verificar-fontes.ts
npx tsx scripts/validar-revisao.ts
```

Falha que você não consegue resolver: descarte o item novo que a causou, ou desfaça a mudança no item existente; nunca abra PR com algo vermelho.

## 4. Entregar

- `git diff --stat src/data/afirmacoes.json` vazio (nenhuma mudança, nem em `observacao`): termine sem PR e diga no log o que conferiu.
- Caso contrário:
  1. Escreva `docs/superpowers/notes/AAAA-MM-DD-revisao-de-fatos.md` (data de hoje) com: como verificou, a tabela id / lado / veredito / fonte OK? / veredito bate? / mudança, e a lista de novas com fonte.
  2. `git checkout -b bot/revisao-de-fatos-AAAA-MM-DD`, `git add src/data/afirmacoes.json docs/superpowers/notes/AAAA-MM-DD-revisao-de-fatos.md`, um commit com título `revisão de fatos de <mês>/<ano>` e corpo resumindo contagens.
  3. `git push -u origin bot/revisao-de-fatos-AAAA-MM-DD` (só branches com esse prefixo têm permissão de push).
  4. `gh pr create` com título `Revisão de fatos de <mês>/<ano>` e corpo em três listas, **Corrigidas**, **Fora do jogo** (ou de volta) e **Novas**, cada linha com id, lado, veredito e o link da fonte; depois a linha de rodapé: `🤖 PR automática da revisão mensal; revise antes de mesclar.`
- Antes de abrir, `gh pr list --state open --json headRefName` e procure um `headRefName` começando com `bot/revisao-de-fatos-`: se já houver, não abra outra; diga isso no log.

## Nunca

- Inventar citação, fonte, data ou número. Sem página da agência, o item não existe.
- Dar veredito próprio ou "ajustar" o rótulo da agência.
- Editar qualquer arquivo além de `src/data/afirmacoes.json` e da nota em `docs/superpowers/notes/`.
- Mesclar a PR, mexer na `main` ou fechar PRs.
