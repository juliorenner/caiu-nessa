import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SUPERFICIE, LINK_EM_CARTAO, LINK_PAGINA, ROTULO_VEREDITO, SELO_VEREDITO } from '@/components/rotulos'
import { type Afirmacao, carregarPool, foraDoJogo, jogaveis } from '@/lib/afirmacoes'

export const metadata: Metadata = { title: 'As afirmações do jogo · Caiu Nessa?' }

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

function CartaoAfirmacao({ afirmacao: a }: { afirmacao: Afirmacao }) {
  return (
    <article className={`flex flex-col gap-3 rounded-2xl p-5 ${SUPERFICIE}`}>
      <p className="text-lg font-semibold text-stone-900">{a.texto}</p>
      <p className="text-base text-stone-600">Quem disse: {a.autor}</p>
      <blockquote className="border-l-4 border-stone-200 pl-3 text-base text-stone-600 italic">“{a.citacao}”</blockquote>
      <span className={SELO_VEREDITO[a.veredito]}>{ROTULO_VEREDITO[a.veredito]}</span>
      {a.observacao && <p className="text-base text-stone-600">{a.observacao}</p>}
      <p className="text-base text-stone-700">{a.explicacao}</p>
      <a href={a.fonte_url} target="_blank" rel="noopener noreferrer" className={`self-start ${LINK_EM_CARTAO}`}>
        Ver a checagem ({a.fonte_nome}, {formatarData(a.data_checagem)})
      </a>
    </article>
  )
}

function ListaDeCartoes({ afirmacoes }: { afirmacoes: Afirmacao[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-4">
      {afirmacoes.map((a) => (
        <li key={a.id}>
          <CartaoAfirmacao afirmacao={a} />
        </li>
      ))}
    </ul>
  )
}

function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-2xl font-bold text-stone-900 dark:text-stone-100">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function GrupoPorLado({ id, titulo, afirmacoes }: { id: string; titulo: string; afirmacoes: Afirmacao[] }) {
  return (
    <section aria-labelledby={id} className="mt-6">
      <h3 id={id} className="text-xl font-semibold text-stone-900 dark:text-stone-100">
        {titulo}
      </h3>
      <ListaDeCartoes afirmacoes={afirmacoes} />
    </section>
  )
}

export default function Afirmacoes() {
  const pool = carregarPool()
  const noJogo = jogaveis(pool)
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-base leading-relaxed text-stone-800 dark:text-stone-200">
      <Link href="/" className={LINK_PAGINA}>
        Caiu Nessa?
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-stone-900 dark:text-stone-100">As afirmações do jogo</h1>
      <p className="mt-4">
        Cada rodada é sorteada deste conjunto: a primeira tem 12 afirmações, as seguintes 6, sempre com o mesmo número
        de cada lado e de cada veredito.
      </p>

      <Secao id="no-jogo" titulo="No jogo">
        <GrupoPorLado
          id="no-jogo-esquerda"
          titulo="Ditas ou espalhadas pela esquerda"
          afirmacoes={noJogo.filter((a) => a.lado === 'esquerda')}
        />
        <GrupoPorLado
          id="no-jogo-direita"
          titulo="Ditas ou espalhadas pela direita"
          afirmacoes={noJogo.filter((a) => a.lado === 'direita')}
        />
      </Secao>
      <Secao id="fora-do-jogo" titulo="Fora do jogo">
        <ListaDeCartoes afirmacoes={foraDoJogo(pool)} />
      </Secao>
    </main>
  )
}
