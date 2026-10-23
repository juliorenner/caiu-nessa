import type { ReactElement } from 'react'
import { Traco } from './Traco'

// Jornal dobrado: folha de trás aparecendo no alto e à direita, folha da frente com manchete grossa e três linhas.
// A manchete é um retângulo mais baixo que o traço: vira uma barra cheia.
export function Jornal({ className }: { className?: string }): ReactElement {
  return (
    <Traco className={className}>
      <path d="M14 14V8h44v44h-8" />
      <rect x={6} y={14} width={44} height={44} />
      <rect x={12} y={21} width={32} height={3} />
      <path d="M12 34h32M12 42h32M12 50h22" />
    </Traco>
  )
}
