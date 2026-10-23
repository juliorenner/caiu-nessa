import type { ReactElement } from 'react'
import { Traco } from './Traco'

// Microfone de debate: cápsula vertical com duas linhas de grade, haste e base reta.
export function Microfone({ className }: { className?: string }): ReactElement {
  return (
    <Traco className={className}>
      <path d="M24 16a8 8 0 0 1 16 0v16a8 8 0 0 1-16 0z" />
      <path d="M26 20h12M26 27h12" />
      <path d="M32 40v14" />
      <path d="M20 56h24" />
    </Traco>
  )
}
