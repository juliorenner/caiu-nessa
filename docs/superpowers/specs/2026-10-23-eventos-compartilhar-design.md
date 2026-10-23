# Eventos no banco: compartilhamentos (design)

Data: 2026-10-23. Pedido do autor: "manter no banco por hora, e no futuro pensamos em acessar/visualizar"; "o total de jogos talvez seja o suficiente por hora"; "seria legal ter um número estimado no total de compartilhamentos". O total de jogos já existe (tabela `jogadas`). Falta registrar os compartilhamentos.

## Intenção
Saber quantas vezes o placar foi compartilhado, por caminho (link, stories, download) e desfecho (abriu a folha, copiou, cancelou, falhou). "Estimado" porque o navegador só diz que a folha de compartilhar abriu ou que o texto foi copiado; não diz se a mensagem foi mesmo enviada.

## Objetivos
- Tabela `eventos` genérica (tipo, dados, data, hash de IP) para que novos eventos no futuro (visita, início, abandono) sejam só um tipo a mais, sem nova migração.
- Por ora só o tipo `compartilhar`, gravado a cada toque em "Compartilhar placar", "Mandar para os stories" e "Baixar imagem para os stories", com `modo` (`link` | `imagem` | `baixar`) e `resultado` (o que `compartilhar()` devolveu: `folha`, `copiado`, `cancelado`, `falhou`, `indisponivel`; `clique` para o download).
- Nunca atrapalhar o jogo: envio em segundo plano, sem esperar resposta, sem erro visível, sem bloquear o compartilhar.
- Sem painel. Leitura por SQL (abaixo) ou por `node scripts/metricas.mjs` com `DATABASE_URL` no ambiente (imprime total de jogadas e de compartilhamentos por modo e resultado).

## Não objetivos
- Visitas, início e abandono (o autor reduziu o escopo a jogos + compartilhamentos; a tabela já comporta).
- Painel ou página pública. Cookie, identificação de pessoa.

## Anti-objetivos
- Um evento que trave ou atrase o toque de compartilhar.
- Uma tabela que possa ser inflada por um script: limite por hash de IP.

## Restrições
- Anônimo: só `tipo`, `dados` (pequeno), `created_at` e o mesmo hash de IP com `IP_HASH_SALT` que `jogadas` usa.
- Limite: no máximo 60 eventos por hash de IP por hora (`LIMITE_EVENTOS_POR_HORA`); acima disso a API responde 429 e não grava.
- Validação Zod: `tipo` ∈ `TIPOS_DE_EVENTO` (lista única em `src/lib/eventos.ts`), `dados` objeto com até 500 caracteres serializado; para `compartilhar`, `modo` e `resultado` dentro dos valores acima.
- Envio pelo cliente com `fetch(..., { keepalive: true })` sem `await` do chamador; qualquer falha é engolida.
- SOLID como nas rodadas: tipos e esquemas de `dados` são dados numa lista; a API não tem `if` por tipo; a função de registrar recebe o `fetch` como parâmetro com padrão.
- Commits sem `JUL-`.

## Como ler (sem painel)
```sql
select count(*) as jogadas from jogadas;
select dados->>'modo' as modo, dados->>'resultado' as resultado, count(*) from eventos where tipo = 'compartilhar' group by 1, 2 order by 1, 2;
```
Compartilhamentos estimados = `resultado in ('folha', 'copiado')` + `baixar/clique`.

## Critério de pronto
Tocar nos três botões grava três linhas com modo/resultado certos (teste de componente com fetch falso); POST inválido → 400; acima do limite → 429; `npm run metricas` imprime as contagens num PGlite local; lint, typecheck, testes e build verdes; migração gerada em `drizzle/`.
