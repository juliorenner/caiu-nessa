# Caiu Nessa?

Quiz de checagem de fatos políticos, neutro e em português. São 12 afirmações políticas já checadas por agências de checagem; para cada uma o jogador responde **VERDADE**, **MENTIRA** ou **ISSO ME CHEIRA MAL 🤔** (enganoso). No fim vê a nota, o viés das respostas e como se saiu em comparação com os outros jogadores. É anônimo e não tem login.

## Regras de neutralidade

- Só entram checagens de cinco agências: Aos Fatos, Lupa, Comprova, G1 Fato ou Fake e Estadão Verifica. Toda afirmação tem link para a checagem original.
- 6 afirmações por lado, cada lado com 2 verdadeiras, 2 falsas e 2 enganosas.
- Afirmações em que as agências discordam ficam de fora.
- O lado é o de quem disse a frase, e nunca aparece durante o jogo.
- Nenhum texto do site apoia ou ataca um lado. O resultado mede a pessoa, não os políticos.

Os critérios completos estão na página `/como-escolhemos`. As afirmações em jogo ficam em `src/data/afirmacoes.json` e as de reserva em `src/data/afirmacoes-reserva.json`.

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
npm test                              # testes (Vitest)
npm run typecheck                     # tipos
npm run build                         # build de produção
npx tsx scripts/verificar-fontes.ts   # acessa cada link de checagem
```

## Produção

Vercel + Neon.

- `DATABASE_URL`: vem da integração do Neon na Vercel.
- `IP_HASH_SALT`: gere com `openssl rand -hex 32` e cadastre como variável de ambiente na Vercel.
- Aplique as migrações uma vez: `DATABASE_URL=... npx drizzle-kit migrate`.
- Domínio `caiunessa.com.br`, registrado no Registro.br e apontado para a Vercel.

## Dados e privacidade (LGPD)

- Cada jogada grava uma linha: respostas, nota, nota por lado e data/hora.
- O IP em si nunca é gravado. Para o limite de 5 jogadas por minuto, guardamos um hash SHA-256 do IP com salt. O hash é apagado pela primeira jogada válida recebida depois de 1 hora (mesmo que essa jogada seja recusada pelo limite), então em um site com pouco movimento ele pode ficar mais de 1 hora, até chegar a próxima jogada válida. Uma limpeza agendada está prevista.
- Não pedimos nome, e-mail nem login, e não usamos cookies. O único identificador é esse hash temporário do IP com salt, usado só para o limite de jogadas.
