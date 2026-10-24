# Afirmações do debate da Globo (23/10/2026)

Seis afirmações novas do debate de Lula (PT) e Flávio Bolsonaro (PL) na TV Globo, em 23/10/2026, três por lado. Nenhum item existente foi alterado.

## Como verifiquei

- Páginas lidas com `npx tsx scripts/pagina.ts <url>` em 24/10/2026:
  - Lupa: https://www.agencialupa.org/checagem/2026/10/23/ao-vivo-checagem-do-ultimo-debate-entre-lula-e-flavio-bolsonaro-no-segundo-turno/ (mais de 40 falas, com citação literal e selo)
  - G1 Fato ou Fake: https://g1.globo.com/fato-ou-fake/eleicoes/noticia/2026/10/23/veja-o-que-e-fato-ou-fake-nas-falas-de-flavio-bolsonaro-e-lula-no-debate-da-globo-no-2o-turno-das-eleicoes-2026.ghtml (com citação literal e selo)
  - Estadão Verifica: https://www.estadao.com.br/estadao-verifica/debate-tv-globo-checagem-tempo-real-ao-vivo/ (só paráfrase, sem fala literal: serve para contar agências e votos, não como fonte de citação)
  - Aos Fatos: https://www.aosfatos.org/noticias/checamos-flavio-bolsonaro-lula-debate-globo/ (a página traz só o resumo; as falas e os selos ficam no embed do Escriba, fora do texto da página: usada só para contar agências)
  - Comprova: nenhuma checagem de falas do debate encontrada.
- Duplicatas: comparei `citacao` e `texto` do banco com cada fala candidata. Falas já presentes (de outra ocasião) ficaram de fora.
- Escolha: os pares com menos itens jogáveis antes desta rodada eram esquerda/falso (13) e direita/verdadeiro (13); em seguida direita/enganoso (28) e esquerda/enganoso (31).
- `alcance`: 3 quando duas ou mais agências da lista checaram a mesma fala; 2 quando só uma.
- Validação: `npm test`, `npx tsx scripts/verificar-fontes.ts`, `npx tsx scripts/validar-revisao.ts` e `npx tsx scripts/conferir-citacoes.ts --estrito` (todas as citações aparecem na página da fonte).

## Novas

| id | lado | veredito | alcance | agências (selo) | fonte |
|---|---|---|---|---|---|
| 0236f27b | esquerda | falso | 3 | Lupa (Falso), G1 (#FAKE), Estadão (Falso) | Lupa |
| 122ae1d2 | esquerda | falso | 2 | G1 (#FAKE) | G1 Fato ou Fake |
| d7028255 | esquerda | enganoso | 3 | G1 (#NÃOÉBEMASSIM), Lupa (Falta contexto) | G1 Fato ou Fake |
| 3db29d6e | direita | verdadeiro | 3 | Lupa (Verdadeiro), G1 (#FATO) | Lupa |
| 665b6616 | direita | verdadeiro | 2 | G1 (#FATO) | G1 Fato ou Fake |
| 7be06631 | direita | verdadeiro | 3 | Lupa (Verdadeiro), G1 (#FATO) | Lupa |

## Checadas, mas fora

- Já no banco: PIB acima de 3% só com Lula (a88285e0), "pai do tigrinho" de Flávio (6b98ca43), roubo de celular para "cervejinha" (50b79160), Bolsa Família de R$ 600 (b430643c), 33 milhões passando fome (2027f3bc), fim da fome (eaa6facd), 6 mil obras paradas (311499c1), licença-maternidade (9ffc66a8), dívida de R$ 11 trilhões (912298e6), população de rua dobrou (c6e52312), carga tributária recorde (15897b12), maior juro do mundo (b6039b81), 80 milhões com contas atrasadas (5c9b6e39), perdão de dívidas de MEIs (c6a6d3f6).
- Agências em conflito verdadeiro x falso: Flávio sobre 11,5 mil obras paralisadas (Estadão: verdadeiro; G1: #FAKE).
- Sem fala literal numa página de agência: Lula sobre fotos de Flávio com Vorcaro (só Estadão, em paráfrase).
- Rótulo que não conta como voto: Flávio sobre os R$ 30 milhões ao Instituto Lula (Lupa: Insustentável, sem outra agência com citação).
- Limite da rodada (6, até 3 por lado): as demais falas novas ficaram para outra rodada.
