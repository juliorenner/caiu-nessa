import Link from 'next/link'
import { BOTAO_PRIMARIO, FOCO } from '@/components/rotulos'

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-12">
      <h1 className="text-5xl font-extrabold tracking-tight">Caiu Nessa?</h1>
      <p className="text-xl leading-relaxed text-stone-700">
        12 afirmações sobre a eleição. Você diz se é verdade, mentira ou se isso cheira mal. No fim, descobre em
        quantas caiu.
      </p>
      <Link href="/quiz" className={BOTAO_PRIMARIO}>
        Começar
      </Link>
      <Link
        href="/como-escolhemos"
        className={`self-center rounded text-base font-medium underline underline-offset-4 ${FOCO}`}
      >
        Como escolhemos as afirmações
      </Link>
    </main>
  )
}
