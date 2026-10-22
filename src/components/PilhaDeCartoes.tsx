'use client'

import type { ReactElement } from 'react'
import type { Veredito } from '@/lib/afirmacoes'
import { CARTAO_BASE, CartaoAfirmacao, type FaseCartao } from './CartaoAfirmacao'
import type { AfirmacaoNoQuiz } from './tipos'

export function PilhaDeCartoes({
  atual,
  proxima,
  fase,
  respostaDada,
  onResposta,
  reduzirMovimento,
}: {
  atual: AfirmacaoNoQuiz
  proxima: AfirmacaoNoQuiz | null
  fase: FaseCartao
  respostaDada: Veredito | null
  onResposta: (v: Veredito) => void
  reduzirMovimento: boolean
}): ReactElement {
  return (
    <div className="relative">
      {/* O próximo cartão aparece atrás, sem texto: só a pilha, não a próxima pergunta. */}
      {proxima && (
        <div data-verso aria-hidden className={`pointer-events-none absolute inset-0 scale-95 opacity-60 ${CARTAO_BASE}`} />
      )}
      <div className="relative z-10">
        <CartaoAfirmacao
          key={atual.id}
          afirmacao={atual}
          fase={fase}
          respostaDada={respostaDada}
          onResposta={onResposta}
          reduzirMovimento={reduzirMovimento}
        />
      </div>
    </div>
  )
}
