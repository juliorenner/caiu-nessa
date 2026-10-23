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
// O terceiro botão confunde quem chega: define o termo antes da primeira ficha.
const DEFINICAO_CHEIRA_MAL = 'Cheira mal = verdade pela metade: exagero, falta de contexto ou número torto'
const REPOSITORIO = 'https://github.com/juliorenner/caiu-nessa'
// Marca do GitHub (Octicons, MIT) ao lado do texto, como os sites costumam linkar o código.
const MARCA_GITHUB =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'

function LinkDoRepositorio({ className }: { className: string }) {
  return (
    <a href={REPOSITORIO} className={`inline-flex items-center gap-2 ${LINK_COMO_ESCOLHEMOS} ${className}`}>
      <svg aria-hidden viewBox="0 0 16 16" width="20" height="20" fill="currentColor" className="shrink-0">
        <path d={MARCA_GITHUB} />
      </svg>
      Código aberto
    </a>
  )
}

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
            <span className="hidden lg:flex lg:min-w-0 lg:flex-col lg:gap-1">
              <Link href="/como-escolhemos" className={LINK_COMO_ESCOLHEMOS}>
                Como escolhemos as afirmações
              </Link>
              <LinkDoRepositorio className="self-start" />
            </span>
          </div>
          <div aria-hidden>
            <p className={DICA}>← Mentira · ↑ Cheira mal · Verdade →</p>
            <p className={DICA}>Arraste o cartão ou toque</p>
          </div>
          <p className={DICA}>{DEFINICAO_CHEIRA_MAL}</p>
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
          <p className={`hidden lg:block font-sans text-sm ${TEXTO_SECUNDARIO}`}>{DEFINICAO_CHEIRA_MAL}</p>
          <BotaoSom />
          <p className="sr-only">Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.</p>
          <Link href="/como-escolhemos" className={`self-center lg:hidden ${LINK_COMO_ESCOLHEMOS}`}>
            Como escolhemos as afirmações
          </Link>
          <LinkDoRepositorio className="self-center lg:hidden" />
        </div>
        <PreviaDoCartao />
        <FocoNoComecar alvoId="comecar" />
      </main>
    </>
  )
}
