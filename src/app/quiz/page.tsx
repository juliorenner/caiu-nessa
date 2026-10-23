import Partida from '@/components/Partida'
import { getDb } from '@/db/client'
import { type Afirmacao, carregarPool, semLado, sortearRodada } from '@/lib/afirmacoes'
import { obterEstatisticasComCache } from '@/lib/estatisticas'
import { COMPOSICAO_PRIMEIRA, PESOS_DA_PRIMEIRA } from '@/lib/rodadas'

export const dynamic = 'force-dynamic'

async function erroPorAfirmacao(pool: Afirmacao[]) {
  try {
    const estatisticas = await obterEstatisticasComCache(await getDb(), pool)
    return estatisticas?.erroPorAfirmacao ?? null
  } catch (erro) {
    // Sem banco o jogo continua jogável, só sem "% das pessoas erraram esta".
    console.error('quiz: estatísticas indisponíveis', erro instanceof Error ? erro.message : String(erro))
    return null
  }
}

export default async function QuizPage() {
  const pool = carregarPool()
  // A rodada já sai embaralhada do sorteio; a primeira prefere as afirmações de maior alcance.
  const rodada = sortearRodada(pool, COMPOSICAO_PRIMEIRA, [], Math.random, PESOS_DA_PRIMEIRA)
  if (!rodada) throw new Error('Pool insuficiente para a primeira rodada')
  return (
    <main className="mx-auto w-full max-w-2xl flex-1">
      <Partida inicial={rodada.map(semLado)} erroPorAfirmacao={await erroPorAfirmacao(pool)} />
    </main>
  )
}
