# Ajustes pós-MVP (registro de decisões)

Documento de transparência: cada mudança feita depois do plano do MVP (`2026-10-21-caiu-nessa-mvp.md`), com a decisão, o motivo e o PR. Mudanças pequenas não ganham plano completo; ganham uma entrada aqui antes do PR.

## 2026-10-22 — Resultado por tipo de erro (JUL-105, PR #4)
**Problema:** um jogador com 8 de 12 via "Abre o olho: você acreditou em 0% das falsas ou enganosas" porque os erros eram de desconfiar de verdades ou trocar mentira por enganoso.
**Decisão:** os erros passam a ser contados em três tipos (acreditou numa falsa/enganosa; desconfiou de uma verdade; errou o grau entre mentira e enganoso). O texto e a linha de viés seguem o tipo dominante (empate: acreditou > desconfiou > grau); o viés some quando não há erro no eixo. Nota e faixas (Imune, Quase imune, Abre o olho, Caiu feio) não mudam.

## 2026-10-22 — Página /afirmacoes (JUL-107, PR #5 e este PR)
**Pedido:** listar publicamente as afirmações e de onde vêm.
**Decisão:** página gerada do JSON com texto, quem disse ou espalhou, veredito, agência, data e link da checagem. Linkada em "Como escolhemos" e no resultado, não na landing (para não entregar as respostas). Depois do PR #5 o autor pediu a lista completa: a página passa a ter "Em jogo agora" e "Na reserva".

## 2026-10-22 — Re-curadoria "viral" (JUL-106, branch jul-106-curadoria-viral, PR em revisão)
**Problema:** parte das 12 afirmações era morna ("aprovamos tudo no Congresso", "32 milhões não votaram"); as que mais circulam vêm de posts e influenciadores, não da boca dos candidatos, e a regra "lado = quem disse" as deixava de fora.
**Decisões:** (1) lado = quem disse **ou espalhou**, conforme a agência atribui; posts sem atribuição ficam de fora. (2) Prioridade ao que mais circula e é concreto (número, nome, lugar, dinheiro, emprego, crime, benefício). (3) "Falso" e "enganoso" não divergem entre si; só divergem de "verdadeiro" ou de rótulos excluídos. Entre falso e enganoso vale a maioria das agências (empate: falso), e a explicação diz que as agências divergem e por quê. Casos assim recebem revisão com todas as checagens abertas.

## 2026-10-22 — Afirmação neutra na pergunta (JUL-104)
**Decisão (dono, 2026-10-22):** durante a pergunta o jogador vê só a afirmação, reescrita em terceira pessoa e sem indicar quem a disse; autor e fala original aparecem só no feedback. O jogo deve testar "isso é verdade?", não "confio nessa pessoa?".
**Campos:** `texto` passa a ser a versão neutra (mesmos números, mesmo alcance e mesma alegação que a agência checou); o novo campo obrigatório `citacao` guarda a fala como a agência a citou, com colchetes e `[...]`. Os ids não mudam. A página /afirmacoes mostra os dois.

## 2026-10-22 — v2: cartões com swipe (ticket JUL-109 no Linear, branch jul-109-swipe-cartoes)
**Pedido (dono):** "algo estilo Tinder pras afirmações, que fique bem fácil de jogar no celular": arrastar para a direita = verdade, esquerda = mentira, para cima = cheira mal; os botões continuam; contador de acertos durante o jogo; cores.
**Documento de design:** `docs/superpowers/specs/2026-10-22-swipe-cartoes-design.md` (aprovado pelo dono em 2026-10-22; layout C, painel que sobe de baixo, escolhido entre três mockups em `docs/superpowers/mockups/2026-10-22-swipe/`). Plano executado: `docs/superpowers/plans/2026-10-22-swipe-cartoes.md`.
**Decisões de implementação (controlador, durante a execução):**
- Limiar do gesto: 35% da largura do cartão na horizontal, 25% da altura para cima; menos de 8 px é toque, arrastar para baixo não faz nada. Nada de biblioteca de gestos.
- Depois da resposta o cartão desliza e fica carimbado (VERDADE / MENTIRA / ISSO ME CHEIRA MAL 🤔) embaixo do painel; o texto do próximo cartão nunca está no DOM antes da vez dele.
- O painel de veredito é obrigatório (Escape e clique fora não fecham; arrastar a alça para baixo ou "Próxima" fecham), recebe o foco ao abrir e devolve o foco ao quiz ao fechar; o conteúdo atrás fica `inert`.
- Temas claro ("Carimbo") e escuro ("Noite") seguem `prefers-color-scheme`; o cartão é claro nos dois. Nenhuma cor é associada a um lado político: as cores seguem só o veredito.
- `prefers-reduced-motion` desliga inclinação, voo e transições.
- Contador "{acertos} de {respondidas} ✔" só aparece depois da primeira resposta e some no resultado; é só exibição, a nota continua sendo calculada no servidor.
- A tela do quiz cabe sem rolagem nos celulares em pé (320×568 para cima). Em telas baixas ou deitadas (por exemplo 667×375) a tela rola em vez de cortar o cartão; o cartão continua com `touch-action: none`, então arrastar para cima não briga com a rolagem. (Ajuste depois da revisão do PR; o documento de design dizia "sem rolagem" sem prever o modo deitado.)
**Verificação em browser (controlador, Chrome, tema escuro, 2026-10-22):** em 320×568, 375×667 e 430×932 a tela do quiz não rola (`scrollHeight == innerHeight`) e o cartão cabe acima dos botões mesmo com um texto de 258 caracteres; um jogo completo de 12 afirmações por swipe nas três direções, setas e botões abriu o painel 12 vezes, com foco no botão de avanço, conteúdo atrás inerte, contador correto e respostas duplicadas ignoradas; sem erros no console. O tema claro foi verificado pelos testes de tokens, não em browser.

## 2026-10-22 — Contexto nas afirmações sem referência (ticket de contexto no Linear)
**Problema (dono, jogando a v2):** "Eu não conheço essa moça [Roberta Luchsinger]" não diz nada para quem não sabe quem ela é.
**Decisão:** o `texto` neutro ganha o contexto mínimo para a afirmação ser entendida sozinha (quem é a pessoa, que caso é esse, o que é o termo). O contexto vem só da checagem citada em `fonte_url` e não pode entregar o veredito nem julgar; `citacao`, ids e vereditos não mudam. Vale para as afirmações em jogo e para a reserva, porque todas vão entrar na roda com as rodadas. Oito textos mudaram (Roberta Luchsinger, saidinha, BRB/Banco Master, fraude dos descontos do INSS ×2, recorde de mulheres espancadas, filho de Lula, áudio de Vorcaro); "8.000 empresas faliram em junho" fica sem ano porque a checagem não o informa.

## 2026-10-22 — Rodadas: pool único, sorteio e "Continuar jogando" (ticket de rodadas no Linear)
**Pedido (dono):** "as 12 perguntas eram só pra iniciar, a ideia é que tenhamos mais e depois que randomizemos elas, e que as pessoas possam então continuar jogando".
**Design:** `docs/superpowers/specs/2026-10-22-rodadas-design.md`; plano `docs/superpowers/plans/2026-10-22-rodadas.md`.
**Decisões:**
- Um pool só (`src/data/afirmacoes.json`, 41 itens, 34 jogáveis); itens com `observacao` ficam fora do sorteio e aparecem em /afirmacoes como "Fora do jogo".
- Cada visita sorteia a primeira rodada: 12 afirmações, 2 de cada veredito por lado. "Continuar jogando" puxa rodadas de 6 (1 de cada por lado) entre as que a pessoa ainda não viu na partida; quando não fecha mais uma rodada balanceada, a tela diz que acabaram por enquanto.
- Nenhuma rodada desbalanceada é sorteada nem aceita pela API (12 ou 6, iguais por par).
- Faixas por fração do total: Imune = tudo; Quase imune ≥ 75%; Abre o olho ≥ 40% (12/9/5 como antes; 6/5/3 nas extras).
- Ranking, histograma e percentil contam só rodadas de 12. "% das pessoas erraram esta" usa as jogadas em que a afirmação apareceu e só aparece com 30 aparições ou mais.
- Rodadas extras são gravadas com `total = 6` e não entram na comparação com os outros.
- Nada é lembrado entre visitas (sem login e sem cookie): cada visita recomeça do pool inteiro.
**Limite de hoje:** o pool tem 3 verdadeiras e 3 enganosas da direita, então só fecha 1 rodada extra; curadoria da direita é ticket separado.
**Verificação em browser (controlador, Chrome, 320×568):** rodada de 12 → resultado com "Continuar jogando" → rodada de 6 → "Rodada 2: 2 de 6" e "Na partida: 6 de 18" sem a comparação → "Acabaram as afirmações por enquanto" com "Jogar de novo"; nenhuma afirmação repetida; sem erros no console.

## Pendentes (ainda em desenho)
- Nada no momento.
