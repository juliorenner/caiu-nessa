import Quiz from '@/components/Quiz'
import { getDb } from '@/db/client'
import { carregarAfirmacoes } from '@/lib/afirmacoes'
import { obterEstatisticas } from '@/lib/estatisticas'

export const dynamic = 'force-dynamic'

async function erroPorAfirmacao(afirmacoes: ReturnType<typeof carregarAfirmacoes>) {
  try {
    const estatisticas = await obterEstatisticas(await getDb(), afirmacoes)
    return estatisticas?.erroPorAfirmacao ?? null
  } catch {
    // Sem banco o jogo continua jogável, só sem "% das pessoas erraram esta".
    console.error('quiz: estatísticas indisponíveis')
    return null
  }
}

export default async function QuizPage() {
  const afirmacoes = carregarAfirmacoes()
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <Quiz
        afirmacoes={afirmacoes.map(({ lado: _lado, ...semLado }) => semLado)}
        erroPorAfirmacao={await erroPorAfirmacao(afirmacoes)}
      />
    </main>
  )
}
