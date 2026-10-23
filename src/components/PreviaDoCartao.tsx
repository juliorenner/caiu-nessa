import type { Veredito } from '@/lib/afirmacoes'
import { IconeVeredito } from './IconeVeredito'
import { BOTAO_RESPOSTA, CARIMBO_CARTAO, ROTULO_BOTAO, SUPERFICIE } from './rotulos'

// Mesma ordem dos botões do Quiz.
const ORDEM: Veredito[] = ['falso', 'enganoso', 'verdadeiro']

// Prévia decorativa da home em telas largas: um cartão de exemplo (não é afirmação do jogo) e os botões desenhados.
export function PreviaDoCartao() {
  return (
    <div aria-hidden className="hidden lg:block">
      <div className="relative">
        <div className={`${SUPERFICIE} absolute inset-0 rotate-[4deg] opacity-60`} />
        <div className={`${SUPERFICIE} relative flex min-h-[340px] -rotate-3 flex-col justify-between gap-4 p-8`}>
          <span className="font-letreiro text-[90px] leading-none text-papel">?</span>
          <p className="text-[28px] leading-tight font-bold text-balance">Ninguém cai em fake news.</p>
          <span className={`${CARIMBO_CARTAO.enganoso} absolute top-6 right-6`}>{ROTULO_BOTAO.enganoso}</span>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-3">
        {ORDEM.map((v) => (
          <span
            key={v}
            className={`flex min-h-14 flex-col items-center justify-center gap-2 px-1 py-2 text-[11px] leading-tight ${BOTAO_RESPOSTA[v].base}`}
          >
            <IconeVeredito veredito={v} />
            {ROTULO_BOTAO[v]}
          </span>
        ))}
      </div>
    </div>
  )
}
