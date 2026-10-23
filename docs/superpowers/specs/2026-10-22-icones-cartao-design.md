# Ícones pequenos no fundo dos cartões (design)

Data: 2026-10-22, noite. Pedido do autor: "existem ícones nos cards também? tinha pensado em eles no fundo dos cards, variando quais por cartão"; "o '?' é legal, mas o card fica todo muito 'branco'"; "eu pensei em vários ícones pequenos, flutuando ao redor do texto nos cards, não deixando tudo branco, sendo detalhes que preenchem um pouco". O autor dispensou perguntas; as escolhas estão aqui como decisão do controlador. Revisado por um construtor antes da entrega; as três dúvidas dele (vagas livres, faixa do texto, repetição entre rodadas) estão resolvidas no texto como decisão do controlador.

## Intenção
O cartão da afirmação é um retângulo branco com o texto no meio e o "?" de papel no canto; em celulares altos sobra muito branco. Em vez de um ícone grande, um **padrão esparso de ícones pequenos** em traço de tinta, bem claros, espalhados pelas bordas do cartão ao redor do texto, como detalhes de um cartaz. O conjunto muda de cartão para cartão.

## Objetivos
- Entre 6 e 9 ícones pequenos (28–40 px) por cartão, nas bordas e cantos, nunca atrás das linhas de texto; opacidade ~7% (tinta sobre branco), `aria-hidden`, `pointer-events-none`.
- Variar por cartão: o índice do cartão na rodada escolhe, de forma determinística, quais ícones, em quais posições e com que leve rotação; sem aleatoriedade no render (hidratação).
- Repertório de 6 ícones no mesmo traço dos existentes: urna, político, Congresso (já existem) + título de eleitor (cartão com faixa e foto quadrada), microfone de debate, jornal dobrado.
- O "?" de papel fica. O verso (próximo cartão, atrás) não mostra ícones. O texto segue legível: contraste do texto medido com o ícone por baixo não cai abaixo de 4,5:1 (a 7% o fundo é ~#fff → ~#ece9f0 no pior caso; conferir).

## Não objetivos
- Ícones no painel de veredito, nas páginas de texto ou nas imagens de compartilhar.
- Animação dos ícones ("flutuando" é posição, não movimento; `prefers-reduced-motion` nem precisa entrar).
- Ícones temáticos por afirmação (seria revelar algo sobre o conteúdo; a variação é só pelo índice).

## Anti-objetivos
- Qualquer ícone que leia como partido, candidato, bandeira, estrela, número.
- Ícone encostando ou cruzando texto em afirmações longas a 320 px.
- Aumentar o custo de render do cartão a ponto de atrasar o arrasto (SVGs pequenos, sem filtros).

## Restrições
- SVGs em `src/components/icones/` no padrão `Traco` (64×64, `currentColor`, `strokeWidth` 3,5, pontas quadradas).
- A posição é uma lista fixa de "vagas" em percentuais do cartão: 12 vagas espalhadas pelas faixas de cima (0–25% da altura) e de baixo (75–100%), mais 4 nas laterais (x < 12% ou x > 88%) da faixa do meio. A faixa central de 25%–75% da altura e 12%–88% da largura fica sempre livre: é onde o texto vive (centralizado). Os ícones **podem** ficar sob as dicas de gesto, o "?" e o carimbo do veredito (a 7% não atrapalham nada); só o texto da afirmação é intocável. *(Decisão do controlador.)*
- Afirmações longas (`tamanhoDoTexto` = `text-base`, mais de 160 caracteres) usam só as vagas das faixas de cima e de baixo mais extremas (y < 12% ou y > 88%), 4 ícones; as outras usam 6–9. Percentuais fixos, sem medir o texto. *(Decisão do controlador.)*
- Variação: o componente recebe `semente: number`; o `Quiz` passa `indice + (rodada - 1) * 7`, para rodadas extras não repetirem a sequência da primeira; a tabela tem 12 variações e a semente entra em módulo 12. *(Decisão do controlador.)*
- Componente `IconesDoCartao({ semente, longo }: { semente: number; longo: boolean })` renderizado dentro do `CartaoAfirmacao` (atrás do texto, `absolute inset-0`), só quando `fase === 'ativo' | 'respondido' | 'saindo'` do cartão atual; o verso não o usa.
- Testes: componente renderiza N ícones `aria-hidden` dentro de um container `pointer-events-none`; sementes diferentes dão conjuntos diferentes; a mesma semente dá o mesmo conjunto (determinismo); `longo` reduz para 4 e só nas vagas extremas; nenhuma vaga cai na faixa central (teste sobre a tabela); o cartão continua com o texto `relative` acima.

## Deixado para quem constrói
- Os três ícones novos (desenhar e olhar a 32 e 300 px).
- A tabela de variações (vagas × ícones × rotação −8°..8°).
- Como testar que nada encosta no texto (um teste de classes garante a exclusão da faixa central; o resto é checagem visual a 320 px com a afirmação mais longa).

## Critério de pronto
Cartões com ícones diferentes ao longo de uma rodada, nos dois temas, a 320 e 390 px, sem tocar o texto, sem capturar toque, sem atrasar o arrasto; "?" preservado; lint, typecheck, testes e build verdes.
