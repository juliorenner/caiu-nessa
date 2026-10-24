import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  FOCO,
  LINK_EM_CARTAO,
  LINK_PAGINA,
  ROTULO_VEREDITO,
  SELO_ALCANCE,
  SELO_VEREDITO,
  SUPERFICIE_LISTA,
  TITULO_LETREIRO,
} from '@/components/rotulos'
import { type Afirmacao, carregarPool, foraDoJogo, jogaveis } from '@/lib/afirmacoes'
import { formatarData } from '@/lib/datas'
import { COMPOSICAO_EXTRA, TOTAL_AFIRMACOES, tamanhoDa } from '@/lib/rodadas'

export const metadata: Metadata = { title: 'As afirmações do jogo · Caiu Nessa?' }

type Vista = 'cartoes' | 'tabela'
type Grupo = { id: string; titulo: string; afirmacoes: Afirmacao[] }

function CartaoAfirmacao({ afirmacao: a }: { afirmacao: Afirmacao }) {
  return (
    <article className={`flex h-full flex-col gap-3 p-5 ${SUPERFICIE_LISTA}`}>
      <p className="text-[17px] leading-relaxed font-bold text-tinta">{a.texto}</p>
      <p className="text-base text-secundario">Quem disse: {a.autor}</p>
      <blockquote className="border-l-4 border-secundario pl-3 text-base text-secundario italic">“{a.citacao}”</blockquote>
      <div className="flex flex-wrap items-center gap-3">
        <span className={SELO_VEREDITO[a.veredito]}>{ROTULO_VEREDITO[a.veredito]}</span>
        <span className={SELO_ALCANCE}>{`Alcance ${a.alcance}`}</span>
      </div>
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

// Troca de vista por link (?vista=tabela): sem JavaScript, compartilhável, e o voltar do navegador funciona.
function TrocaDeVista({ vista }: { vista: Vista }) {
  const opcao = (v: Vista, rotulo: string, icone: ReactNode) => (
    <Link
      href={v === 'tabela' ? '/afirmacoes?vista=tabela' : '/afirmacoes'}
      aria-current={vista === v ? 'page' : undefined}
      className={`flex min-h-11 items-center gap-2 px-4 font-letreiro text-sm ${FOCO} ${
        vista === v ? 'bg-tinta text-papel' : 'bg-superficie text-tinta'
      }`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-[2.4]">
        {icone}
      </svg>
      {rotulo}
    </Link>
  )
  return (
    <nav aria-label="Forma de ver as afirmações" className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
      <span aria-hidden className="font-letreiro text-[13px]">
        Ver como
      </span>
      <div className="flex divide-x-[3px] divide-tinta border-[3px] border-tinta shadow-[0_4px_0_var(--color-tinta)] dark:border-papel dark:shadow-[0_4px_0_var(--color-papel)]">
        {opcao('cartoes', 'Cartões', <><rect x="4" y="4" width="16" height="7" /><rect x="4" y="13" width="16" height="7" /></>)}
        {opcao('tabela', 'Tabela', <><rect x="3" y="4" width="18" height="16" /><path d="M3 9h18M9 9v11" /></>)}
      </div>
    </nav>
  )
}

const CELULA = 'lg:border-t-2 lg:border-dashed lg:border-tinta lg:px-3 lg:py-3.5 lg:align-top'

// Uma tabela só: em lg, colunas de verdade; no celular, cada linha vira um registro empilhado
// (afirmação em cima, selo à esquerda, quem disse e a fonte à direita), sem rolagem lateral.
// Abaixo de 420px não há largura para duas colunas: tudo numa só, o selo logo depois da afirmação.
// A coluna do selo cabe o maior ("Enganoso"); as posições de grade não valem em lg, onde a linha é de tabela.
function Tabela({ grupos }: { grupos: Grupo[] }) {
  return (
    <div className={`mt-5 ${SUPERFICIE_LISTA}`}>
      <table className="w-full border-separate border-spacing-0 text-left text-base leading-snug text-tinta">
        <caption className="sr-only">Afirmações do jogo, com quem disse, veredito e a checagem</caption>
        <thead className="max-lg:sr-only">
          <tr>
            {['Afirmação', 'Quem disse', 'Veredito', 'Checagem', 'Data'].map(c => (
              <th key={c} scope="col" className="border-b-[3px] border-tinta bg-papel px-3 py-2.5 font-letreiro text-xs font-normal whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        {grupos.map(g => (
          <tbody key={g.id}>
            <tr className="max-lg:block">
              <th
                scope="colgroup"
                colSpan={5}
                className="border-t-[3px] border-tinta bg-papel px-3 py-2.5 text-left font-letreiro text-xs font-normal max-lg:block"
              >
                {g.titulo}
              </th>
            </tr>
            {g.afirmacoes.map(a => (
              <tr
                key={a.id}
                className="max-lg:grid max-lg:grid-cols-1 min-[420px]:grid-cols-[7.25rem_1fr] max-lg:gap-x-3 max-lg:gap-y-1.5 max-lg:border-t-2 max-lg:border-dashed max-lg:border-tinta max-lg:px-4 max-lg:py-4"
              >
                <td className={`font-bold min-[420px]:col-span-2 lg:w-[36%] ${CELULA}`}>{a.texto}</td>
                <td className={`text-secundario max-lg:row-start-3 min-[420px]:col-start-2 min-[420px]:row-start-2 lg:w-[22%] ${CELULA}`}>
                  <b className="text-tinta lg:hidden">Quem disse </b>
                  {a.autor}
                </td>
                <td className={`max-lg:row-start-2 min-[420px]:col-start-1 min-[420px]:row-span-2 ${CELULA}`}>
                  <span className={SELO_VEREDITO[a.veredito]}>{ROTULO_VEREDITO[a.veredito]}</span>
                </td>
                <td className={`max-lg:row-start-4 min-[420px]:col-start-2 min-[420px]:row-start-3 ${CELULA}`}>
                  <a href={a.fonte_url} target="_blank" rel="noopener noreferrer" className={LINK_EM_CARTAO}>
                    {a.fonte_nome}
                    <span className="lg:hidden"> · {formatarData(a.data_checagem)}</span>
                  </a>
                </td>
                <td className={`whitespace-nowrap max-lg:hidden ${CELULA}`}>{formatarData(a.data_checagem)}</td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
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

export default async function Afirmacoes({ searchParams }: { searchParams: Promise<{ vista?: string | string[] }> }) {
  const vista: Vista = (await searchParams).vista === 'tabela' ? 'tabela' : 'cartoes'
  const pool = carregarPool()
  const noJogo = jogaveis(pool)
  const grupos: Grupo[] = [
    { id: 'no-jogo-esquerda', titulo: 'No jogo · Ditas ou espalhadas pela esquerda', afirmacoes: noJogo.filter(a => a.lado === 'esquerda') },
    { id: 'no-jogo-direita', titulo: 'No jogo · Ditas ou espalhadas pela direita', afirmacoes: noJogo.filter(a => a.lado === 'direita') },
    { id: 'fora-do-jogo', titulo: 'Fora do jogo', afirmacoes: foraDoJogo(pool) },
  ]
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
      <TrocaDeVista vista={vista} />

      {vista === 'tabela' ? (
        <Tabela grupos={grupos} />
      ) : (
        <>
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
        </>
      )}
    </main>
  )
}
