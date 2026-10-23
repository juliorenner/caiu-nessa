import type { Casa } from '@/lib/cartao'

// Mesmos estados dos carimbos de progresso: tinta cheia (acerto), hachura (erro); quase leva um `?`.
const CLASSE_CASA: Record<Casa, string> = {
  acerto: 'bg-tinta dark:bg-papel',
  erro: 'bg-superficie bg-[repeating-linear-gradient(135deg,var(--color-tinta)_0_2px,transparent_2px_5px)]',
  quase: 'bg-superficie font-letreiro text-[15px] leading-none text-tinta',
}

// Uma casa por afirmação, na ordem jogada; 6 por linha.
export function GradeDeCasas({ casas }: { casas: Casa[] }) {
  return (
    <ul aria-label="Acertos e erros na ordem jogada" className="mx-auto flex max-w-[196px] flex-wrap justify-center gap-1">
      {casas.map((casa, i) => (
        <li
          key={i}
          data-casa={casa}
          className={`flex size-7 items-center justify-center border-2 border-tinta dark:border-papel ${CLASSE_CASA[casa]}`}
        >
          {casa === 'quase' && <span aria-hidden>?</span>}
          <span className="sr-only">{casa}</span>
        </li>
      ))}
    </ul>
  )
}
