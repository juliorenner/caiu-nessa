import { useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, PointerEventHandler } from 'react'
import type { Veredito } from '@/lib/afirmacoes'

export const LIMIAR_HORIZONTAL = 0.35 // da largura do cartão
export const LIMIAR_VERTICAL = 0.25 // da altura do cartão
export const TOQUE_MAX_PX = 8
export const INCLINACAO_MAX_GRAUS = 12

export type Direcao = 'direita' | 'esquerda' | 'cima' | 'baixo' | null

export function direcaoDominante(dx: number, dy: number): Direcao {
  const ax = Math.abs(dx)
  const ay = Math.abs(dy)
  if (ax < TOQUE_MAX_PX && ay < TOQUE_MAX_PX) return null
  if (ax >= ay) return dx > 0 ? 'direita' : 'esquerda'
  return dy < 0 ? 'cima' : 'baixo'
}

export function vereditoDaDirecao(d: Direcao): Veredito | null {
  if (d === 'direita') return 'verdadeiro'
  if (d === 'esquerda') return 'falso'
  if (d === 'cima') return 'enganoso'
  return null
}

function progresso(dx: number, dy: number, largura: number, altura: number): number {
  const d = direcaoDominante(dx, dy)
  if (d === 'direita' || d === 'esquerda') return Math.abs(dx) / (largura * LIMIAR_HORIZONTAL)
  if (d === 'cima') return -dy / (altura * LIMIAR_VERTICAL)
  return 0
}

export function passouLimiar(dx: number, dy: number, largura: number, altura: number): Veredito | null {
  return progresso(dx, dy, largura, altura) >= 1 ? vereditoDaDirecao(direcaoDominante(dx, dy)) : null
}

export function inclinacao(dx: number, largura: number): number {
  if (dx === 0 || largura <= 0) return 0
  const graus = (dx / largura) * INCLINACAO_MAX_GRAUS * 2
  return Math.max(-INCLINACAO_MAX_GRAUS, Math.min(INCLINACAO_MAX_GRAUS, graus))
}

export function opacidadeSelo(dx: number, dy: number, largura: number, altura: number): number {
  return Math.min(1, progresso(dx, dy, largura, altura))
}

export function useArrasto({ ativo, onResposta }: { ativo: boolean; onResposta: (v: Veredito) => void }): {
  handlers: {
    onPointerDown: PointerEventHandler
    onPointerMove: PointerEventHandler
    onPointerUp: PointerEventHandler
    onPointerCancel: PointerEventHandler
  }
  dx: number
  dy: number
  arrastando: boolean
  selo: Veredito | null
} {
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [arrastando, setArrastando] = useState(false)
  const inicio = useRef<{ x: number; y: number } | null>(null)
  const tamanho = useRef({ largura: 0, altura: 0 })
  const ultimo = useRef({ dx: 0, dy: 0 })

  function onPointerDown(event: ReactPointerEvent) {
    if (!ativo || event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect?.()
    tamanho.current = { largura: rect?.width ?? 0, altura: rect?.height ?? 0 }
    inicio.current = { x: event.clientX, y: event.clientY }
    ultimo.current = { dx: 0, dy: 0 }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setArrastando(true)
  }

  function onPointerMove(event: ReactPointerEvent) {
    if (!ativo || !inicio.current) return
    ultimo.current = { dx: event.clientX - inicio.current.x, dy: event.clientY - inicio.current.y }
    setDx(ultimo.current.dx)
    setDy(ultimo.current.dy)
  }

  function reiniciar() {
    inicio.current = null
    ultimo.current = { dx: 0, dy: 0 }
    setDx(0)
    setDy(0)
    setArrastando(false)
  }

  function onPointerUp() {
    if (!ativo || !inicio.current) return
    const veredito = passouLimiar(ultimo.current.dx, ultimo.current.dy, tamanho.current.largura, tamanho.current.altura)
    reiniciar()
    if (veredito) onResposta(veredito)
  }

  // Gesto cancelado (rolagem do sistema, ligação, perda da captura) nunca responde: o cartão volta.
  function onPointerCancel() {
    if (!inicio.current) return
    reiniciar()
  }

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    dx,
    dy,
    arrastando,
    selo: arrastando ? vereditoDaDirecao(direcaoDominante(dx, dy)) : null,
  }
}
