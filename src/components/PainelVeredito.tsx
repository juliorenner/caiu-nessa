'use client'

import { type KeyboardEvent, type PointerEvent, type ReactElement, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Veredito } from '@/lib/afirmacoes'
import { mensagem } from './mensagemVeredito'
import { BOTAO_PRIMARIO, CARTAO_SUPERFICIE, LINK_EM_CARTAO, ROTULO_VEREDITO, SELO_VEREDITO } from './rotulos'
import type { AfirmacaoNoQuiz } from './tipos'

const LIMIAR_FECHAR = 80
const FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function PainelVeredito(p: {
  afirmacao: AfirmacaoNoQuiz
  respostaDada: Veredito
  erroPct: number | null
  ultima: boolean
  onFechar: () => void
  reduzirMovimento: boolean
}): ReactElement {
  const { afirmacao, respostaDada, erroPct, ultima, onFechar, reduzirMovimento } = p
  const [montado, setMontado] = useState(false)
  const [entrou, setEntrou] = useState(false)
  const botaoRef = useRef<HTMLButtonElement>(null)
  const inicioY = useRef<number | null>(null)
  const idMensagem = useId()

  useEffect(() => {
    setMontado(true)
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [])

  useEffect(() => {
    if (!montado) return
    // preventScroll: o botão é o último item do painel; sem isso o painel rola até ele e esconde o topo.
    botaoRef.current?.focus({ preventScroll: true })
    // Um quadro depois do primeiro paint do painel, para o navegador pintar translate-y-full antes de animar.
    const quadro = requestAnimationFrame(() => setEntrou(true))
    return () => cancelAnimationFrame(quadro)
  }, [montado])

  function conterFoco(e: KeyboardEvent<HTMLElement>) {
    if (e.key !== 'Tab') return
    const focaveis = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(FOCAVEIS))
    if (focaveis.length === 0) return
    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault()
      ultimo.focus()
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault()
      primeiro.focus()
    }
  }

  function aoPressionar(e: PointerEvent<HTMLDivElement>) {
    inicioY.current = e.clientY
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  function aoCancelar() {
    inicioY.current = null
  }

  function aoSoltar(e: PointerEvent<HTMLDivElement>) {
    if (inicioY.current === null) return
    const dy = e.clientY - inicioY.current
    inicioY.current = null
    if (dy > LIMIAR_FECHAR) onFechar()
  }

  if (!montado) return <></>

  const movimento = reduzirMovimento
    ? 'translate-y-0'
    : `transition-transform duration-[250ms] ease-out ${entrou ? 'translate-y-0' : 'translate-y-full'}`

  return createPortal(
    <>
      <div data-backdrop className="fixed inset-0 z-40 bg-black/40" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Veredito da afirmação"
        aria-live="polite"
        aria-describedby={idMensagem}
        onKeyDown={conterFoco}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-t-3xl px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))] ${CARTAO_SUPERFICIE} ${movimento}`}
      >
        <div
          data-alca
          aria-hidden="true"
          onPointerDown={aoPressionar}
          onPointerUp={aoSoltar}
          onPointerCancel={aoCancelar}
          className="flex min-h-12 shrink-0 touch-none items-center justify-center"
        >
          <div className="h-1 w-10 rounded-full bg-stone-300" />
        </div>
        <span className={SELO_VEREDITO[afirmacao.veredito]}>{ROTULO_VEREDITO[afirmacao.veredito]}</span>
        <p id={idMensagem} className="text-lg font-semibold">{mensagem(afirmacao.veredito, respostaDada)}</p>
        <p className="text-base text-stone-600">Quem disse: {afirmacao.autor}</p>
        <blockquote className="border-l-4 border-stone-200 pl-3 text-base text-stone-600 italic">“{afirmacao.citacao}”</blockquote>
        <p className="text-base leading-relaxed text-stone-700">{afirmacao.explicacao}</p>
        {erroPct !== null && <p className="text-base text-stone-600">{erroPct}% das pessoas erraram esta.</p>}
        <a
          href={afirmacao.fonte_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`self-start text-base ${LINK_EM_CARTAO}`}
        >
          Ver a checagem ({afirmacao.fonte_nome})
        </a>
        <button ref={botaoRef} type="button" onClick={onFechar} className={BOTAO_PRIMARIO}>
          {ultima ? 'Ver meu resultado' : 'Próxima'}
        </button>
      </section>
    </>,
    document.body,
  )
}
