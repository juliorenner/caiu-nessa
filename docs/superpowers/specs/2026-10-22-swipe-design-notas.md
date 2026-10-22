# Redesign com cartões e swipe — notas de design (em andamento)

Estado em 2026-10-22, para quem retomar o trabalho. Mockups navegáveis em `docs/superpowers/mockups/2026-10-22-swipe/` (fragmentos HTML do companheiro visual; abrir no navegador).

## Decidido com o autor
- Gestos: direita = VERDADE, esquerda = MENTIRA, cima = ISSO ME CHEIRA MAL 🤔; para baixo sem função. Os três botões continuam e servem de legenda.
- Enquanto arrasta, o cartão inclina e mostra um selo (VERDADE verde, MENTIRA vermelho, CHEIRA MAL âmbar) crescendo com a distância; soltar além do limite = resposta, antes = volta.
- Contador pequeno de acertos no topo ("3 de 5 ✔"), só do que já foi respondido; some na tela de resultado.
- Cores: o autor gostou das duas direções (1 Carimbo claro, 2 Noite escuro). Proposta do controlador: as duas, como tema claro e escuro seguindo o aparelho (`prefers-color-scheme`), mesmas cores de veredito nos dois.
- Depois da resposta, "Quem disse" e a citação original aparecem (já implementado no jogo atual).

## Em aberto (perguntas feitas ao autor)
1. O que aparece quando o cartão sai: A (próximo cartão direto, veredito num aviso), B (o cartão vira e mostra o verso), C (painel sobe de baixo, cartão sai carimbado). O autor clicou nos três e disse "gostei"; o controlador propôs C.
2. Rodadas / "Continuar jogando" (ticket de rodadas no Linear): rodada 2 com 2/2/2 estrito ou com o que a reserva tiver.

## Regras que não mudam
Neutralidade (nada de cor por lado; `lado` nunca chega ao navegador), três vereditos, feedback com link da checagem, mobile-first (coluna única, botões ≥ 48 px, texto ≥ 16 px, sem rolagem horizontal), `prefers-reduced-motion` respeitado nas animações.
