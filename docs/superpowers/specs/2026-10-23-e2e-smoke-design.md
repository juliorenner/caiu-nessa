# Teste de ponta a ponta e fumaça pós-deploy (design)

Data: 2026-10-23. O autor avisou que "a aplicação está começando a ser utilizada", pediu "cuidado para não deployar nada que a quebre, depois de cada deploy, execute um teste básico", sugeriu Playwright e perguntou se dá para rodar nas PRs ("talvez o próprio vercel ofereça ferramentas para isso").

## Intenção
Duas redes: antes do merge, um navegador de verdade joga uma rodada inteira contra um build de produção local, e a PR não entra se isso quebrar; depois de cada deploy, o mesmo teste, em modo só-leitura, confere o site publicado e o workflow fica vermelho se produção não responder como esperado. Sobre a Vercel: ela não traz um executor de testes; o que oferece são deploys de preview por PR (que precisariam de um banco por preview) e integrações pagas (Checkly). Fica parked; o build local cobre o mesmo código e o pós-deploy cobre o ambiente real.

## Objetivos
- `npm run e2e` roda Playwright (Chromium) contra `next start` de um build de produção, com PGlite local, e cobre: home → Começar → 8 cartas respondidas (botão de resposta → painel de veredito → Próxima/Ver meu resultado) → placar `N/8` → botão "Compartilhar placar" visível; página `/r/<código de 8>` e `/r/<código antigo de 12>` com 200 e placar; `/cartao?t=8` devolve PNG; `/opengraph-image` devolve PNG; `/api/resultado` com corpo inválido → 400.
- Modo `E2E_SOMENTE_LEITURA=1` (produção): tudo acima menos terminar a rodada: joga só a 1ª carta até o painel de veredito e para (não grava jogada nem evento), confere `/r`, `/cartao`, `/opengraph-image` e o 400 da API.
- CI (`ci.yml`, job `verificar`): depois do build, instala o Chromium do Playwright e roda `npm run e2e` (local, completo). Falha = PR bloqueada.
- Deploy (`deploy.yml`): depois de "Publicar", job `fumaca` roda `npm run e2e` com `E2E_BASE_URL=https://caiunessa.com.br` e `E2E_SOMENTE_LEITURA=1`. Falha = workflow vermelho (não há rollback automático; o autor decide).
- Viewport de celular (390×844) no teste, porque é como o jogo é usado.

## Não objetivos
- Previews por PR na Vercel; rollback automático; testes visuais (screenshots comparadas); Safari/WebKit (só Chromium, por tempo de CI).

## Anti-objetivos
- Um teste que grave jogadas ou eventos em produção a cada deploy (sujaria as métricas); por isso o modo só-leitura.
- Um teste frágil por texto: usa os rótulos reais dos botões (`Começar`, `Verdade`, `Próxima`, `Ver meu resultado`, `Compartilhar placar`) e `data-casa`/`data-placar` já existentes.
- Mais de ~3 min somados no CI.

## Restrições
- Dependência nova: `@playwright/test` (devDependency; o autor pediu Playwright). Nenhuma outra. O vitest não roda os specs do Playwright (`tests/e2e/` fora do `include` do vitest).
- Config `playwright.config.ts`: `testDir: tests/e2e`, `baseURL` = `E2E_BASE_URL` ou `http://localhost:3100`, `webServer` só quando não há `E2E_BASE_URL`: `DATABASE_URL=file:.pglite-e2e IP_HASH_SALT=e2e next start -p 3100` (o build já existe no CI; localmente `npm run build` antes), `reuseExistingServer`, viewport 390×844, retries 1 no CI, trace on first retry, reporter `list` + `github` no CI.
- Workflows: ações SHA-pinned como as existentes; `npx playwright install --with-deps chromium`; o job de fumaça não precisa de segredos; `timeout-minutes` curto.
- `.gitignore`: `.pglite-e2e/`, `playwright-report/`, `test-results/`.
- Commits sem `JUL-`.

## Critério de pronto
`npm run e2e` verde localmente contra um build; CI da PR roda e passa com o job de e2e; depois do merge, o job `fumaca` do deploy passa contra produção; um defeito proposital (ex.: trocar o rótulo "Começar") faz o e2e falhar (conferido localmente antes de desfazer).
