import type { ReactNode } from 'react'
import { FICHA } from './rotulos'

// Furo da ficha: círculo na cor do fundo da página, metade para fora da borda.
const FURO =
  'absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-[3px] border-tinta bg-fundo dark:border-papel dark:bg-fundo-escuro'

// Faixa de papel com dois furos nas laterais: rótulo em letreiro à esquerda, detalhe à direita.
export function Ficha({
  esquerda,
  direita,
  className = '',
}: {
  esquerda: ReactNode
  direita?: ReactNode
  className?: string
}) {
  return (
    <div data-ficha className={`${FICHA} flex items-center justify-between gap-3 px-6 py-2 ${className}`}>
      <span aria-hidden className={`${FURO} -left-1.5`} />
      <span className="font-letreiro text-[13px]">{esquerda}</span>
      {direita !== undefined && <span className="text-[11px] font-bold tracking-[0.08em] uppercase">{direita}</span>}
      <span aria-hidden className={`${FURO} -right-1.5`} />
    </div>
  )
}
