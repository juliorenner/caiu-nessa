import Link from 'next/link'
import { FOCO_EM_SUPERFICIE } from './rotulos'

const ITEM = `flex min-h-[52px] items-center gap-3 border-t-2 border-dashed border-tinta py-2 text-base leading-snug font-bold text-tinta no-underline ${FOCO_EM_SUPERFICIE}`
const ICONE =
  'flex size-7 shrink-0 items-center justify-center rounded-[5px] border-2 border-tinta bg-superficie font-letreiro text-[15px]'

// Painel de papel (nos dois temas, como a ficha) com as duas formas de ajudar: sugerir uma afirmação que
// falta e reportar um problema. O mesmo na home e no fim de jogo. `duasColunas` em lg (home no desktop).
export function PainelDeMelhoria({ duasColunas = false }: { duasColunas?: boolean }) {
  return (
    <nav
      aria-labelledby="nos-ajude"
      className={`border-[3px] border-tinta bg-papel px-4 pt-3 pb-1 text-left text-tinta shadow-[4px_4px_0_var(--color-tinta)] dark:border-papel dark:shadow-[4px_4px_0_var(--color-papel)] ${
        duasColunas ? 'lg:grid lg:grid-cols-2 lg:gap-x-6' : ''
      }`}
    >
      <p id="nos-ajude" className="pb-1.5 font-letreiro text-[13px] lg:col-span-2">
        Nos ajude a melhorar
      </p>
      <Link href="/sugerir" className={ITEM}>
        <span aria-hidden className={ICONE}>
          +
        </span>
        <span className="flex-1">Sugerir uma afirmação que está faltando</span>
        <span aria-hidden className="font-letreiro">
          →
        </span>
      </Link>
      <Link href="/relatar" className={ITEM}>
        <span aria-hidden className={ICONE}>
          !
        </span>
        <span className="flex-1">Teve algum problema? Reporte aqui</span>
        <span aria-hidden className="font-letreiro">
          →
        </span>
      </Link>
    </nav>
  )
}
