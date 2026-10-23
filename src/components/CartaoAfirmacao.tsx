'use client'

import { useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactElement } from 'react'
import type { Veredito } from '@/lib/afirmacoes'
import { inclinacao, opacidadeSelo, useArrasto } from './arrasto'
import { IconesDoCartao } from './IconesDoCartao'
import { CARIMBO_CARTAO, ROTULO_BOTAO, SUPERFICIE } from './rotulos'
import type { AfirmacaoNoQuiz } from './tipos'

// ativo: arrastável; respondido: inclinado e carimbado, parado (painel aberto); saindo: voa para fora (300 ms).
export type FaseCartao = 'ativo' | 'respondido' | 'saindo'

// Com o cartão ocupando a altura, frases curtas ganham um degrau a mais (24 px).
export function tamanhoDoTexto(texto: string): 'text-2xl' | 'text-xl' | 'text-lg' | 'text-base' {
  if (texto.length <= 60) return 'text-2xl'
  if (texto.length <= 90) return 'text-xl'
  if (texto.length <= 160) return 'text-lg'
  return 'text-base'
}

export const CARTAO_BASE = `p-5 ${SUPERFICIE}`

// Dentro da superfície branca: secundário sem variante escura (o cartão é branco nos dois temas).
const DICA = 'pointer-events-none absolute font-letreiro text-[11px] leading-none whitespace-nowrap'

// Posição parada (respondido) ou de saída (saindo) no eixo da resposta.
function transformFinal(veredito: Veredito, fase: 'respondido' | 'saindo'): string {
  const saindo = fase === 'saindo'
  if (veredito === 'enganoso') return `translateY(${saindo ? '-120%' : '-40px'}) rotate(-6deg)`
  const sinal = veredito === 'verdadeiro' ? '' : '-'
  return `translateX(${sinal}${saindo ? '120%' : '40px'}) rotate(${sinal}8deg)`
}

export function CartaoAfirmacao({
  afirmacao,
  fase,
  respostaDada,
  onResposta,
  reduzirMovimento,
  semente,
}: {
  afirmacao: AfirmacaoNoQuiz
  fase: FaseCartao
  respostaDada: Veredito | null
  onResposta: (v: Veredito) => void
  reduzirMovimento: boolean
  semente: number
}): ReactElement {
  const ativo = fase === 'ativo'
  const { handlers, dx, dy, arrastando, selo } = useArrasto({ ativo, onResposta })
  // Medido no início de cada arrasto (jsdom devolve 0: sem inclinação nem selo visível).
  const [tamanho, setTamanho] = useState({ largura: 0, altura: 0 })

  function onPointerDown(event: ReactPointerEvent) {
    const rect = event.currentTarget.getBoundingClientRect?.()
    setTamanho({ largura: rect?.width ?? 0, altura: rect?.height ?? 0 })
    handlers.onPointerDown(event)
  }

  let style: CSSProperties | undefined
  let transicao = ''
  // Movimento reduzido: o cartão segue o dedo sem inclinar e não desliza nem voa depois da resposta.
  if (ativo) {
    const giro = reduzirMovimento ? '' : ` rotate(${inclinacao(dx, tamanho.largura)}deg)`
    style = { transform: `translate(${dx}px, ${dy}px)${giro}` }
    // Mola curta ao soltar aquém do limiar; durante o arrasto, sem transição para não atrasar o dedo.
    if (!arrastando && !reduzirMovimento) transicao = 'transition-transform duration-200 ease-out'
  } else if (respostaDada && !reduzirMovimento) {
    style = { transform: transformFinal(respostaDada, fase) }
    transicao = 'transition-transform duration-300 ease-out'
  }

  const vereditoSelo = ativo ? selo : respostaDada
  const opacidade = ativo ? opacidadeSelo(dx, dy, tamanho.largura, tamanho.altura) : 1

  return (
    <div
      role="group"
      aria-label="Afirmação"
      className={`relative flex flex-1 flex-col justify-center touch-none select-none ${CARTAO_BASE} ${transicao}`}
      style={style}
      {...(ativo ? { ...handlers, onPointerDown } : {})}
    >
      {/* Primeiro filho: o ?, as dicas, o texto (relative) e o carimbo vêm depois e pintam por cima. */}
      <IconesDoCartao semente={semente} longo={tamanhoDoTexto(afirmacao.texto) === 'text-base'} />
      <span aria-hidden className="absolute -top-4 left-2 font-letreiro text-[72px] leading-none text-papel">
        ?
      </span>
      {/* Dicas de gesto nas bordas; o texto para leitor de tela sobre as setas fica no Quiz. */}
      <span aria-hidden className={`${DICA} top-1 left-1/2 -translate-x-1/2 text-secundario`}>
        ↑ Cheira mal
      </span>
      <span aria-hidden className={`${DICA} bottom-1 left-2 text-mentira`}>
        ← Mentira
      </span>
      <span aria-hidden className={`${DICA} right-2 bottom-1 text-verdade`}>
        Verdade →
      </span>
      <p className={`relative ${tamanhoDoTexto(afirmacao.texto)} font-bold leading-snug text-balance`}>
        {afirmacao.texto}
      </p>
      {vereditoSelo && (
        <span
          data-selo={vereditoSelo}
          aria-hidden
          className={`absolute top-4 right-4 ${CARIMBO_CARTAO[vereditoSelo]}`}
          style={{ opacity: opacidade }}
        >
          {ROTULO_BOTAO[vereditoSelo]}
        </span>
      )}
    </div>
  )
}
