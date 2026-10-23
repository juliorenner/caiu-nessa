// Uso: npx tsx scripts/pagina.ts <url>
// Imprime o texto inteiro de uma página de checagem (só agências da lista), com os selos em atributo
// trazidos para o texto. É o que o agente da revisão mensal usa no lugar do WebFetch, que recusa alguns
// domínios e corta páginas longas.
import { lerPagina } from '../src/lib/pagina'

const url = process.argv[2]
if (!url) {
  console.error('uso: npx tsx scripts/pagina.ts <url>')
  process.exit(2)
}
try {
  console.log(await lerPagina(url))
} catch (erro) {
  console.error(erro instanceof Error ? erro.message : String(erro))
  process.exit(1)
}
