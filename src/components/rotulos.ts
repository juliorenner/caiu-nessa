import type { Veredito } from '@/lib/afirmacoes'

export const ROTULO_VEREDITO: Record<Veredito, string> = {
  verdadeiro: 'Verdade',
  falso: 'Mentira',
  enganoso: 'Enganoso',
}

const COR_SELO: Record<Veredito, string> = {
  verdadeiro: 'bg-emerald-100 text-emerald-900 ring-emerald-700',
  falso: 'bg-rose-100 text-rose-900 ring-rose-700',
  enganoso: 'bg-amber-100 text-amber-900 ring-amber-700',
}

// Selo do veredito: o mesmo no feedback do jogo e na página /afirmacoes.
export const SELO_VEREDITO = Object.fromEntries(
  Object.entries(COR_SELO).map(([v, cor]) => [v, `self-start rounded-full px-3 py-1 text-base font-bold ring-1 ${cor}`]),
) as Record<Veredito, string>

export const FOCO =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

export const BOTAO_PRIMARIO = `flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-lg font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60 ${FOCO}`
