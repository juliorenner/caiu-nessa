import Quiz from '@/components/Quiz'
import { getDb } from '@/db/client'
import { type Afirmacao, carregarPool, POR_PAR_PRIMEIRA, semLado, sortearRodada } from '@/lib/afirmacoes'
import { obterEstatisticas } from '@/lib/estatisticas'

export const dynamic = 'force-dynamic'

async function erroPorAfirmacao(pool: Afirmacao[]) {
  try {
    const estatisticas = await obterEstatisticas(await getDb(), pool)
    return estatisticas?.erroPorAfirmacao ?? null
  } catch (erro) {
    // Sem banco o jogo continua jogável, só sem "% das pessoas erraram esta".
    console.error('quiz: estatísticas indisponíveis', erro instanceof Error ? erro.message : String(erro))
    return null
  }
}

export default async function QuizPage() {
  const pool = carregarPool()
  // A rodada já sai embaralhada do sorteio.
  const rodada = sortearRodada(pool, POR_PAR_PRIMEIRA, [])
  if (!rodada) throw new Error('Pool insuficiente para a primeira rodada')
  return (
    <main className="mx-auto w-full max-w-2xl flex-1">
      <Quiz afirmacoes={rodada.map(semLado)} erroPorAfirmacao={await erroPorAfirmacao(pool)} />
    </main>
  )
}
