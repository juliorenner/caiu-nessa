type Casa = 'pendente' | 'atual' | 'acerto' | 'erro'

// Estados legíveis sem cor: branco, borda grossa (papel no claro, fundo escuro no escuro), tinta cheia, hachura.
// A atual não usa o preenchimento do acerto em nenhum tema; só ela tem a borda grossa.
const CLASSE_CASA: Record<Casa, string> = {
  pendente: 'bg-superficie border-2',
  atual: 'bg-papel border-[3px] border-tinta dark:bg-fundo-escuro dark:border-papel motion-safe:animate-pulse',
  acerto: 'bg-tinta dark:bg-papel border-2',
  erro: 'bg-superficie bg-[repeating-linear-gradient(135deg,var(--color-tinta)_0_2px,transparent_2px_5px)] border-2',
}

// Uma casa por afirmação; `atual` é o índice (0-based) da afirmação em jogo.
export function CarimbosDeProgresso({
  total,
  atual,
  estados,
  className = '',
}: {
  total: number
  atual: number
  estados: ('acerto' | 'erro' | null)[]
  className?: string
}) {
  return (
    <div
      role="progressbar"
      aria-label="Progresso"
      aria-valuenow={atual + 1}
      aria-valuemin={0}
      aria-valuemax={total}
      className={`grid gap-1 ${className}`}
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => {
        const casa: Casa = estados[i] ?? (i === atual ? 'atual' : 'pendente')
        return (
          <span
            key={i}
            data-casa={casa}
            aria-hidden
            className={`h-2.5 border-tinta dark:border-papel ${CLASSE_CASA[casa]}`}
          />
        )
      })}
    </div>
  )
}
