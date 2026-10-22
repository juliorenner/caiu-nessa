'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { RespostaResultado } from '@/lib/resultado-api'
import { Ficha } from './Ficha'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, LINK_PAGINA, TEXTO_SECUNDARIO } from './rotulos'

// Número grande do placar: letreiro com sombra em camadas (papel e tinta; trocam no escuro).
const NUMERO_PLACAR =
  'font-letreiro text-[clamp(56px,18vw,72px)] leading-none text-tinta dark:text-papel [text-shadow:4px_4px_0_var(--color-papel),6px_6px_0_var(--color-tinta)] dark:[text-shadow:4px_4px_0_var(--color-tinta),6px_6px_0_var(--color-papel)]'

// Carimbo tinta da avaliação: não é cor de veredito, a faixa não é juízo de valor colorido.
const CARIMBO_AVALIACAO =
  'font-letreiro text-base border-[3px] border-tinta dark:border-papel rounded-md -rotate-3 inline-block px-3 pt-1.5 pb-1'

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
    <section aria-live="polite" className="flex flex-col gap-5 text-center text-tinta dark:text-papel">
      <Ficha esquerda="Fim de jogo" direita={`Rodada ${p.rodada}`} />
      <div className="flex flex-col items-center gap-3">
        <p className="font-letreiro text-[13px]">Placar</p>
        <p data-placar className={NUMERO_PLACAR}>
          {resultado.acertos}/{resultado.total}
        </p>
        {p.rodada > 1 && (
          <p className="font-letreiro text-base">
            Na partida {p.acumulado.acertos}/{p.acumulado.total}
          </p>
        )}
      </div>
      <h1>
        <span className={CARIMBO_AVALIACAO}>{avaliacao.titulo}</span>
      </h1>
      <p className="text-lg leading-relaxed">{avaliacao.texto}</p>
      {avaliacao.vies !== null && <p className={`text-base leading-relaxed ${TEXTO_SECUNDARIO}`}>{avaliacao.vies}</p>}
      {/* A comparação com os outros jogadores só existe para a rodada de 12. Papel é claro nos dois temas. */}
      {p.rodada === 1 && (
        <p className="border-[3px] border-tinta bg-papel p-4 text-base text-tinta">
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
      <p className={`text-sm ${TEXTO_SECUNDARIO}`}>
        Acertei {p.acumulado.acertos} de {p.acumulado.total} no Caiu Nessa? caiunessa.com.br
      </p>
      <Link
        href="/como-escolhemos"
        className={`self-center text-base ${LINK_PAGINA}`}
      >
        Como escolhemos as afirmações
      </Link>
      <Link
        href="/afirmacoes"
        className={`self-center text-base ${LINK_PAGINA}`}
      >
        Ver todas as afirmações e suas fontes
      </Link>
    </section>
  )
}
