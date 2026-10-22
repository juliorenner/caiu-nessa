'use client'

import { useEffect, useRef } from 'react'
import type { Afirmacao, Veredito } from '@/lib/afirmacoes'
import { mensagem } from './mensagemVeredito'
import { BOTAO_PRIMARIO, LINK_EM_CARTAO, ROTULO_VEREDITO, SELO_VEREDITO } from './rotulos'

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
      <p className="text-base text-stone-600">Quem disse: {afirmacao.autor}</p>
      <blockquote className="border-l-4 border-stone-200 pl-3 text-base text-stone-600 italic">“{afirmacao.citacao}”</blockquote>
      <p className="text-base leading-relaxed text-stone-700">{afirmacao.explicacao}</p>
      <a
        href={afirmacao.fonte_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`self-start text-base ${LINK_EM_CARTAO}`}
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
