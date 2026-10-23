import Link from 'next/link'
import { BotaoSom } from '@/components/BotaoSom'
import { Carimbo } from '@/components/Carimbo'
import { Ficha } from '@/components/Ficha'
import { FocoNoComecar } from '@/components/FocoNoComecar'
import { Congresso } from '@/components/icones/Congresso'
import { MarcaDagua } from '@/components/MarcaDagua'
import { PreviaDoCartao } from '@/components/PreviaDoCartao'
import { BOTAO_PRIMARIO, LINK_PAGINA, SUPERFICIE, TEXTO_SECUNDARIO } from '@/components/rotulos'
import { Tecla } from '@/components/Tecla'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'

const DICA = `font-letreiro text-[11px] leading-[1.9] text-center lg:hidden ${TEXTO_SECUNDARIO}`
const LINK_COMO_ESCOLHEMOS = `text-base ${LINK_PAGINA}`

export default function Home() {
  return (
    <>
      <MarcaDagua posicao="rodape">
        <Congresso className="w-full" />
      </MarcaDagua>
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col justify-center gap-5 px-4 py-8 lg:grid lg:max-w-6xl lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-16">
        <div className="flex flex-col gap-5">
          <Ficha esquerda="Caiu Nessa?" direita="Insira a ficha" className="lg:max-w-[420px]" />
          <div className={`${SUPERFICIE} flex flex-col items-center gap-3 px-5 py-6`}>
            <Carimbo tamanho={72} />
            <h1 className="font-letreiro-sombra text-center text-[clamp(32px,9vw,40px)] lg:text-[76px] lg:leading-[0.95]">
              Caiu Nessa?
            </h1>
            <p className="text-center text-[17px] leading-relaxed text-secundario lg:max-w-[30ch] lg:text-[21px]">
              {TOTAL_AFIRMACOES} afirmações sobre a eleição. Você diz se é verdade, mentira ou se isso cheira mal. No fim, descobre em
              quantas caiu.
            </p>
          </div>
          <div className="lg:flex lg:items-center lg:gap-5">
            <Link id="comecar" href="/quiz" className={`${BOTAO_PRIMARIO} lg:w-[260px] lg:shrink-0 lg:gap-3`}>
              Começar
              {/* No escuro o botão é papel: a tecla vira tinta. */}
              <Tecla cor="papel" className="hidden lg:inline-flex dark:text-tinta">
                Enter
              </Tecla>
            </Link>
            <Link href="/como-escolhemos" className={`hidden lg:inline lg:min-w-0 ${LINK_COMO_ESCOLHEMOS}`}>
              Como escolhemos as afirmações
            </Link>
          </div>
          <div aria-hidden>
            <p className={DICA}>← Mentira · ↑ Cheira mal · Verdade →</p>
            <p className={DICA}>Arraste o cartão ou toque</p>
          </div>
          <p
            aria-hidden
            className={`hidden lg:flex lg:flex-wrap lg:items-center lg:gap-x-[18px] lg:gap-y-2 font-letreiro text-[12px] ${TEXTO_SECUNDARIO}`}
          >
            <span className="flex items-center gap-2">
              <Tecla cor="mentira" className="inline-flex dark:text-mentira-claro">
                ←
              </Tecla>
              Mentira
            </span>
            <span className="flex items-center gap-2">
              <Tecla cor="cheira" className="inline-flex dark:text-cheira-claro">
                ↑
              </Tecla>
              Cheira mal
            </span>
            <span className="flex items-center gap-2">
              <Tecla cor="verdade" className="inline-flex dark:text-verdade-claro">
                →
              </Tecla>
              Verdade
            </span>
            <span className="font-sans text-sm">ou arraste com o mouse</span>
          </p>
          <BotaoSom />
          <p className="sr-only">Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.</p>
          <Link href="/como-escolhemos" className={`self-center lg:hidden ${LINK_COMO_ESCOLHEMOS}`}>
            Como escolhemos as afirmações
          </Link>
        </div>
        <PreviaDoCartao />
        <FocoNoComecar alvoId="comecar" />
      </main>
    </>
  )
}
