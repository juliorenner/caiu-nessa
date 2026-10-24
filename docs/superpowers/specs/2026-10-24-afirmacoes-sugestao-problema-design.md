# Afirmações na home, vista em tabela, sugestão e problema (JUL-145)

**Origem:** pedido do dono (24/10): link para todas as afirmações também na home; em `/afirmacoes`, alternar entre a vista atual e uma tabela; na home e no fim de jogo, um formulário para sugerir notícias que faltam (com o link da agência de checagem), que vira uma issue "sugestão" no GitHub; e "Teve algum problema? Reporte aqui", com texto livre, que vira uma issue "bug". Mockups: https://claude.ai/artifact/TH5rSgG4JEVPHkwBJRVbSG. O dono escolheu as opções recomendadas e trocou "Ajude a melhorar" por "Nos ajude a melhorar".

## O que foi feito

- **Home (opção B):** "Ver todas as afirmações e suas fontes" no cartão, logo abaixo da contagem (em lg, na coluna de links ao lado do Começar); painel "Nos ajude a melhorar" no fim, com sugerir e reportar.
- **Fim de jogo (opção B):** o mesmo painel, depois dos links (em lg, embaixo da coluna da esquerda).
- **`/afirmacoes`:** "Ver como: Cartões | Tabela" por link (`?vista=tabela`), sem JavaScript. A tabela é uma `<table>` só: colunas em lg, linhas empilhadas no celular (opção A, sem rolagem lateral). Mostra afirmação, quem disse, veredito, checagem e data; citação e explicação ficam nos cartões.
- **`/sugerir` e `/relatar`:** páginas próprias (não folha: no celular o teclado cobre o enviar).
- **`POST /api/contribuicao`:** valida, aplica o limite e cria a issue com `GITHUB_ISSUES_TOKEN`.

## Regras

- Sugestão: link obrigatório, aceito pela mesma regra das fontes do banco (`src/lib/fontes.ts`); contexto opcional até 280 caracteres.
- Problema: descrição de 10 a 1000 caracteres; tela opcional, de uma lista.
- Anti-abuso: 5 envios por hora por IP (hash com salt, evento `contribuicao`), campo-armadilha, esquema estrito.
- Privacidade: sem nome nem e-mail, aviso de issue pública, nada do aparelho é anexado; o evento guarda só o tipo e o número da issue.
- Texto livre dentro de bloco de código na issue: não menciona ninguém nem ativa links.
- Sem token (ou com o GitHub fora): o formulário guarda o texto e oferece "abra a issue direto no GitHub".

## Decisões minhas (o dono pode mudar)

- Respostas às perguntas abertas dos mockups pelas suposições recomendadas: contexto opcional; domínios iguais aos do banco (G1 só `/fato-ou-fake`, Estadão só `estadao-verifica`, Comprova aceito); nada do aparelho anexado; sem aviso de duplicata na hora; o sucesso mostra o número e o link da issue; a vista da tabela fica no endereço, sem ordenar nem filtrar.
