# Revisão mensal de fatos: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um workflow mensal que roda o Claude Code no Actions, revisa `src/data/afirmacoes.json` contra as agências e abre uma PR para o Julio aprovar.

**Architecture:** Três peças: o workflow (agenda, guardas, autenticação por federação OIDC e pelo app do GitHub, lista fechada de ferramentas), o prompt como skill versionada (`.claude/skills/revisao-de-fatos/SKILL.md`) e um validador de revisão (`src/lib/revisao-do-pool.ts` + `scripts/validar-revisao.ts`) que compara o JSON com a `main` e impõe os limites de volume fora do prompt.

**Tech Stack:** GitHub Actions, `anthropics/claude-code-action` v1.0.99 (SHA fixo), federação OIDC do Console da Anthropic, TypeScript/tsx, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-23-revisao-de-fatos-design.md`

## Global Constraints

- Ações com SHA fixo e comentário `# vX.Y.Z`; `persist-credentials: false` no checkout; `permissions` mínimas no job, `permissions: {}` no topo.
- Nada de `anthropic_api_key`: só `anthropic_federation_rule_id`, `anthropic_organization_id`, `anthropic_service_account_id`, `anthropic_workspace_id` (identificadores, no YAML).
- Agências aceitas = as de `fonteEhPermitida`: Aos Fatos, Lupa, Comprova, G1 Fato ou Fake, Estadão Verifica.
- Limites: até 6 novas por rodada, até 3 por lado; nenhum item removido; ids de 8 hexadecimais únicos.
- Textos em pt-BR; nada de ids `JUL-n` na PR do bot.

## Review Focus

1. Pool depois da revisão com item a menos (bot apagou em vez de marcar `observacao`): `validar-revisao` deve falhar (teste no Task 1).
2. Sete novas, ou quatro num lado: falha (Task 1).
3. Id novo fora do formato ou repetido: falha (Task 1).
4. JSON inválido para `validarPool` (par abaixo do mínimo): falha com a mensagem do `validarPool` (Task 1).
5. Já existe PR aberta do bot: o job termina sem rodar o agente (Task 2, conferido na primeira execução manual).

---

### Task 1: Validador de revisão

**Files:**
- Create: `src/lib/revisao-do-pool.ts`
- Create: `scripts/validar-revisao.ts`
- Test: `tests/lib/revisao-do-pool.test.ts`

**Interfaces:**
- Produces: `LIMITES_DA_REVISAO = { novasPorRodada: 6, novasPorLado: 3 }`; `compararPools(antes: unknown, depois: unknown, limites = LIMITES_DA_REVISAO): string[]` (lista de problemas; vazia = ok). Valida `depois` com `validarPool` (problema único com a mensagem dele se falhar); `antes` idem. Problemas: id removido (`removido: <id>`), id fora de `/^[0-9a-f]{8}$/` (`id inválido: <id>`), mais de `novasPorRodada` novas (`<n> novas, limite 6`), mais de `novasPorLado` num lado (`<n> novas à esquerda, limite 3`).
- Script: lê o JSON do disco e `git show ${BASE_REF ?? 'origin/main'}:src/data/afirmacoes.json`; imprime os problemas e sai com 1, ou `OK: <n> novas, <m> alteradas` e sai com 0.

- [ ] **Step 1: Testes** em `tests/lib/revisao-do-pool.test.ts`, com `afirmacoesValidas` da fixture como `antes`: igual → `[]`; 1 nova válida → `[]`; 7 novas (4 esq, 3 dir) → contém `7 novas, limite 6` e `4 novas à esquerda, limite 3`; item removido → `removido: e1`; id `ZZ` → `id inválido: ZZ`; `depois` com e1 e e2 virando enganoso (esquerda:verdadeiro abaixo do mínimo) → um problema que começa com `Afirmações inválidas`; marcar `observacao` num item existente → `[]`.
- [ ] **Step 2:** rodar, ver falhar.
- [ ] **Step 3:** implementar `compararPools` e o script.
- [ ] **Step 4:** `npx vitest run tests/lib/revisao-do-pool.test.ts` verde; `npx tsx scripts/validar-revisao.ts` na árvore limpa imprime `OK: 0 novas, 0 alteradas`.
- [ ] **Step 5:** commit `feat(revisao): validador de revisão do pool`.

### Task 2: Workflow e skill

**Files:**
- Create: `.github/workflows/revisao-de-fatos.yml`
- Create: `.claude/skills/revisao-de-fatos/SKILL.md`

- [ ] **Step 1:** workflow conforme o spec: `schedule` `0 12 1 * *` + `workflow_dispatch` (input `modelo`, default `claude-sonnet-5-5`); `concurrency` `revisao-de-fatos` sem cancelar; job `revisar` (timeout 45, permissions contents/pull-requests/id-token write); passo `gh pr list --search "head:bot/revisao-de-fatos-"` → output `pendente`; os passos seguintes com `if: steps.pendente.outputs.n == '0'`; checkout (`persist-credentials: false`), setup-node, `npm ci`; `anthropics/claude-code-action@12310e4417c3473095c957cb311b3cf59a38d659 # v1.0.99` com os quatro ids de federação, `prompt: /revisao-de-fatos` e `claude_args` com `--model`, `--max-turns 150` e `--allowedTools` fechado (spec).
- [ ] **Step 2:** skill com o prompt do spec (contexto, revisar, adicionar, validar, entregar), em pt-BR, incluindo o esquema dos campos e o mapeamento de rótulos.
- [ ] **Step 3:** `actionlint` local verde; zizmor roda no CI.
- [ ] **Step 4:** commit `ci: revisão mensal de fatos por agente`.

### Task 3: Documentação e primeira execução

- [ ] **Step 1:** README: seção curta "Revisão mensal de fatos" (o que roda, como disparar à mão, o que o Julio confere na PR).
- [ ] **Step 2:** PR; depois do merge e da instalação do app, `gh workflow run revisao-de-fatos.yml` e acompanhar: federação aceita (histórico no Console), PR aberta, CI rodando nela.
