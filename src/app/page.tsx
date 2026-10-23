import Link from 'next/link'
import { BotaoSom } from '@/components/BotaoSom'
import { Carimbo } from '@/components/Carimbo'
import { Ficha } from '@/components/Ficha'
import { Congresso } from '@/components/icones/Congresso'
import { MarcaDagua } from '@/components/MarcaDagua'
import { BOTAO_PRIMARIO, LINK_PAGINA, SUPERFICIE, TEXTO_SECUNDARIO } from '@/components/rotulos'

const DICA = `font-letreiro text-[11px] leading-[1.9] text-center ${TEXTO_SECUNDARIO}`

export default function Home() {
  return (
    <>
      <MarcaDagua posicao="rodape">
        <Congresso className="w-full" />
      </MarcaDagua>
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col justify-center gap-5 px-4 py-8">
        <Ficha esquerda="Caiu Nessa?" direita="Insira a ficha" />
        <div className={`${SUPERFICIE} flex flex-col items-center gap-3 px-5 py-6`}>
          <Carimbo tamanho={72} />
          <h1 className="font-letreiro-sombra text-center text-[clamp(32px,9vw,40px)]">Caiu Nessa?</h1>
          <p className="text-center text-[17px] leading-relaxed text-secundario">
            12 afirmações sobre a eleição. Você diz se é verdade, mentira ou se isso cheira mal. No fim, descobre em
            quantas caiu.
          </p>
        </div>
        <Link href="/quiz" className={BOTAO_PRIMARIO}>
          Começar
        </Link>
        <div aria-hidden>
          <p className={DICA}>← Mentira · ↑ Cheira mal · Verdade →</p>
          <p className={DICA}>Arraste o cartão ou toque</p>
        </div>
        <BotaoSom />
        <p className="sr-only">Arraste o cartão: direita é verdade, esquerda é mentira, para cima se cheira mal.</p>
        <Link href="/como-escolhemos" className={`self-center text-base ${LINK_PAGINA}`}>
          Como escolhemos as afirmações
        </Link>
      </main>
    </>
  )
}
