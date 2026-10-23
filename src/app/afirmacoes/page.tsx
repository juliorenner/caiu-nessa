import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  LINK_EM_CARTAO,
  LINK_PAGINA,
  ROTULO_VEREDITO,
  SELO_VEREDITO,
  SUPERFICIE_LISTA,
  TITULO_LETREIRO,
} from '@/components/rotulos'
import { type Afirmacao, carregarPool, foraDoJogo, jogaveis } from '@/lib/afirmacoes'
import { formatarData } from '@/lib/datas'
import { COMPOSICAO_EXTRA, TOTAL_AFIRMACOES, tamanhoDa } from '@/lib/rodadas'

export const metadata: Metadata = { title: 'As afirmações do jogo · Caiu Nessa?' }

function CartaoAfirmacao({ afirmacao: a }: { afirmacao: Afirmacao }) {
  return (
    <article className={`flex flex-col gap-3 p-5 ${SUPERFICIE_LISTA}`}>
      <p className="text-[17px] leading-relaxed font-bold text-tinta">{a.texto}</p>
      <p className="text-base text-secundario">Quem disse: {a.autor}</p>
      <blockquote className="border-l-4 border-secundario pl-3 text-base text-secundario italic">“{a.citacao}”</blockquote>
      <span className={SELO_VEREDITO[a.veredito]}>{ROTULO_VEREDITO[a.veredito]}</span>
      {a.observacao && <p className="text-base text-secundario">{a.observacao}</p>}
      <p className="text-[17px] leading-relaxed text-tinta">{a.explicacao}</p>
      <a href={a.fonte_url} target="_blank" rel="noopener noreferrer" className={`self-start ${LINK_EM_CARTAO}`}>
        Ver a checagem ({a.fonte_nome}, {formatarData(a.data_checagem)})
      </a>
    </article>
  )
}

function ListaDeCartoes({ afirmacoes }: { afirmacoes: Afirmacao[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4">
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
      <h2 id={id} className={`${TITULO_LETREIRO} text-lg`}>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function GrupoPorLado({ id, titulo, afirmacoes }: { id: string; titulo: string; afirmacoes: Afirmacao[] }) {
  return (
    <section aria-labelledby={id} className="mt-6">
      <h3 id={id} className={`${TITULO_LETREIRO} text-base`}>
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
    <main className="mx-auto w-full max-w-2xl flex-1 lg:max-w-5xl px-4 py-10 text-[17px] leading-relaxed text-tinta dark:text-papel">
      <Link href="/" className={LINK_PAGINA}>
        Caiu Nessa?
      </Link>
      <h1 className={`mt-6 ${TITULO_LETREIRO} text-[28px]`}>As afirmações do jogo</h1>
      <p className="mt-4">
        Cada rodada é sorteada deste conjunto: a primeira tem {TOTAL_AFIRMACOES} afirmações, as seguintes{' '}
        {tamanhoDa(COMPOSICAO_EXTRA)}, sempre com o mesmo número de cada lado e o mesmo perfil de vereditos nos dois lados.
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
