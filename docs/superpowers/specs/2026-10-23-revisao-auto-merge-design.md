# Auto-merge das PRs do bot de revisão (2026-10-23)

## Intenção

O Julio quer que a PR mensal de revisão de fatos entre sozinha: um agente corrige os apontamentos do cubic, e a PR é mesclada quando tudo está verde ("have an agent triggered to fix the comments automatically and then auto merge if it's all green, all tests passed"). Ele aceitou o risco editorial de conteúdo entrar sem leitura humana, apoiado na cobertura de testes da PR de cobertura dos dados (spec anterior) e no CI, que roda Playwright em toda PR.

## Escopo

Só PRs cujo branch começa com `bot/revisao-de-fatos-` e vem do próprio repo. PRs de pessoas (do Julio ou do assistente) não mudam.

## O que roda (`.github/workflows/revisao-auto-merge.yml`)

Três jobs, cada um com `if` que exige `head.repo == repo` e o prefixo do branch:

1. **ligar** (`pull_request` `opened`/`reopened`): `gh pr merge --auto --merge`. O GitHub mescla quando os checks obrigatórios da `main` (`ci`, `codeql`) passam e as conversas estão resolvidas. Depois do merge, deploy e fumaça como em qualquer PR.
2. **desligar** (`pull_request_review` `submitted` por uma conta que não é bot, com `changes_requested`): `gh pr merge --disable-auto`. Um humano pedindo mudança trava o automático; religar é manual.
3. **corrigir** (`pull_request_review` `submitted` por `cubic-dev-ai[bot]`): roda o Claude Code com a skill `corrigir-revisao` no branch da PR. Teto: no máximo 2 rodadas de correção por PR (o job sai sem rodar se `origin/<base>..HEAD` já tem 3 commits). Mesma federação OIDC e app do GitHub da revisão mensal; `allowed_bots` inclui o cubic porque ele é o ator do evento.

## A skill `corrigir-revisao`

1. Lê as threads de revisão não resolvidas da PR (GraphQL `reviewThreads`), só as abertas por `cubic-dev-ai`; comentários de qualquer outra conta são ignorados (um estranho não comanda o agente).
2. Para cada apontamento: se procede e cabe nas regras (só `src/data/afirmacoes.json` e a nota em `docs/superpowers/notes/`), corrige; se não procede, responde na thread explicando. Em ambos os casos resolve a thread (a `main` exige conversas resolvidas).
3. Roda as validações da revisão (`npm test`, `verificar-fontes`, `validar-revisao`); nada vermelho sobe.
4. Um commit "corrige apontamentos da revisão", push no mesmo branch (só `bot/revisao-de-fatos-*` tem permissão). O push dispara o CI de novo; a PR mescla sozinha quando passar.

## Guardas fora do prompt

- Ferramentas fechadas, iguais à revisão mensal, mais `gh api graphql` (ler e resolver threads, responder) e `gh pr view`.
- `concurrency` por PR, sem cancelar.
- Repo com "Allow auto-merge" ligado (configuração do repositório; feita junto com esta PR).
- O job `revisao` do CI (validador contra a base, links, citações) continua rodando a cada push.

## Fora do escopo

Correções pedidas por humanos (a skill ignora), PRs de pessoas, e qualquer mudança no fluxo de deploy.
