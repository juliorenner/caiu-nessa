# Caiu Nessa? v2 — cartões com swipe (design)

Data: 2026-10-22. Decidido com o autor na conversa de design; mockups em `docs/superpowers/mockups/2026-10-22-swipe/` (o autor escolheu o layout C, "gostei mais do design C de fato", e gostou das duas direções de cor). Revisado por um construtor; as quatro dúvidas dele estão resolvidas no texto, marcadas como decisão do controlador.

## Intenção
O jogo vai circular por WhatsApp e ser jogado no celular, no ônibus, com uma mão. A tela atual (lista de botões) funciona, mas não convida. A v2 troca a pergunta por um **cartão** que a pessoa arrasta, como no Tinder: o gesto é a resposta, o cartão sai carimbado e o veredito sobe de baixo. Mais rápido de jogar, mais gostoso de repetir, e a explicação da checagem continua obrigatória de passar pelos olhos.

## Objetivos
- Responder com o dedo em menos de um segundo, sem mirar em botão.
- Ver o veredito, quem disse, a frase original, a explicação e o link da checagem a cada resposta, como hoje.
- Ficar bonito nos dois temas do celular (claro e escuro) e legível ao sol.
- Manter tudo que a v1 garante: neutralidade, três vereditos, resultado por tipo de erro, estatísticas, rate limit, páginas de transparência.

## Não objetivos
- Rodadas / "Continuar jogando" (ticket próprio de rodadas; não entra aqui).
- Botão de tema; o tema segue o aparelho.
- Animações além das descritas; nada de confete, som ou vibração.
- Mudar dados, API ou regras de curadoria. A v2 é só interface.

## Anti-objetivos (o que tornaria isso um fracasso)
- Um swipe acidental registrar resposta (ex.: rolar a página e o cartão sair).
- O gesto funcionar e o botão não, ou o contrário; os dois caminhos são iguais.
- O feedback poder ser pulado sem aparecer: o painel sempre abre antes do próximo cartão.
- Lado, partido ou autor aparecerem antes da resposta.
- Cores de partido. As três cores são de veredito.

## Restrições
- Stack atual: Next.js 16 App Router, React 19, TypeScript 7, Tailwind 4. **Sem biblioteca de gestos ou animação**: pointer events + `transform` em CSS; `prefers-reduced-motion` desliga as animações (sem inclinação nem voo; o cartão troca de imediato).
- Largura alvo 320–430 px, coluna única, nada com rolagem horizontal; botões ≥ 48 px; texto ≥ 16 px; contraste AA nos dois temas (os três estados "selecionado" dos botões ≥ 4,5:1).
- `lado` nunca chega ao navegador (já vale hoje); `Quem disse` e a citação só no feedback.
- Testes: Vitest + Testing Library como hoje; o gesto é testável por pointer events sintéticos.

## O que foi decidido (como)

### Gestos
- Arrastar para a **direita** = VERDADE; **esquerda** = MENTIRA; **cima** = ISSO ME CHEIRA MAL 🤔; para **baixo** não faz nada (o cartão volta).
- Durante o arrasto o cartão segue o dedo, inclina (até ~12°) e mostra um **selo** no canto (VERDADE verde, MENTIRA vermelho, CHEIRA MAL âmbar) cuja opacidade cresce com a distância; a direção dominante decide o selo.
- Soltar além do **limiar** registra a resposta: o cartão desliza parte do caminho na direção do gesto (≈300 ms), fica **inclinado e carimbado** sob o fundo escurecido enquanto o painel está aberto, e só termina de voar para fora quando o painel fecha; soltar antes do limiar, o cartão volta ao centro com mola curta. *(Decisão do controlador, seguindo o mockup C: o próximo cartão nunca fica legível atrás do feedback.)*
- Limiar: 35% da largura do cartão na horizontal, 25% da altura na vertical. Um toque sem arrasto (< 8 px) não é swipe. Enquanto o painel de feedback está aberto, o cartão não aceita gesto.
- Os três **botões** continuam embaixo do cartão e fazem a mesma coisa que o gesto (inclusive a animação). Aparência por tema: no claro, cheios (verde, vermelho, âmbar); no escuro, só borda e texto na cor. Ao responder (por gesto ou botão) o botão correspondente ganha destaque (anel grosso + preenchimento) durante os ~300 ms da animação e os outros esmaecem; o painel cobre os botões em seguida. O contraste ≥ 4,5:1 vale para esse estado de destaque. *(Decisão do controlador.)* Acima deles, uma linha de dica em texto pequeno: `← mentira · ↑ cheira mal · verdade →`.
- Teclado: setas ← ↑ → respondem; Tab/Enter nos botões como hoje.

### Pilha
- Mostra o cartão atual e, atrás dele, o próximo cartão levemente menor e mais claro (só a borda; o texto do próximo não aparece até ele subir). Quando o painel fecha, o cartão respondido termina o voo e o de trás sobe ao tamanho cheio com o texto.
- **Sem rolagem na tela do quiz**: tudo (topo, pilha, dica, três botões ≥ 48 px) cabe em uma viewport de 320×568; só o cartão captura o toque (`touch-action: none` no cartão, não na página). Para afirmações longas, a fonte do texto do cartão desce por degraus (20 → 18 → 16 px) conforme o comprimento, nunca abaixo de 16. Assim não existe conflito entre rolar e arrastar para cima. *(Decisão do controlador.)*

### Depois da resposta (layout C)
- Um **painel sobe de baixo** (bottom sheet) sobre o fundo escurecido, com: selo do veredito (Verdade / Mentira / Enganoso), a frase de resultado (`Você acertou.` / `Quase: ...` / `Você caiu nessa.` / `Era verdade.`, como hoje), `Quem disse: {autor}`, a citação original entre aspas, a explicação, a linha `{X}% das pessoas erraram esta.` quando houver estatística (como hoje), o link `Ver a checagem (...)` e o botão `Próxima` (ou `Ver meu resultado` na 12ª).
- Fechar o painel = `Próxima` ou arrastar o painel para baixo. Não dá para pular o painel por outro caminho.
- `aria-live="polite"` no painel; foco vai para o botão `Próxima` ao abrir.

### Topo
- Linha com `Afirmação {n} de 12` à esquerda e o **contador** à direita: `{acertos} de {respondidas} ✔`, começa oculto até a primeira resposta. Abaixo, uma barra de progresso fina (n/12).
- O contador some na tela de resultado, onde a nota aparece grande, como hoje.

### Cores e tema
- Dois temas seguindo `prefers-color-scheme`, via Tailwind `dark:` e `<meta name="color-scheme" content="light dark">`:
  - **Carimbo (claro)**: fundo creme quente, cartão branco com sombra suave, botões cheios (verde/vermelho/âmbar com texto branco ou escuro conforme contraste).
  - **Noite (escuro)**: fundo quase preto arroxeado, cartão claro saltando, botões só com borda e texto na cor do veredito.
- Selos e badges usam a mesma tríade nos dois temas. Nenhuma cor é associada a lado.
- Landing, resultado, `/afirmacoes` e `/como-escolhemos` ganham o mesmo par de temas (mesmos tokens), sem mudar de estrutura.

### Textos
- Todos os textos de hoje continuam iguais (pergunta, feedback, resultado, erros). Novos: a linha de dica dos gestos e o contador. Na landing, abaixo de `Começar`, uma linha: `Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.`

## Deixado para quem constrói
- Estrutura dos componentes (um `Cartao` com o gesto, um `PainelVeredito`, a pilha), os hooks e como integrar com o `Quiz` atual (a máquina de estados `pergunta → feedback → enviando → resultado/erro` continua).
- Valores exatos de sombra, raio, mola e easing; tokens de cor em `globals.css`.
- Como testar o gesto (pointer events sintéticos) e o reduced-motion.
- Se a dica de gestos some depois da primeira resposta ou fica sempre.

## Critério de pronto
Partida completa jogada só com gestos e outra só com botões, nos dois temas, a 320 e 390 px, sem rolagem horizontal nem erro de console; feedback apareceu nas 12; contador correto; testes de componente cobrindo gesto (três direções, limiar, cancelamento), botões, painel obrigatório e reduced-motion.
