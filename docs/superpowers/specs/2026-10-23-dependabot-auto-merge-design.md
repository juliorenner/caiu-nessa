# Auto-merge do Dependabot (2026-10-23)

Decisão do Julio: "patch e minor automático, major fica para você", com um agente revisando antes.

- `dependabot-auto-merge.yml`: em `pull_request` do `dependabot[bot]` (mesmo repo), `dependabot/fetch-metadata` classifica a atualização. Major: comentário avisando que é revisão humana, sem auto-merge. Patch e minor: um agente (Claude Code na action, federação OIDC pela regra `revisao` via `environment: revisao`, `allowed_bots: dependabot[bot]`) lê o diff e as notas da versão; sem risco, roda `gh pr merge --auto --merge` em nome do app (merge que dispara o deploy) e comenta um resumo; com risco, não liga o automático e comenta mencionando o dono. Ferramentas fechadas: leitura, WebFetch, `gh pr view/diff/merge/comment`.
- O CI obrigatório da `main` (`ci`, `codeql`) continua sendo o gate; o auto-merge só executa quando passa.
- Também nesta PR: a action `anthropics/claude-code-action` passou de v1.0.99 para v1.0.255 nos workflows de revisão (a versão antiga não tinha as entradas de federação) e os jobs com `environment: revisao` apontam para a segunda regra de federação (`fdrl_012sQ6GfsDLeD93ZXqCzmmar`).
