import type { Veredito } from '@/lib/afirmacoes'

export const ROTULO_VEREDITO: Record<Veredito, string> = {
  verdadeiro: 'Verdade',
  falso: 'Mentira',
  enganoso: 'Enganoso',
}

export const FOCO =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

export const BOTAO_PRIMARIO = `flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-lg font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60 ${FOCO}`
