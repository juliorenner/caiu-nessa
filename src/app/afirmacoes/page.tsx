import type { Metadata } from 'next'
import Link from 'next/link'
import { FOCO, ROTULO_VEREDITO, SELO_VEREDITO } from '@/components/rotulos'
import { type Afirmacao, carregarAfirmacoes, carregarReserva } from '@/lib/afirmacoes'

export const metadata: Metadata = { title: 'As afirmações do jogo · Caiu Nessa?' }

const LINK = `rounded font-medium text-stone-900 underline underline-offset-4 ${FOCO}`

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function CartaoAfirmacao({ afirmacao: a }: { afirmacao: Afirmacao }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <p className="text-lg font-semibold text-stone-900">{a.texto}</p>
      <p className="text-base text-stone-600">Quem disse: {a.autor}</p>
      <span className={SELO_VEREDITO[a.veredito]}>{ROTULO_VEREDITO[a.veredito]}</span>
      <p className="text-base text-stone-700">{a.explicacao}</p>
      <a href={a.fonte_url} target="_blank" rel="noopener noreferrer" className={`self-start ${LINK}`}>
        Ver a checagem ({a.fonte_nome}, {formatarData(a.data_checagem)})
      </a>
    </article>
  )
}

function Secao({ id, titulo, afirmacoes }: { id: string; titulo: string; afirmacoes: Afirmacao[] }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-2xl font-bold text-stone-900">
        {titulo}
      </h2>
      <ul className="mt-4 flex flex-col gap-4">
        {afirmacoes.map((a) => (
          <li key={a.id}>
            <CartaoAfirmacao afirmacao={a} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function Afirmacoes() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-base leading-relaxed text-stone-800">
      <Link href="/" className={LINK}>
        Caiu Nessa?
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-stone-900">As afirmações do jogo</h1>
      <p className="mt-4">
        Estas são todas as afirmações que já checamos: as 12 em jogo agora e as que estão na reserva para rodadas
        futuras. Cada uma traz o veredito da agência que a checou e o link da checagem.
      </p>

      <Secao id="em-jogo" titulo="Em jogo agora" afirmacoes={carregarAfirmacoes()} />
      <Secao id="reserva" titulo="Na reserva" afirmacoes={carregarReserva()} />
    </main>
  )
}
