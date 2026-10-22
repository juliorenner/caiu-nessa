# Caiu Nessa? (caiu-nessa)

## O que é
Quiz web neutro em português. A pessoa vê uma afirmação política e responde
VERDADE ou MENTIRA. Ao final recebe sua nota, uma avaliação em tom leve
(ex.: "Abre o olho: você acreditou em X% das afirmações falsas") e a
comparação com a maioria dos jogadores. Objetivo: informar a população.
Site anônimo, sem login, zero atrito (vai circular por WhatsApp).

## Conteúdo (regras de neutralidade, inegociáveis)
- Só afirmações já checadas por agências: Aos Fatos, Lupa, Comprova,
  G1 Fato ou Fake, Estadão Verifica. Cada item guarda o link da checagem.
- Primeira versão: 12 afirmações. 6 de cada lado (esquerda/direita),
  3 verdadeiras e 3 falsas por lado. Mesma proporção sempre.
- Fontes: os dois candidatos do 2º turno de 2026 e influenciadores de
  cada lado. Priorizar as fake news mais compartilhadas.
- Depois de cada resposta: mostrar o veredito, uma explicação curta e o
  link da checagem, mais "X% das pessoas erraram esta".
- Nenhuma frase de apoio ou ataque a candidato. Critério de seleção
  visível numa página "Como escolhemos as afirmações".
- Resultado final mede a PESSOA, não os partidos: nota geral e viés
  ("você acreditou em 80% das falsas de um lado e 30% do outro").

## Stack
- Next.js (App Router) + TypeScript, deploy na Vercel.
- Postgres via Neon (marketplace da Vercel, free tier) + Drizzle ORM.
- Afirmações num JSON versionado no repo (não no banco) por enquanto.
- Rota POST /api/resultado: recebe respostas, grava uma linha, devolve
  estatísticas agregadas (histograma de notas, % de erro por afirmação,
  média por lado).
- Rate limit simples: hash do IP + timestamp na própria tabela, máx N
  jogadas por minuto. Cloudflare Turnstile como opcional depois.
- Comparação com a maioria só aparece com >= 100 jogadas. Antes disso:
  "você é um dos primeiros".
- Sem dados pessoais (LGPD): só respostas, nota, lado, timestamp e hash
  do IP com TTL curto.

## Modelo de dados
afirmacoes (JSON): id, texto, lado (esquerda|direita), autor, veredito
  (true|false), explicacao, fonte_nome, fonte_url, data_checagem
jogadas (tabela): id, created_at, respostas jsonb ({id: true|false}),
  acertos, total, acertos_esquerda, acertos_direita, ip_hash

## Fora do escopo agora
Login, ranking com nome, painel admin. Login, se vier, só depois do
resultado e opcional, nunca antes de jogar.

## Domínio
caiunessa.com.br (registro.br, Vercel não vende .br). Apontar pra Vercel
via A + CNAME ou nameservers. Checar disponibilidade antes de comprar.

## Emenda 2026-10-21: veredito em três níveis
Decisão do autor durante a execução do plano MVP (depois da curadoria inicial).

- `veredito` deixa de ser booleano e passa a ser um enum: `verdadeiro | falso | enganoso`.
  A ideia é escalar; nunca modelar como boolean, nem temporariamente.
- O jogador tem três botões: VERDADE, MENTIRA e "ISSO ME CHEIRA MAL 🤔" (= enganoso).
- Proporção: 12 afirmações, 6 por lado, 2 verdadeiras + 2 falsas + 2 enganosas por lado.
- Mapeamento dos rótulos das agências para `enganoso`: Enganoso, Exagerado, Distorcido,
  Fora de contexto, Impreciso, "Não é bem assim". Ficam fora do jogo: Insustentável,
  Contraditório, "Ainda é cedo pra dizer". A regra de unanimidade continua: se uma agência
  disse "falso" e outra "enganoso", a afirmação não entra no conjunto ativo.
- Pontuação: acerto só com a opção exata; nota inteira de 0 a 12. Marcar MENTIRA numa
  enganosa (ou ENGANOSO numa falsa) é erro, mas o feedback reconhece o "quase".
- Viés: "acreditou" = marcou VERDADE numa afirmação falsa ou enganosa.
- Afirmações extras que passam no mesmo critério ficam em `afirmacoes-reserva.json`
  (sem regra de proporção) para escolha ou sorteio futuro.
