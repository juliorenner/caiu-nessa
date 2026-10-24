import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Home from '@/app/page'
import { lerPercentil } from '@/lib/percentil'
import { DESCRICAO } from '@/lib/site'

type Props = { params: Promise<{ p: string }> }

async function lerP(params: Props['params']): Promise<number> {
  const p = lerPercentil((await params).p)
  if (p === null) notFound()
  return p
}

// Link do cartão "Mais que X%": a mesma capa, com a prévia da comparação. Como em /r, a imagem
// vai declarada à mão (sem generateImageMetadata, que muda a URL dela).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await lerP(params)
  const title = `Acertei mais que ${p}% das pessoas no Caiu Nessa? Como será que você se sai?`
  return {
    title,
    description: DESCRICAO,
    alternates: { canonical: '/' },
    openGraph: { title, description: DESCRICAO, images: [`/jogue/${p}/opengraph-image`] },
    twitter: { card: 'summary_large_image', title, description: DESCRICAO },
  }
}

export default async function Pagina({ params }: Props) {
  await lerP(params)
  return <Home />
}
