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

## Pendentes (ainda em desenho)
- Redesign com cartões e swipe (direita = verdade, esquerda = mentira, cima = cheira mal; botões continuam).
- Rodadas: "Continuar jogando" no resultado com as próximas afirmações do pool (JUL-108).
- Esconder "Quem disse" até o feedback como experimento (JUL-104).
