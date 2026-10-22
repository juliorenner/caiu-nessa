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
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-stone-900 dark:focus-visible:outline-stone-100'

export const BOTAO_PRIMARIO = `flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-5 py-3 text-lg font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300 ${FOCO}`

// Temas Carimbo (claro) e Noite (escuro). As cores ficam em globals.css (@theme).
export const FUNDO_PAGINA = 'bg-fundo text-stone-900 dark:bg-fundo-escuro dark:text-stone-100'

// O cartão é claro nos dois temas (no Noite ele "salta" do fundo escuro), então o texto dele é sempre escuro.
export const CARTAO_SUPERFICIE = 'bg-superficie text-stone-900 shadow-sm ring-1 ring-stone-200 dark:bg-superficie-escura dark:ring-0'

// Link dentro de um cartão (claro nos dois temas): texto e anel de foco sempre escuros.
export const LINK_EM_CARTAO =
  'rounded font-medium text-stone-900 underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-stone-900'

// Texto secundário sobre o fundo da página.
export const TEXTO_SECUNDARIO = 'text-stone-700 dark:text-stone-300'

export const ROTULO_BOTAO: Record<Veredito, string> = {
  verdadeiro: 'VERDADE',
  falso: 'MENTIRA',
  enganoso: 'ISSO ME CHEIRA MAL 🤔',
}

// Botões de resposta. Claro: cheios; escuro: só borda e texto na cor do veredito.
// `destaque` substitui `base` no botão escolhido (cheio nos dois temas, com anel);
// `esmaecido` soma-se a `base` nos outros dois.
export const BOTAO_RESPOSTA: Record<Veredito, { base: string; destaque: string; esmaecido: string }> = {
  verdadeiro: {
    base: 'border-2 border-transparent bg-emerald-700 text-white dark:bg-transparent dark:border-2 dark:border-emerald-400 dark:text-emerald-300',
    destaque:
      'border-2 border-transparent bg-emerald-700 text-white ring-4 ring-emerald-700/40 dark:ring-emerald-300',
    esmaecido: 'opacity-40',
  },
  falso: {
    base: 'border-2 border-transparent bg-rose-700 text-white dark:bg-transparent dark:border-2 dark:border-rose-400 dark:text-rose-300',
    destaque: 'border-2 border-transparent bg-rose-700 text-white ring-4 ring-rose-700/40 dark:ring-rose-300',
    esmaecido: 'opacity-40',
  },
  enganoso: {
    base: 'border-2 border-transparent bg-amber-500 text-stone-900 dark:bg-transparent dark:border-2 dark:border-amber-400 dark:text-amber-300',
    destaque: 'border-2 border-transparent bg-amber-500 text-stone-900 ring-4 ring-amber-600/50 dark:ring-amber-300',
    esmaecido: 'opacity-40',
  },
}

// Carimbo do cartão (borda + texto). O cartão é claro nos dois temas, então a cor é a mesma:
// os tons -400 dariam menos de 3:1 sobre #fdfcf9 e o amber-600 só 3,2:1.
export const COR_SELO_CARTAO: Record<Veredito, string> = {
  verdadeiro: 'border-emerald-700 text-emerald-700',
  falso: 'border-rose-700 text-rose-700',
  enganoso: 'border-amber-700 text-amber-700',
}
