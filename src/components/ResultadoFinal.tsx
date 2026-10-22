import Link from 'next/link'
import { TOTAL_AFIRMACOES } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'
import { BOTAO_PRIMARIO, FOCO } from './rotulos'

export function ResultadoFinal(p: { dados: RespostaResultado }) {
  const { resultado, avaliacao, estatisticas, percentilAbaixo, estatisticasIndisponiveis } = p.dados
  return (
    <section aria-live="polite" className="flex flex-col gap-5 text-center">
      <p className="text-6xl font-extrabold tracking-tight">
        {resultado.acertos} de {TOTAL_AFIRMACOES}
      </p>
      <h1 className="text-3xl font-bold">{avaliacao.titulo}</h1>
      <p className="text-lg leading-relaxed">{avaliacao.texto}</p>
      {avaliacao.vies !== null && <p className="text-base leading-relaxed text-stone-700">{avaliacao.vies}</p>}
      <p className="rounded-xl bg-stone-100 p-4 text-base text-stone-800">
        {estatisticasIndisponiveis
          ? 'A comparação com os outros jogadores não está disponível agora.'
          : estatisticas
          ? `Você acertou mais que ${percentilAbaixo ?? 0}% das pessoas.`
          : 'Você é um dos primeiros a jogar. A comparação com os outros aparece a partir de 100 jogadas.'}
      </p>
      {/* Recarrega a página: novo embaralhamento e estatísticas atualizadas. */}
      <a href="/quiz" className={BOTAO_PRIMARIO}>
        Jogar de novo
      </a>
      <p className="text-sm text-stone-600">
        Acertei {resultado.acertos} de {TOTAL_AFIRMACOES} no Caiu Nessa? caiunessa.com.br
      </p>
      <Link
        href="/como-escolhemos"
        className={`self-center rounded text-base font-medium underline underline-offset-4 ${FOCO}`}
      >
        Como escolhemos as afirmações
      </Link>
      <Link
        href="/afirmacoes"
        className={`self-center rounded text-base font-medium underline underline-offset-4 ${FOCO}`}
      >
        Ver todas as afirmações e suas fontes
      </Link>
    </section>
  )
}
