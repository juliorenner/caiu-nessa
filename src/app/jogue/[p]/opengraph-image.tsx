import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { PercentilOg } from '@/app/_imagens/PercentilOg'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'
import { lerPercentil } from '@/lib/percentil'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Mesmo cache de /cartao: a imagem é função pura do parâmetro, mas o desenho pode mudar.
const CACHE = 'public, max-age=86400, s-maxage=604800'

type Props = { params: Promise<{ p: string }> }

// Alt fixo, como em /r: o número está no título da página.
export const alt = 'Um amigo jogou o Caiu Nessa? Como será que você se sai?'

export default async function Image({ params }: Props): Promise<ImageResponse> {
  const p = lerPercentil((await params).p)
  if (p === null) notFound()
  return new ImageResponse(<PercentilOg percentil={p} />, {
    ...size,
    fonts: fontesParaImagem(await carregarFontes()),
    headers: { 'Cache-Control': CACHE },
  })
}
