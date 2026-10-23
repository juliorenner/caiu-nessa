import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DESCRICAO } from '@/lib/site'
import { Ficha } from '@/components/Ficha'
import { GradeDeCasas } from '@/components/GradeDeCasas'
import { BOTAO_PRIMARIO, TEXTO_SECUNDARIO, CARIMBO_FAIXA, LINK_PAGINA, NUMERO_PLACAR } from '@/components/rotulos'
import { FAIXAS, letrasParaCasas, parametrosDoCodigo, type Parametros } from '@/lib/cartao'

type Props = { params: Promise<{ codigo: string }> }

async function lerParametros(params: Props['params']): Promise<Parametros> {
  const p = parametrosDoCodigo((await params).codigo)
  if (!p) notFound()
  return p
}

function fraseDoCaiu(c: number): string {
  return c === 0 ? 'Não caiu em nenhuma.' : `Caiu em ${c} das falsas ou enganosas.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { codigo } = await params
  const p = await lerParametros(params)
  const title = `Alguém fez ${p.a}/${p.t} no Caiu Nessa?`
  // O convite é para quem recebe: a primeira rodada dele é sempre de 12.
  const description = `${fraseDoCaiu(p.c)} E você? 12 afirmações da eleição: verdade, mentira ou cheira mal.`
  return {
    title,
    description,
    openGraph: { title, description, images: [`/r/${codigo}/opengraph-image`] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

// Placar de quem compartilhou, sem afirmações; o botão sempre abre uma rodada nova.
export default async function Pagina({ params }: Props) {
  const p = await lerParametros(params)
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <section className="flex flex-col gap-5 text-center text-tinta dark:text-papel">
        <Ficha esquerda="Placar de um amigo" direita={`Rodada de ${p.t}`} />
        <div className="flex flex-col items-center gap-3">
          <p className="font-letreiro text-[13px]">Placar</p>
          <p aria-hidden className={NUMERO_PLACAR}>
            {p.a}/{p.t}
          </p>
          <p className="sr-only">
            {p.a} de {p.t}
          </p>
        </div>
        <h1>
          <span className={CARIMBO_FAIXA}>{FAIXAS[p.f]}</span>
        </h1>
        <GradeDeCasas casas={letrasParaCasas(p.g)} />
        <p className="text-lg leading-relaxed">{fraseDoCaiu(p.c)}</p>
        {/* Primeiro contato de quem recebe o link: diz o que é o jogo antes do botão. */}
        <p className={`text-base leading-relaxed ${TEXTO_SECUNDARIO}`}>{DESCRICAO}</p>
        <Link href="/quiz" className={BOTAO_PRIMARIO}>
          Começar
        </Link>
        <Link href="/como-escolhemos" className={`self-center text-base ${LINK_PAGINA}`}>
          Como escolhemos as afirmações
        </Link>
      </section>
    </main>
  )
}
