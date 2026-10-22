'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { RespostaResultado } from '@/lib/resultado-api'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CARTAO_SUPERFICIE, FOCO, TEXTO_SECUNDARIO } from './rotulos'

type EstadoContinuar = 'parado' | 'sorteando' | 'fim' | 'falha'

export function ResultadoFinal(p: {
  dados: RespostaResultado
  rodada: number
  acumulado: { acertos: number; total: number }
  onContinuar: () => Promise<'ok' | 'fim' | 'falha'>
}) {
  const { resultado, avaliacao, estatisticas, percentilAbaixo, estatisticasIndisponiveis } = p.dados
  const [continuar, setContinuar] = useState<EstadoContinuar>('parado')

  async function aoContinuar() {
    if (continuar === 'sorteando') return
    setContinuar('sorteando')
    const desfecho = await p.onContinuar()
    // 'ok' remonta o quiz; aqui só sobram fim e falha.
    if (desfecho !== 'ok') setContinuar(desfecho)
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-5 text-center">
      <p className="text-6xl font-extrabold tracking-tight">
        {p.rodada === 1
          ? `${resultado.acertos} de ${resultado.total}`
          : `Rodada ${p.rodada}: ${resultado.acertos} de ${resultado.total}`}
      </p>
      {p.rodada > 1 && (
        <p className="text-xl font-semibold">
          Na partida: {p.acumulado.acertos} de {p.acumulado.total}
        </p>
      )}
      <h1 className="text-3xl font-bold">{avaliacao.titulo}</h1>
      <p className="text-lg leading-relaxed">{avaliacao.texto}</p>
      {avaliacao.vies !== null && <p className={`text-base leading-relaxed ${TEXTO_SECUNDARIO}`}>{avaliacao.vies}</p>}
      {/* A comparação com os outros jogadores só existe para a rodada de 12. */}
      {p.rodada === 1 && (
        <p className={`rounded-xl p-4 text-base ${CARTAO_SUPERFICIE}`}>
          {estatisticasIndisponiveis
            ? 'A comparação com os outros jogadores não está disponível agora.'
            : estatisticas
            ? `Você acertou mais que ${percentilAbaixo ?? 0}% das pessoas.`
            : 'Você é um dos primeiros a jogar. A comparação com os outros aparece a partir de 100 jogadas.'}
        </p>
      )}
      {continuar === 'falha' && (
        <p role="alert" className="text-base">
          Não deu para sortear. Tente de novo.
        </p>
      )}
      {continuar === 'fim' ? (
        <p className="text-lg">Acabaram as afirmações por enquanto. Volte depois: a lista cresce.</p>
      ) : (
        <button
          type="button"
          onClick={aoContinuar}
          disabled={continuar === 'sorteando'}
          aria-busy={continuar === 'sorteando' ? true : undefined}
          className={BOTAO_PRIMARIO}
        >
          {continuar === 'sorteando' ? 'Sorteando…' : 'Continuar jogando'}
        </button>
      )}
      {/* Recarrega a página: nova partida, novo sorteio e estatísticas atualizadas. */}
      <a href="/quiz" className={BOTAO_SECUNDARIO}>
        Jogar de novo
      </a>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Acertei {p.acumulado.acertos} de {p.acumulado.total} no Caiu Nessa? caiunessa.com.br
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
