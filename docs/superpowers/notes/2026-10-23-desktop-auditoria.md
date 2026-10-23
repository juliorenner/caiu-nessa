# Caiu Nessa? no desktop: auditoria

Capturas em `desktop/atual/` (1280×800 e 1440×900). Tudo vale só para ≥ lg (1024px); o mobile não muda.

## Home `/`
- Coluna de 448px (`max-w-md`, `src/app/page.tsx:18`): cerca de 65% da tela a 1280px é hachura vazia.
- O título trava em 40px (`clamp(32px,9vw,40px)`).
- A dica fala de toque ("Arraste o cartão ou toque", `page.tsx:31`). As setas aparecem como texto de 11px, não como teclas.

## Quiz `/quiz`
- Coluna de 640px (`quiz/page.tsx:26`), e o cartão estica até a altura toda (`h-dvh` + `flex-1`, `Quiz.tsx`). Dá uns 640×610 para duas linhas de texto.
- O tipo vai no máximo a 24px (`tamanhoDoTexto`, `CartaoAfirmacao.tsx`), alinhado à esquerda.
- Botões de resposta de ~207px × 56px com rótulo de 11px: alvo enorme, texto minúsculo, e nenhuma tecla à vista.
- As setas já funcionam (`TECLAS`, `Quiz.tsx`), mas o aviso está só em `sr-only`.
- O veredito é um bottom sheet com véu (`PainelVeredito.tsx:99`, `fixed bottom-0 max-w-xl`) que tapa a afirmação na hora de ler a explicação. A alça de arrastar não serve para o mouse. O Enter funciona em "Próxima" (que já tem o foco), mas nada na tela avisa.

## Resultado
- Uma coluna de 640px, tudo centrado e empilhado. O botão tem 640px; os links ficam empilhados.
- Não mostra quais afirmações a pessoa errou, embora `ordem` e `respostas` já estejam no `Quiz`.

## `/afirmacoes`, `/como-escolhemos`, `/r/[codigo]`
- 640px é uma boa medida para ler texto. A lista de `/afirmacoes` caberia numa grade de 2 colunas. Em `/r`, a metade de baixo fica vazia e o "Começar" ocupa a largura toda.

## Em resumo
Colunas estreitas sem nenhum `lg:`, um tipo que não cresce, convenções de toque (alça, bottom sheet, "toque") e um teclado que funciona mas não aparece.

---

## Direção 1: Balcão (`direcao-1.html`)
- **Muda (≥ lg):** a home vira um hero em 2 colunas (texto e CTA + prévia do cartão). No quiz, o cartão fica à esquerda e o veredito num **painel lateral** à direita, sem véu nem alça.
- **Muda (≥ lg):** `<kbd>` ← ↑ → nos botões e `Enter` em Começar/Próxima. O resultado fica em 2 colunas: placar e compartilhar de um lado, uma lista nova **"Suas respostas"** do outro.
- **Fica:** paleta, Ficha, carimbos, sombras duras e hachura. O painel é o mesmo componente, só em outra posição.
- **Custo:** médio. A lista no resultado é conteúdo novo, e o foco e o scroll lock do painel mudam no lg.

## Direção 2: Palco (`direcao-2.html`)
- **Muda (≥ lg):** a mesma coluna única, mais larga (~880px) e com tipo maior (título de 104px, afirmação entre 34 e 40px, centralizada). Na home, as teclas viram uma legenda grande.
- **Muda (≥ lg):** o veredito aparece **no verso do cartão**, no mesmo lugar, com a afirmação repetida no topo, mais "Próxima ⏎" e "Esc rever".
- **Muda (≥ lg):** o resultado vira uma placa horizontal (placar + `GradeDeCasas` + faixa), com as ações lado a lado. Não entra conteúdo novo.
- **Fica:** a estrutura e a ordem de leitura do mobile; quase tudo é classe `lg:`. O risco é o verso do cartão, um novo modo do `PainelVeredito`.

## Recomendação
Direção 1. Com o veredito ao lado da afirmação, a largura serve para ler a explicação sem perder o que foi dito.
