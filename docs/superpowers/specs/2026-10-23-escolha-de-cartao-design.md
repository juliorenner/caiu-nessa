# Escolha do cartão para compartilhar

**Origem:** pedido do dono (2026-10-23): "o número de erros pode fazer com que as pessoas não compartilhem". Quer uma opção que não diga quantas a pessoa acertou ou errou, que diga que ela jogou e convide os outros, com bastante cuidado no design, e um carrossel "estilo o que o Shopify faz para compartilhar os números anuais" com várias opções: o convite primeiro, o placar atual e um "acertei mais que X%".

## O que muda

Na tela de fim, acima da linha de compartilhar, um carrossel "Escolha o cartão" (grupo de rádio, miniaturas 9:16 com rolagem e snap). Os botões WhatsApp, Instagram, Baixar e Mais mandam o cartão escolhido.

| Cartão | Imagem | Texto | Link |
|---|---|---|---|
| **Convite** (primeiro, já escolhido) | `GET /convite`, tema noite: "Eu já joguei / Sua vez", carimbo, "E você, cai nessa?", os três selos de veredito, "Duvido você não cair em nenhuma", "Insira a ficha" | "Já joguei o Caiu Nessa? Agora é sua vez: será que você cai?" | capa (prévia sem números) |
| **Mais que X%** | `GET /percentil?p=X` (1 a 99): "Acertei mais que X% das pessoas", "Como será que você se sai?" | "Acertei mais que X% das pessoas no Caiu Nessa? Como será que você se sai?" | capa |
| **Com placar** | `GET /cartao` (o de sempre) | o de sempre | `/r/…` (o de sempre) |

O "Mais que X%" só aparece onde a tela já mostra a comparação (rodada 1, com estatísticas) e quando X está entre 1 e 99.

## Carrossel em destaque (segunda versão)

O dono pediu "um mais destacado na frente", com referência no Pinterest iOS (Mobbin): o cartão do centro fica grande e escolhido; os vizinhos aparecem menores, apagados e cortados nas bordas. Deslizar escolhe o cartão que para no centro; tocar num vizinho o traz para o centro; os pontos embaixo são o grupo de rádio (teclado e leitor de tela), com o nome do cartão escolhido acima deles.

## Decisões minhas (o dono pode mudar)

- Ordem: Convite, Mais que X%, Com placar.
- Os cartões sem placar apontam para a capa, não para `/r/…`, porque a prévia de `/r/…` mostra o placar.
- As imagens de todos os cartões são pré-buscadas ao montar (o share precisa do arquivo na hora do toque).
- Os eventos de `compartilhar` não registram qual cartão foi escolhido (fica para outra PR, mexe no esquema).
