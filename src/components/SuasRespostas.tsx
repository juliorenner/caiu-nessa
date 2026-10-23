'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Veredito } from '@/lib/afirmacoes'
import type { Casa } from '@/lib/cartao'
import { LINK_EM_CARTAO, ROTULO_VEREDITO, SELO_VEREDITO, SUPERFICIE_LISTA } from './rotulos'

export interface RespostaDada {
  id: string
  texto: string
  veredito: Veredito
  casa: Casa
}

// Quadrado da casa (o mesmo desenho do cartão de resultado): cheio, hachurado ou "?".
const QUADRADO = 'flex size-[26px] shrink-0 items-center justify-center border-2 border-tinta'
const DESENHO_CASA: Record<Casa, string> = {
  acerto: `${QUADRADO} bg-tinta`,
  erro: `${QUADRADO} bg-white bg-[repeating-linear-gradient(135deg,var(--color-tinta)_0_2px,transparent_2px_5px)]`,
  quase: `${QUADRADO} bg-white font-letreiro text-[14px] leading-none`,
}
// No servidor o efeito de layout não roda; useEffect evita o aviso fora do navegador.
const useEfeitoDeLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect

const NOME_CASA: Record<Casa, string> = { acerto: 'Acertou', erro: 'Errou', quase: 'Quase' }

// Lista das respostas da rodada. No celular fica recolhida; em lg abre ao montar (e quando a janela
// cresce até lg). Continua podendo abrir e fechar. Superfície branca: dentro dela o texto é tinta nos dois temas.
export function SuasRespostas({ respostas, acertos, total }: { respostas: RespostaDada[]; acertos: number; total: number }) {
  const ref = useRef<HTMLDetailsElement>(null)

  // matchMedia só existe no cliente: abrir no render divergiria da hidratação. Efeito de layout:
  // abre antes da primeira pintura, sem um quadro fechado em telas largas.
  useEfeitoDeLayout(() => {
    const largo = window.matchMedia?.('(min-width: 1024px)')
    if (!largo) return
    if (largo.matches && ref.current) ref.current.open = true
    const aoMudar = (e: MediaQueryListEvent) => {
      if (e.matches && ref.current) ref.current.open = true
    }
    largo.addEventListener?.('change', aoMudar)
    return () => largo.removeEventListener?.('change', aoMudar)
  }, [])

  return (
    <details ref={ref} className={`${SUPERFICIE_LISTA} px-4 py-3 text-left lg:px-6 lg:py-5`}>
      <summary className="cursor-pointer py-1 font-letreiro text-sm lg:flex lg:justify-between">
        Suas respostas <span>({acertos} de {total})</span>
      </summary>
      <ol className="mt-3">
        {respostas.map(r => (
          <li
            key={r.id}
            data-resposta={r.casa}
            className="flex items-start gap-3 border-t-2 border-dashed border-tinta py-3"
          >
            <span aria-hidden className={DESENHO_CASA[r.casa]}>
              {r.casa === 'quase' ? '?' : null}
            </span>
            <span className="sr-only">{NOME_CASA[r.casa]}:</span>
            <p className="min-w-0 flex-1 text-sm leading-snug">{r.texto}</p>
            <span className={`${SELO_VEREDITO[r.veredito]} shrink-0`}>{ROTULO_VEREDITO[r.veredito]}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-col items-start gap-2 border-t-2 border-dashed border-tinta pt-3 text-sm">
        <Link href="/como-escolhemos" className={LINK_EM_CARTAO}>
          Como escolhemos
        </Link>
        <Link href="/afirmacoes" className={LINK_EM_CARTAO}>
          Todas as afirmações e fontes
        </Link>
      </div>
    </details>
  )
}
