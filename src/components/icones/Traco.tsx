import type { ReactElement, ReactNode } from 'react'

// Moldura comum dos ícones de 64×64: traço de tinta grosso, quadrado, sem preenchimento.
export function Traco({ className, children }: { className?: string; children: ReactNode }): ReactElement {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      {children}
    </svg>
  )
}
