'use client'

import { useEffect, useRef } from 'react'
import type { Afirmacao, Veredito } from '@/lib/afirmacoes'
import { ehQuase } from '@/lib/pontuacao'
import { BOTAO_PRIMARIO, FOCO, ROTULO_VEREDITO, SELO_VEREDITO } from './rotulos'

function mensagem(veredito: Veredito, respostaDada: Veredito): string {
  if (respostaDada === veredito) return 'Você acertou.'
  if (ehQuase(veredito, respostaDada)) {
    return `Quase: você desconfiou, mas a checagem classificou como ${ROTULO_VEREDITO[veredito]}.`
  }
  if (respostaDada === 'verdadeiro') return 'Você caiu nessa.'
  return 'Era verdade.'
}

export function Feedback(p: {
  afirmacao: Omit<Afirmacao, 'lado'>
  respostaDada: Veredito
  erroPct: number | null
  onProximo: () => void
  ultima: boolean
}) {
  const { afirmacao, respostaDada, erroPct, onProximo, ultima } = p
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    ref.current?.scrollIntoView?.({ behavior: reduzir ? 'auto' : 'smooth', block: 'start' })
  }, [])

  return (
    <section ref={ref} aria-live="polite" className="mt-6 flex scroll-mt-4 flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <span className={SELO_VEREDITO[afirmacao.veredito]}>{ROTULO_VEREDITO[afirmacao.veredito]}</span>
      <p className="text-lg font-semibold">{mensagem(afirmacao.veredito, respostaDada)}</p>
      <p className="text-base leading-relaxed text-stone-700">{afirmacao.explicacao}</p>
      <a
        href={afirmacao.fonte_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`self-start rounded text-base font-medium text-stone-900 underline underline-offset-4 ${FOCO}`}
      >
        Ver a checagem ({afirmacao.fonte_nome})
      </a>
      {erroPct !== null && <p className="text-base text-stone-600">{erroPct}% das pessoas erraram esta.</p>}
      <button type="button" onClick={onProximo} className={BOTAO_PRIMARIO}>
        {ultima ? 'Ver meu resultado' : 'Próxima'}
      </button>
    </section>
  )
}
