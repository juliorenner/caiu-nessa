'use client'

import { useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactElement } from 'react'
import type { Veredito } from '@/lib/afirmacoes'
import { inclinacao, opacidadeSelo, useArrasto } from './arrasto'
import { CARTAO_SUPERFICIE, COR_SELO_CARTAO, ROTULO_BOTAO } from './rotulos'
import type { AfirmacaoNoQuiz } from './tipos'

// ativo: arrastável; respondido: inclinado e carimbado, parado (painel aberto); saindo: voa para fora (300 ms).
export type FaseCartao = 'ativo' | 'respondido' | 'saindo'

export function tamanhoDoTexto(texto: string): 'text-xl' | 'text-lg' | 'text-base' {
  if (texto.length <= 90) return 'text-xl'
  if (texto.length <= 160) return 'text-lg'
  return 'text-base'
}

export const CARTAO_BASE = `rounded-2xl p-6 shadow-md ${CARTAO_SUPERFICIE}`

// Posição parada (respondido) ou de saída (saindo) no eixo da resposta.
function transformFinal(veredito: Veredito, fase: 'respondido' | 'saindo'): string {
  const saindo = fase === 'saindo'
  if (veredito === 'enganoso') return `translateY(${saindo ? '-120%' : '-40px'})`
  const sinal = veredito === 'verdadeiro' ? '' : '-'
  return `translateX(${sinal}${saindo ? '120%' : '40px'}) rotate(${sinal}8deg)`
}

export function CartaoAfirmacao({
  afirmacao,
  fase,
  respostaDada,
  onResposta,
  reduzirMovimento,
}: {
  afirmacao: AfirmacaoNoQuiz
  fase: FaseCartao
  respostaDada: Veredito | null
  onResposta: (v: Veredito) => void
  reduzirMovimento: boolean
}): ReactElement {
  const ativo = fase === 'ativo'
  const { handlers, dx, dy, selo } = useArrasto({ ativo, onResposta })
  // Medido no início de cada arrasto (jsdom devolve 0: sem inclinação nem selo visível).
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 })

  function onPointerDown(event: ReactPointerEvent) {
    const rect = event.currentTarget.getBoundingClientRect?.()
    setTamanho({ largura: rect?.width ?? 0, altura: rect?.height ?? 0 })
    handlers.onPointerDown(event)
  }

  let style: CSSProperties | undefined
  let transicao = ''
  if (ativo) {
    style = { transform: `translate(${dx}px, ${dy}px) rotate(${inclinacao(dx, tamanho.largura)}deg)` }
  } else if (respostaDada && !(fase === 'saindo' && reduzirMovimento)) {
    style = { transform: transformFinal(respostaDada, fase) }
    if (fase === 'saindo') transicao = 'transition-transform duration-300 ease-in'
  }

  const vereditoSelo = ativo ? selo : respostaDada
  const opacidade = ativo ? opacidadeSelo(dx, dy, tamanho.largura, tamanho.altura) : 1

  return (
    <div
      role="group"
      aria-label="Afirmação"
      className={`relative touch-none select-none ${CARTAO_BASE} ${transicao}`}
      style={style}
      {...(ativo ? { ...handlers, onPointerDown } : {})}
    >
      <p className={`${tamanhoDoTexto(afirmacao.texto)} font-semibold leading-snug text-balance`}>{afirmacao.texto}</p>
      {vereditoSelo && (
        <span
          data-selo={vereditoSelo}
          aria-hidden
          className={`absolute top-4 right-4 -rotate-12 rounded-lg border-4 px-2 py-1 text-lg font-black tracking-wider uppercase ${COR_SELO_CARTAO[vereditoSelo]}`}
          style={{ opacity: opacidade }}
        >
          {ROTULO_BOTAO[vereditoSelo]}
        </span>
      )}
    </div>
  )
}
