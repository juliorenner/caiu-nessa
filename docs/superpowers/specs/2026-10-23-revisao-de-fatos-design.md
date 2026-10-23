# Revisão mensal de fatos por agente (2026-10-23)

## Intenção

O Julio quer que o banco de afirmações (`src/data/afirmacoes.json`) seja revisado sozinho, de tempos em tempos, e que a revisão chegue como uma PR para ele aprovar: corrigir o que mudou nas checagens, tirar o que não se sustenta mais e acrescentar afirmações novas. Começa uma vez por mês, para o custo ficar baixo ("podemos começar com o job executando uma vez por mês"), com disparo manual para rodar antes.

## Goals

- Um workflow do GitHub Actions, agendado no dia 1 de cada mês às 09:00 de São Paulo e disparável à mão, roda o Claude Code dentro do runner e abre uma PR com as mudanças. Sem chave de API guardada: a autenticação na Anthropic é por federação de identidade do GitHub Actions.
- O prompt da revisão fica versionado no repo, como skill, para ser lido e ajustado por PR.
- Toda mudança respeita as regras editoriais de `/como-escolhemos` e passa pelos testes do pool antes de a PR existir.
- A PR nunca é mesclada pelo bot: o Julio revisa.

## Non-goals

- Nenhum veredito próprio: o agente só transcreve o rótulo das agências. Sem agência, sem afirmação.
- Sem auto-merge, sem mexer em código, textos do site ou outros arquivos de dados.
- Sem painel ou relatório fora da própria PR.

## Anti-goals

- Inventar citação, fonte ou data. Uma afirmação sem URL de checagem que responda 200 é uma falha, não um item.
- Desequilibrar o pool: a PR não pode deixar um par (lado, veredito) abaixo do mínimo, nem favorecer um lado no volume de novas.

## O que roda

**Workflow `.github/workflows/revisao-de-fatos.yml`**

- `on: schedule` (`0 12 1 * *`) e `workflow_dispatch` (entrada opcional `modelo`, padrão `claude-sonnet-5-5`).
- `permissions`: `contents: write`, `pull-requests: write`, `id-token: write`.
- `concurrency` por workflow, sem cancelar o que está rodando.
- Passos: checkout (`persist-credentials: false`), Node pelo `.nvmrc`, `npm ci`, e `anthropics/claude-code-action` com SHA fixo, a federação OIDC em vez de `anthropic_api_key`, `prompt: /revisao-de-fatos` e `claude_args` com `--model`, `--max-turns` e a lista fechada de ferramentas: `WebFetch`, `WebSearch`, `Read`, `Edit(src/data/afirmacoes.json)`, `Write(docs/superpowers/notes/*)` (as regras de permissão do Claude Code aceitam caminho entre parênteses: o bot só edita o JSON e só escreve a nota), `Bash(npm test)`, `Bash(npx tsx scripts/verificar-fontes.ts)`, `Bash(npx tsx scripts/validar-revisao.ts)`, `Bash(git diff:*)`, `Bash(git status:*)`, `Bash(git checkout -b:*)`, `Bash(git add:*)`, `Bash(git commit:*)`, `Bash(git push -u origin bot/revisao-de-fatos-:*)` (só branches do bot), `Bash(gh pr create:*)`, `Bash(gh pr list:*)`.
- `timeout-minutes: 45`.
- Antes de chamar o agente, um passo com `gh pr list` procura PR aberta de `bot/revisao-de-fatos-*`; se houver, o job termina sem rodar o agente (guarda fora do prompt). *(Decisão do controlador.)*
- Autenticação no GitHub: pelo app "Claude" do GitHub instalado no repo, que a action usa por padrão e com o qual configura o `git push` (a PR aberta por ele dispara o CI; com o `GITHUB_TOKEN` padrão não dispara, e os checks obrigatórios da `main` nunca rodariam). O workflow não recebe `github_token`. Se o Julio preferir um token pessoal, é uma linha a mais (`github_token: ${{ secrets.BOT_GITHUB_TOKEN }}`) numa PR futura. *(Decisão do controlador: só o app; o Julio instala.)*
- O `modelo` do disparo manual é `type: choice` (Sonnet 5.5 ou Opus 5.5): nada de texto livre indo parar nos argumentos do agente.
- `scripts/verificar-fontes.ts` passa a conferir só os itens em jogo: um item fora do jogo pode ter a checagem retirada do ar sem bloquear a revisão nem a verificação semanal. O validador também recusa mudança de `lado` em item existente.
- Autenticação na Anthropic: federação de identidade (OIDC do GitHub Actions), sem chave estática, conforme o Julio pediu; os detalhes de configuração (Console e entradas da action) ficam no plano.

**Skill `.claude/skills/revisao-de-fatos/SKILL.md`** (o prompt)

1. Contexto: o que é o jogo, o esquema de uma afirmação (campos e limites de `src/lib/afirmacoes.ts`), as regras editoriais (texto neutro em terceira pessoa, citação literal com ao menos 10 caracteres, `lado` por quem disse, mapeamento de rótulos para os três vereditos, discordância entre agências, `observacao` = fora do jogo) e a lista fechada de agências, a mesma que o esquema aceita em `fonteEhPermitida` e que a página "Como escolhemos" cita: Aos Fatos, Lupa, Comprova, G1 Fato ou Fake e Estadão Verifica. *(Decisão do controlador: o builder-check notou que UOL Confere e AFP Checamos não passam no esquema; saem da lista em vez de alargar o código.)*
2. Revisar os itens existentes: para cada `fonte_url`, buscar a página e conferir que a checagem está no ar e que `veredito`, `citacao`, números da `explicacao` e `data_checagem` batem. Divergência: corrigir o campo; checagem retirada ou veredito que saiu dos três: `observacao` explicando. Item já com `observacao`: reavaliar; se a divergência foi resolvida, pode voltar.
3. Adicionar novas: pesquisar nas agências checagens publicadas depois da `data_checagem` mais recente do pool sobre Lula/PT e Flávio Bolsonaro/PL (ou falas de aliados atribuídas a um lado), priorizando o que mais circulou e os pares (lado, veredito) com menos jogáveis. Até 6 por rodada, no máximo 3 por lado. Cada nova: `id` de 8 hexadecimais únicos, `texto` neutro, `citacao` literal, `autor` com nome, partido e ocasião, `explicacao` com 40+ caracteres citando a agência, `fonte_nome`, `fonte_url` (respondendo 200), `data_checagem`.
4. Validar: `npm test` (inclui `tests/data/afirmacoes-reais.test.ts`, que roda `validarPool`, as regras de texto neutro e o mínimo por par), `npx tsx scripts/verificar-fontes.ts` (todas as URLs respondendo 200) e `npx tsx scripts/validar-revisao.ts`, um script novo que compara o JSON com `origin/main` e falha se houver mais de 6 novas, mais de 3 novas num lado, id repetido ou fora do formato, ou item removido (item sai do jogo por `observacao`, nunca por exclusão). Falhou: corrigir ou descartar o item; nunca abrir PR com teste vermelho. *(Decisão do controlador: os limites de volume saem do prompt e viram script, com teste próprio.)*
5. Entregar: se o `git diff` do JSON está vazio (mudança em `observacao` conta como mudança), terminar sem PR e dizer por quê no log. Senão, branch `bot/revisao-de-fatos-AAAA-MM-DD`, um commit só em `src/data/afirmacoes.json` e `docs/superpowers/notes/AAAA-MM-DD-revisao-de-fatos.md` (a tabela do que foi conferido, no formato da auditoria de 2026-10-23), e `gh pr create` com título `Revisão de fatos de <mês>/<ano>`, corpo com três listas (corrigidas, fora do jogo, novas; cada linha com id, lado, veredito e link da fonte) e o rodapé "🤖 PR automática da revisão mensal; revise antes de mesclar". Se já houver uma PR aberta de `bot/revisao-de-fatos-*`, não abrir outra.

**Guardas fora do prompt**

- A lista de ferramentas limita o bot a ler, buscar na web, editar e rodar os três comandos de validação; nada de `rm`, `npm install` ou push na `main` (a proteção da `main` barra push direto de qualquer forma).
- A PR passa pelo CI normal (lint, testes, build, e2e), pelo CodeQL e pelo cubic.
- `tests/data/afirmacoes-reais.test.ts` é o contrato: tudo que o bot escrever precisa passar nele.

## Custo e cadência

Mensal. Estimativa (não verificada) de alguns dólares por rodada com Sonnet 5.5, dominada pelas buscas e leituras de páginas; `--max-turns` limita o teto. Para rodar antes do dia 1, o disparo manual; para a primeira rodada, disparo manual logo depois do merge, para validar o fluxo inteiro (chave, app, PR, CI).

## Deixado ao construtor

Texto exato do prompt (dentro das regras acima), SHA da action, nome das entradas do `workflow_dispatch`. A nota em `docs/` é escrita pelo bot (`Write` restrito à pasta).
