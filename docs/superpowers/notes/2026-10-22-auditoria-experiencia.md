# Auditoria da experiência (2026-10-22, 22h, produção)

Feita pelo controlador em https://caiunessa.com.br depois dos PRs #21–#26, no Chrome (frames de 390×844 e 320×568, temas claro e escuro), com `curl` para tempos e cabeçalhos. O que só dá para testar num celular de verdade está marcado como **do autor**.

## O que foi verificado
| Tela / fluxo | Resultado |
|---|---|
| Início (claro/escuro, 390/320) | Ficha, quadro com carimbo, Começar, dicas, "Som da urna", Congresso em marca-d'água. Sem erro de console. |
| Jogo | Cartão ocupa a altura; ícones pequenos variam por cartão e não encostam na afirmação mais longa (192 caracteres) a 320; carimbo no arrasto; placar e carimbos de progresso. |
| Painel de veredito | Selo com a palavra da checagem, mensagem, autor, citação, explicação, link; foco no botão; fundo escurecido. |
| Placar | Número grande, faixa carimbada, comparação, **Compartilhar placar**, **Mandar para os stories** (aparece no Chrome desktop, que aceita arquivos), Baixar imagem, Continuar jogando, Jogar de novo. |
| Link de resultado `/r/…` | Página com placar do amigo + Começar; `og:image` absoluta; imagem 1200×630 responde; código inválido 404. |
| Páginas de texto | Títulos em Bungee com acentos; cartões de afirmação; links para as checagens. |
| Pontuação | 12 respostas "Verdade" → 4/12 exato (teste determinístico). |
| Acessibilidade (DOM) | `lang=pt-BR`; todo botão e link com nome; decorativos fora da árvore; contraste medido por teste (≥ 4,5:1). |
| Desempenho (desktop, cabo) | TTFB 80–390 ms; HTML 9 KB (home) a 165 KB (`/afirmacoes`); JS ~157 KB; 8 arquivos de fonte, 115 KB; load ~1,3 s. |
| Cabeçalhos | Só HSTS. Sem CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. |
| Arquivos de apoio | `robots.txt`, `sitemap.xml` e `manifest.webmanifest` respondem 404. |

## Defeitos encontrados
1. **Tema escuro: botão fantasma transparente deixa a marca-d'água do político aparecer dentro do botão** ("Mandar para os stories", "Continuar jogando"). Correção: preenchimento opaco da cor do fundo no escuro (neste PR).
2. Sem manifesto web: "adicionar à tela inicial" fica sem nome nem ícone bonito no Android/iOS (ver backlog).

## Do autor (não dá para testar daqui)
- O som da urna ao tocar em "Ver meu resultado" (iOS e Android; o toggle na home).
- A folha de compartilhamento: link com prévia num grupo de teste do WhatsApp; imagem para os stories no Instagram; o fallback de copiar no iOS.
- A opacidade dos ícones do cartão (12%) e da marca-d'água (7% claro / 12% escuro) numa tela real.

## Backlog de melhorias, por prioridade
**P1 — antes de espalhar para amigos**
1. **Lembrete de precisão antes de compartilhar.** Uma linha sob os botões de compartilhar: "Antes de repassar no grupo, confira a checagem." A pesquisa guardada em `2026-10-22-engajamento-referencias.md` cita queda de 51% no repasse de manchetes falsas com um lembrete assim. Esforço: pequeno.
2. **Higiene técnica do site:** `manifest.webmanifest` (nome, ícones 192/512 a partir do carimbo, `theme_color` papel, `display: standalone`), `robots.txt` + `sitemap.xml` (home, /afirmacoes, /como-escolhemos), cabeçalhos de segurança em `next.config.ts` (`Content-Security-Policy` compatível com next/font e next/og, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` sem câmera/microfone/geolocalização). Esforço: pequeno.
3. **Data da checagem no painel de veredito.** O dado existe (`data_checagem`) e aparece em `/afirmacoes`, mas não onde mais importa. Esforço: trivial.

**P2 — experiência**
4. **Letra maior para afirmações curtas.** Com o cartão ocupando a altura, frases curtas ficam pequenas; mais um degrau (até 24 px) para textos ≤ 90 caracteres. Esforço: pequeno (função `tamanhoDoTexto` + teste).
5. **Hierarquia da tela de placar.** Três botões empilhados (dois de compartilhar + continuar) alongam a tela; agrupar "Compartilhar placar" e "Mandar para os stories" lado a lado quando couber (≥ 360 px) e deixar "Continuar jogando" como a ação de jogo. Esforço: pequeno.
6. **Página `/r/…` para quem recebe o link:** uma linha explicando o jogo ("12 afirmações da eleição, você diz…") antes do Começar, porque é o primeiro contato de muita gente. Esforço: trivial.
7. **`/afirmacoes` com 165 KB de HTML:** seções recolhidas por lado ou carregamento sob demanda; só importa se a página for compartilhada. Esforço: médio.

**P3 — crescimento e conteúdo**
8. **Mais afirmações no pool.** Hoje o pool limita quantas rodadas extras cabem antes de "acabaram as afirmações"; curadoria do lado direito já aberta (JUL-112).
9. **Cadência diária** ("volte amanhã: 6 novas"), como o Wordle, sem notificação. Exige design (sorteio por dia, estado no aparelho).
10. **Tailwind varrendo `docs/`**: `@source not "../../docs"` em `globals.css` para não mandar classes de planos antigos ao CSS de produção. Esforço: trivial.
11. **Página de estatísticas simples** (jogadas por dia, acerto médio, afirmações mais erradas), a partir do que já está no banco, para guiar a curadoria. Esforço: médio.
