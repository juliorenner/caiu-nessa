import type { ReactElement } from 'react'
import type { Veredito } from '@/lib/afirmacoes'

// Traços do ícone de cada botão: X (mentira), gancho de interrogação (cheira mal), visto (verdade).
const TRACOS: Record<Veredito, string[]> = {
  falso: ['M5 5l14 14', 'M19 5L5 19'],
  enganoso: ['M8 9a4 4 0 1 1 6 3.5c-1.5.9-2 1.5-2 3', 'M12 19v.5'],
  verdadeiro: ['M4 12l5 5L20 6'],
}

export function IconeVeredito({ veredito, className = '' }: { veredito: Veredito; className?: string }): ReactElement {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3.5}
      strokeLinecap="square"
      className={`h-[22px] w-[22px] ${className}`}
    >
      {TRACOS[veredito].map(d => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
