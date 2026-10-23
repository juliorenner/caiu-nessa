import type { ReactElement, ReactNode } from 'react'

const POSICAO = {
  rodape: 'bottom-0 left-1/2 -translate-x-1/2 w-[min(90vw,480px)]',
  canto: 'right-2 bottom-2 w-[220px]',
} as const

// Desenho decorativo atrás do conteúdo: fixo na viewport, quase transparente, sem toque e fora da árvore acessível.
// O conteúdo da página fica por cima com `relative z-10`.
export function MarcaDagua({ children, posicao }: { children: ReactNode; posicao: keyof typeof POSICAO }): ReactElement {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed z-0 text-tinta opacity-[0.07] dark:text-papel dark:opacity-[0.12] ${POSICAO[posicao]}`}
    >
      {children}
    </div>
  )
}
