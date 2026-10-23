import type { ReactElement } from 'react'
import { Traco } from './Traco'

// Título de eleitor: cartão horizontal de cantos retos, foto quadrada à esquerda e três linhas de texto à direita.
export function TituloEleitor({ className }: { className?: string }): ReactElement {
  return (
    <Traco className={className}>
      <rect x={4} y={14} width={56} height={36} />
      <rect x={10} y={24} width={16} height={16} />
      <path d="M32 24h22M32 32h22M32 40h14" />
    </Traco>
  )
}
