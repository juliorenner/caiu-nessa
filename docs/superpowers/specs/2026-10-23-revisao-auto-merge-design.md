# Auto-merge das PRs do bot de revisão (2026-10-23)

## Intenção

O Julio quer que a PR mensal de revisão de fatos entre sozinha: um agente corrige os apontamentos do cubic, e a PR é mesclada quando tudo está verde ("have an agent triggered to fix the comments automatically and then auto merge if it's all green, all tests passed"). Ele aceitou o risco editorial de conteúdo entrar sem leitura humana, apoiado na cobertura de testes da PR de cobertura dos dados (spec anterior) e no CI, que roda Playwright em toda PR.

## Escopo

Só PRs cujo branch começa com `bot/revisao-de-fatos-` e vem do próprio repo. PRs de pessoas (do Julio ou do assistente) não mudam.

## O que roda (`.github/workflows/revisao-auto-merge.yml`)

Três jobs, cada um com `if` que exige `head.repo == repo` e o prefixo do branch:

1. **ligar** (`pull_request` `opened`/`reopened`): `gh pr merge --auto --merge`, rodado pelo agente (um comando, `--max-turns 3`) para que o auto-merge fique em nome do app do GitHub: um merge feito pelo `GITHUB_TOKEN` não dispararia o `deploy.yml` nem a fumaça (eventos do `GITHUB_TOKEN` não criam execuções). O GitHub mescla quando os checks obrigatórios da `main` (`ci`, `codeql`) passam e as conversas estão resolvidas. *(Decisão do controlador, a partir da revisão de segurança.)*
2. **desligar** (`pull_request_review` `submitted` por uma conta que não é bot, com `changes_requested`): `gh pr merge --disable-auto`. Um humano pedindo mudança trava o automático; religar é manual.
3. **corrigir** (`pull_request_review` `submitted` por `cubic-dev-ai[bot]`): roda o Claude Code com a skill `corrigir-revisao` no branch da PR. Teto: no máximo 2 rodadas por PR, contadas pelas execuções deste workflow no branch (um merge de "Update branch" não conta); ao passar do teto, o job comenta na PR mencionando o dono e para. Mesma federação OIDC e app do GitHub da revisão mensal; `allowed_bots` inclui o cubic porque ele é o ator do evento.

Os jobs com agente declaram `environment: revisao`: em eventos de PR o subject do token OIDC não traz o branch (`repo:…:pull_request`), e com o environment ele vira `repo:juliorenner/caiu-nessa:environment:revisao`, que uma segunda regra de federação aceita. *(Decisão do controlador.)*

## A skill `corrigir-revisao`

1. Lê as threads de revisão não resolvidas da PR por `scripts/threads-da-revisao.ts listar`, que devolve só threads abertas pelo `cubic-dev-ai` e só os comentários dele; comentários de qualquer outra conta nunca chegam ao agente.
2. Para cada apontamento: se procede e cabe nas regras (só `src/data/afirmacoes.json` e a nota em `docs/superpowers/notes/`), corrige; se não procede, responde na thread explicando. Em ambos os casos resolve a thread (a `main` exige conversas resolvidas).
3. Roda as validações da revisão (`npm test`, `verificar-fontes`, `validar-revisao`); nada vermelho sobe.
4. Um commit "corrige apontamentos da revisão" e exatamente `git push origin HEAD` (o único push permitido). O push dispara o CI de novo; a PR mescla sozinha quando passar.

## Guardas fora do prompt

- Ferramentas fechadas, iguais à revisão mensal; o GitHub só é tocado pelo script de threads (listar, responder, resolver) e pelo push do branch atual. Nada de `gh api`.
- `concurrency` por PR, sem cancelar.
- Repo com "Allow auto-merge" ligado e environment `revisao` criado (configurações do repositório, feitas junto com esta PR); segunda regra de federação no Console com subject `repo:juliorenner/caiu-nessa:environment:revisao` (feita pelo Julio).
- O job `revisao` do CI (validador contra a base, links, citações) continua rodando a cada push.

## Fora do escopo

Correções pedidas por humanos (a skill ignora), PRs de pessoas, e qualquer mudança no fluxo de deploy.
