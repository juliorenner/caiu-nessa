import type { ReactElement } from 'react'
import { Traco } from './Traco'

// Congresso Nacional: plataforma larga, torres gêmeas ligadas por uma passarela, cúpula à esquerda e concha à direita.
export function Congresso({ className }: { className?: string }): ReactElement {
  return (
    <Traco className={className}>
      <rect x={2} y={50} width={60} height={6} />
      <rect x={23} y={6} width={6} height={44} />
      <rect x={35} y={6} width={6} height={44} />
      <path d="M29 26h6M29 30h6" />
      <path d="M5 50a7 7 0 0 1 14 0" />
      <path d="M45 41h16a8 8 0 0 1-16 0" />
    </Traco>
  )
}
