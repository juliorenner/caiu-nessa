import type { ReactNode } from 'react'
import { TECLA_BASE } from './rotulos'

type CorTecla = 'tinta' | 'papel' | 'verdade' | 'mentira' | 'cheira'

const COR: Record<CorTecla, string> = {
  tinta: 'text-tinta',
  papel: 'text-papel',
  verdade: 'text-verdade',
  mentira: 'text-mentira',
  cheira: 'text-cheira',
}

// Tecla decorativa (o nome acessível vem do controle). Só aparece em lg por padrão;
// `className` substitui essa visibilidade (ex.: "inline-flex" para sempre visível).
export function Tecla({
  children,
  cor = 'tinta',
  className = 'hidden lg:inline-flex',
}: {
  children: ReactNode
  cor?: CorTecla
  className?: string
}) {
  return (
    <kbd aria-hidden className={`${TECLA_BASE} ${COR[cor]} ${className}`}>
      {children}
    </kbd>
  )
}
