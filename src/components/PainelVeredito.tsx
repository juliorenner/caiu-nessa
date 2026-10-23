'use client'

import { type KeyboardEvent, type PointerEvent, type ReactElement, useEffect, useId, useRef, useState } from 'react'
import type { Veredito } from '@/lib/afirmacoes'
import { formatarData } from '@/lib/datas'
import { mensagem } from './mensagemVeredito'
import { Tecla } from './Tecla'
import { BOTAO_EM_CARTAO, LINK_EM_CARTAO, ROTULO_VEREDITO, SELO_VEREDITO } from './rotulos'
import type { AfirmacaoNoQuiz } from './tipos'

const LIMIAR_FECHAR = 80
const FOCAVEIS = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
// Superfície branca com borda só em cima e sombra dupla acima (papel, depois tinta), cantos retos.
// No escuro a sombra fica sobre o fundo da página: inverte (tinta por cima, papel por baixo).
const SUPERFICIE_PAINEL =
  'bg-superficie text-tinta border-t-[3px] border-tinta shadow-[0_-8px_0_var(--color-papel),0_-12px_0_var(--color-tinta)] dark:shadow-[0_-8px_0_var(--color-tinta),0_-12px_0_var(--color-papel)] rounded-none'

// Em lg o painel vira a coluna da direita do quiz (ao lado do cartão): estático, borda inteira e sombra na cor do veredito.
// `lg:motion-reduce:` e `lg:dark:` repetem a regra porque, no CSS gerado, `lg:` vem depois de `motion-reduce:` e antes de `dark:`.
const PAINEL_LG =
  'lg:static lg:col-start-2 lg:row-start-2 lg:mx-0 lg:max-h-none lg:w-auto lg:max-w-none lg:translate-x-0 lg:translate-y-0 lg:border-[3px] lg:pt-5 lg:pb-5 lg:animate-[entrar-da-direita_200ms_ease-out] motion-reduce:animate-none lg:motion-reduce:animate-none'
const BORDA_LG: Record<Veredito, string> = {
  verdadeiro: 'lg:border-verdade lg:shadow-[6px_6px_0_var(--color-verdade)] lg:dark:shadow-[6px_6px_0_var(--color-verdade)]',
  falso: 'lg:border-mentira lg:shadow-[6px_6px_0_var(--color-mentira)] lg:dark:shadow-[6px_6px_0_var(--color-mentira)]',
  enganoso: 'lg:border-cheira lg:shadow-[6px_6px_0_var(--color-cheira)] lg:dark:shadow-[6px_6px_0_var(--color-cheira)]',
}

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- o painel monta num render e anima no seguinte; o primeiro paint precisa sair com translate-y-full
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

  // Enter avança de qualquer lugar da página, não só com o botão focado (o clique no painel tira o foco dele).
  // Num botão, link ou campo o Enter já tem efeito próprio; aí não dispara de novo.
  useEffect(() => {
    function aoTeclar(e: globalThis.KeyboardEvent) {
      if (e.key !== 'Enter' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const origem = e.target instanceof HTMLElement ? e.target : null
      if (origem && origem !== document.body && origem.closest('a, button, input, textarea, select, [role="button"]')) return
      e.preventDefault()
      onFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

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

  // Fica dentro da raiz do Quiz (fora do conteúdo com filtro, que quebraria o fixed): no celular, folha de baixo;
  // em lg, a célula da direita da grade.
  return (
    <>
      <div data-backdrop className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Veredito da afirmação"
        aria-live="polite"
        aria-describedby={idMensagem}
        onKeyDown={conterFoco}
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] w-full max-w-xl flex-col gap-4 overflow-hidden px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))] ${SUPERFICIE_PAINEL} ${PAINEL_LG} ${BORDA_LG[afirmacao.veredito]} ${movimento}`}
      >
        <div
          data-alca
          aria-hidden="true"
          onPointerDown={aoPressionar}
          onPointerUp={aoSoltar}
          onPointerCancel={aoCancelar}
          className="flex min-h-12 shrink-0 touch-none items-center justify-center lg:hidden"
        >
          <div className="h-1 w-10 rounded-full bg-tinta/30" />
        </div>
        {/* Só o conteúdo rola; o botão fica sempre visível no rodapé do painel. */}
        <div data-conteudo-painel className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <span className={SELO_VEREDITO[afirmacao.veredito]}>{ROTULO_VEREDITO[afirmacao.veredito]}</span>
          <p id={idMensagem} className="text-lg font-bold">{mensagem(afirmacao.veredito, respostaDada)}</p>
          <p className="text-base text-secundario">Quem disse: {afirmacao.autor}</p>
          <blockquote className="border-l-[3px] border-tinta pl-3 text-base text-secundario italic">“{afirmacao.citacao}”</blockquote>
          <p className="text-base leading-relaxed text-tinta">{afirmacao.explicacao}</p>
          {erroPct !== null && <p className="text-base text-secundario">{erroPct}% das pessoas erraram esta.</p>}
          <a
            href={afirmacao.fonte_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`self-start text-base ${LINK_EM_CARTAO}`}
          >
            Ver a checagem ({afirmacao.fonte_nome}, {formatarData(afirmacao.data_checagem)})
          </a>
        </div>
        <button ref={botaoRef} type="button" onClick={onFechar} className={`shrink-0 lg:mt-auto lg:gap-3 ${BOTAO_EM_CARTAO}`}>
          {ultima ? 'Ver meu resultado' : 'Próxima'}
          <Tecla cor="papel">Enter</Tecla>
        </button>
      </section>
    </>
  )
}
