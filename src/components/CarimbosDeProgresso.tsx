type Casa = 'pendente' | 'atual' | 'acerto' | 'erro'

// Estados legíveis sem cor: branco, papel com borda grossa, tinta cheia, hachura.
const CLASSE_CASA: Record<Casa, string> = {
  pendente: 'bg-superficie',
  atual: 'bg-papel border-[3px] motion-safe:animate-pulse',
  acerto: 'bg-tinta dark:bg-papel',
  erro: 'bg-superficie bg-[repeating-linear-gradient(135deg,var(--color-tinta)_0_2px,transparent_2px_5px)]',
}

// Uma casa por afirmação; `atual` é o índice (0-based) da afirmação em jogo.
export function CarimbosDeProgresso({
  total,
  atual,
  estados,
}: {
  total: number
  atual: number
  estados: ('acerto' | 'erro' | null)[]
}) {
  return (
    <div
      role="progressbar"
      aria-label="Progresso"
      aria-valuenow={atual + 1}
      aria-valuemin={0}
      aria-valuemax={total}
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => {
        const casa: Casa = estados[i] ?? (i === atual ? 'atual' : 'pendente')
        return (
          <span
            key={i}
            data-casa={casa}
            aria-hidden
            className={`h-2.5 border-2 border-tinta dark:border-papel ${CLASSE_CASA[casa]}`}
          />
        )
      })}
    </div>
  )
}
