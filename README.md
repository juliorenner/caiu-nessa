# Caiu Nessa?

Quiz de checagem de fatos políticos, neutro e em português. A primeira rodada tem 10 afirmações políticas já checadas por agências de checagem, sorteadas de um conjunto maior, e dá para continuar jogando em rodadas de 6; para cada uma o jogador responde **VERDADE**, **MENTIRA** ou **ISSO ME CHEIRA MAL 🤔** (enganoso), arrastando o cartão (direita, esquerda ou para cima), pelos botões ou pelas setas do teclado. No fim vê a nota, o viés das respostas e como se saiu em comparação com os outros jogadores. É anônimo e não tem login.

## Regras de neutralidade

- Só entram checagens de cinco agências: Aos Fatos, Lupa, Comprova, G1 Fato ou Fake e Estadão Verifica. Toda afirmação tem link para a checagem original.
- Toda rodada tem o mesmo número de afirmações por lado, com a mesma composição de vereditos nos dois lados: a primeira 2 verdadeiras, 2 falsas e 1 enganosa por lado (10), as seguintes 1 de cada (6). O conjunto precisa ter ao menos 2 jogáveis de cada combinação lado × veredito.
- Rótulos de contexto ("Falta contexto", "Verdadeiro em partes", "Subestimado") contam como enganoso; rótulos que não dizem se é verdade ou mentira (Insustentável, Contraditório, Ainda é cedo, Sem contexto suficiente) não contam como voto.
- Quando as agências discordam: verdadeiro contra falso fica de fora; nos outros casos vale a maioria (empate entre verdadeiro e enganoso = enganoso; entre falso e enganoso = falso).
- Cada afirmação tem um alcance: 3 = debate ou entrevista de TV nacional e checada por duas ou mais agências; 2 = debate ou entrevista de TV nacional, uma agência; 1 = o resto (post, live, podcast, fala avulsa). A primeira rodada dá preferência às de maior alcance, igualmente nos dois lados; a composição por lado e veredito não muda.
- O lado é o de quem disse a frase, e nunca aparece durante o jogo.
- Nenhum texto do site apoia ou ataca um lado. O resultado mede a pessoa, não os políticos.

Os critérios completos estão na página `/como-escolhemos`. Todas as afirmações ficam em `src/data/afirmacoes.json`; as que têm `observacao` estão fora do jogo e aparecem só em /afirmacoes.

## Transparência

A especificação e os planos de implementação estão em `docs/superpowers/specs/` e `docs/superpowers/plans/`. O app foi construído com agentes de IA seguindo esses planos, e todo plano executado está no repositório. Os PRs são públicos no GitHub.

## Rodar localmente

Requisito: Node.js 22.12 ou mais recente.

```bash
npm ci
```

Crie um `.env.local` (veja `.env.example`):

```
DATABASE_URL=file:./.pglite
IP_HASH_SALT=<qualquer string aleatória>
```

```bash
npm run dev
```

Abra http://localhost:3000. Com `DATABASE_URL=file:...` o app usa um Postgres local (PGlite) no diretório `.pglite/`, que é ignorado pelo git; as migrações são aplicadas sozinhas no primeiro acesso.

## Testes e verificações

```bash
npm run lint                          # ESLint
npm test                              # testes (Vitest)
npm run typecheck                     # tipos
npm run build                         # build de produção
npx tsx scripts/verificar-fontes.ts   # acessa cada link de checagem
npx tsx scripts/validar-revisao.ts    # compara as afirmações com a main (revisão de fatos)
npx tsx scripts/conferir-citacoes.ts  # procura cada citação na página da agência (aviso; --todas, --estrito)
node scripts/capturas.mjs             # capturas de home, quiz e resultado (celular e desktop, claro e noite; --saida <dir>)
```

## Pipeline

GitHub Actions, em `.github/workflows/`:

- **Em cada PR** (`ci.yml`): lint, tipos, testes e build; `npm audit` das dependências de produção; actionlint e zizmor nos workflows; gitleaks procurando segredos. O check `ci` só passa com tudo verde. O CodeQL (`codeql.yml`) roda no PR, em `main` e toda semana.
- **Deploy** (`deploy.yml`): a cada push em `main` (ou manual), roda o mesmo CI e, se passar, aplica as migrações do banco e publica na Vercel. Esse é o único caminho para produção: a integração da Vercel com o GitHub serve só para **previews** de PR (`vercel.json` desliga os deploys da `main` pela integração; o Neon cria um ramo do banco por preview, e `IP_HASH_SALT` precisa existir no ambiente Preview).
- **Segredos**, no environment `production` do GitHub (Settings → Environments): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` e `DATABASE_URL`. Enquanto `VERCEL_PROJECT_ID` não estiver cadastrado, o deploy é pulado com um aviso, sem falhar.
- **Vigia semanal** (`vigia.yml`): toda quarta (ou manual) confere que home, quiz e API respondem e roda a fumaça Playwright (só leitura) contra produção; se algo falhar, abre ou atualiza a issue "Produção com problema". Para receber por e-mail também as falhas de qualquer workflow, ligue em GitHub → Settings → Notifications → Actions.
- **Links de checagem** (`fontes.yml`): toda segunda o script `verificar-fontes` acessa cada link; se algum quebrar, abre ou atualiza a issue "Link de checagem quebrado".
- **Revisão mensal de fatos** (`revisao-de-fatos.yml`): no dia 1 de cada mês (ou manual, em Actions → revisao-de-fatos → Run workflow) um agente (Claude Code no runner, prompt em `.claude/skills/revisao-de-fatos/SKILL.md`) lê cada página de checagem do banco com `scripts/pagina.ts` (texto inteiro, só agências aceitas, selos em atributo trazidos para o texto), confere todos os itens, acrescenta até 6 afirmações novas das agências aceitas e abre uma PR `bot/revisao-de-fatos-<data>`. Antes da PR ele roda os testes, o verificador de links e `scripts/validar-revisao.ts` (nada removido, ids válidos, limite de novas). Nas PRs do bot o CI ganha o job `revisao`: validador contra a base, links em jogo respondendo e, como aviso no resumo, a citação de cada item novo ou alterado procurada na página da agência. Autenticação na Anthropic com o token do Claude Code da conta do dono (assinatura Max; secret `CLAUDE_CODE_OAUTH_TOKEN` no ambiente `revisao`) e no GitHub pelo app "Claude". A federação de identidade foi tentada antes, mas o crédito mensal da assinatura não cobre o Claude Code.
- **Auto-merge das PRs do bot** (`revisao-auto-merge.yml`): ao abrir, liga o auto-merge (a PR entra quando `ci` e `codeql` passam e as conversas estão resolvidas); quando o cubic revisa, um agente (skill `corrigir-revisao`) trata cada apontamento, responde, resolve a thread e sobe a correção, no máximo duas rodadas; se um humano pede mudanças, o automático desliga. Decisão do dono: a revisão mensal entra sem leitura humana, apoiada nos testes de dados, na renderização de cada afirmação e no Playwright.
- O ESLint ainda não roda com o TypeScript 7, então o pacote `typescript` aponta para o TS 6 (`@typescript/typescript6`): é ele que o ESLint e a checagem de tipos do `next build` usam. O `tsc` do `npm run typecheck` vem do TS 7 (`@typescript/native`). Quando o typescript-eslint suportar o TS 7, o alias sai.
- O Dependabot propõe atualizações semanais de pacotes npm e de actions.

## Produção

Vercel + Neon.

- `DATABASE_URL`: vem da integração do Neon na Vercel.
- `IP_HASH_SALT`: gere com `openssl rand -hex 32` e cadastre como variável de ambiente na Vercel.
- As migrações são aplicadas pelo workflow de deploy antes de publicar (manualmente: `DATABASE_URL=... npx drizzle-kit migrate`).
- Domínio `caiunessa.com.br`, registrado no Registro.br e apontado para a Vercel.

## Dados e privacidade (LGPD)

- Cada jogada grava uma linha: respostas, nota, nota por lado e data/hora.
- O IP em si nunca é gravado. Para o limite de 5 jogadas por minuto, guardamos um hash SHA-256 do IP com salt. O hash é apagado pela primeira jogada válida recebida depois de 1 hora (mesmo que essa jogada seja recusada pelo limite), então em um site com pouco movimento ele pode ficar mais de 1 hora, até chegar a próxima jogada válida. Uma limpeza agendada está prevista.
- Não pedimos nome, e-mail nem login, e não usamos cookies. O único identificador é esse hash temporário do IP com salt, usado só para o limite de jogadas.
- Medimos audiência com o Vercel Web Analytics (`@vercel/analytics` no layout): visitas por página, origem (referrer), país e tipo de aparelho, sem cookies e sem identificar pessoas; os números ficam no painel da Vercel. No plano Hobby entram 50 mil eventos por mês; passado o limite, a coleta pausa até o mês seguinte, sem cobrança.

## Licença

Código sob a [licença MIT](LICENSE). As checagens citadas pertencem às agências; cada afirmação aponta para a página de origem.
