import type { ReactElement } from 'react'
import { Traco } from './Traco'

// Busto de perfil, do ombro para cima: contorno da cabeça (sem rosto), pescoço, paletó com gola em V e lapela, nó de gravata.
export function Politico({ className }: { className?: string }): ReactElement {
  return (
    <Traco className={className}>
      <path d="M25 40v-7C18 26 18 10 31 7c8-2 13 3 13 10l4 7l-3 2v4c0 3-3 5-8 5" />
      <path d="M37 35v5" />
      <path d="M4 60c1-12 8-18 18-20h18c10 2 17 8 18 20" />
      <path d="M22 40l9 18l9-18" />
      <path d="M24 44l-5 3l9 9" />
      <rect x={29} y={43} width={4} height={2} />
      <path d="M31 47v5" />
    </Traco>
  )
}
