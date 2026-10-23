# Linha de compartilhar (2026-10-23)

## Intenção

O Julio achou os dois botões grandes ("Compartilhar placar" e "Mandar para os stories") pesados e pediu o padrão mais comum: uma linha de ícones de rede social, com o download também como ícone. Mockup aprovado em 2026-10-23 ("perfeito, muito melhor"), com um ajuste: o rótulo "Stories" vira "Instagram".

## O que muda na tela de placar

Um rótulo em letreiro, **Compartilhar**, e abaixo uma linha de botões redondos (60 px, borda e sombra dura, no estilo dos botões de apertar), cada um com um rótulo curto embaixo:

| Rótulo | Nome acessível | O que faz | Evento |
|---|---|---|---|
| WhatsApp (preenchido) | Mandar no WhatsApp | Link `https://wa.me/?text=<texto com a URL>` em nova aba: o WhatsApp monta a prévia do placar a partir da URL | `whatsapp` / `clique` |
| Instagram | Mandar para o Instagram | O fluxo de imagem de hoje (`compartilhar({ modo: 'imagem' })`); só aparece quando o navegador aceita arquivos na folha | `imagem` / desfecho |
| Baixar | Baixar imagem para os stories | O link de download de hoje | `baixar` / `clique` |
| Mais | Mais opções de compartilhar | A folha do sistema de hoje (`modo: 'link'`), com cópia do texto quando não há folha | `link` / desfecho |

Os avisos ("Texto copiado", "Imagem ainda carregando…" etc.) continuam na mesma área, logo abaixo da linha. "Continuar jogando" segue como botão largo abaixo.

## Decisões

- Rótulo visível curto + `aria-label` completo que contém o rótulo (WCAG "label in name").
- Ícones em traço (inline SVG, `aria-hidden`), sem logos oficiais: desenhos genéricos de telefone/câmera/seta/compartilhar que lembram as redes.
- Sem copiar o link no toque do Instagram: um `writeText` junto do `share` arriscaria o compartilhamento que mais importa. Fica como ideia para depois.
- `MODOS_DE_COMPARTILHAR` ganha `whatsapp`; o `npm run metricas` já soma `clique` nos compartilhamentos estimados.
- A linha é um componente próprio (`LinhaDeCompartilhar`), recebendo as ações como props: `ResultadoFinal` continua dono do estado e dos avisos.

## Fora do escopo

Página `/r/[codigo]` (mantém o botão "Começar"), a imagem do cartão e o texto compartilhado.
