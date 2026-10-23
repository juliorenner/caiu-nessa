import { ImageResponse } from 'next/og'
import { notFound } from 'next/navigation'
import { CartaoOg } from '@/app/_imagens/CartaoOg'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'
import { FAIXAS, letrasParaCasas, parametrosDoCodigo, type Parametros } from '@/lib/cartao'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Mesmo cache de /cartao: a imagem é função pura do código, mas o desenho pode mudar.
const CACHE = 'public, max-age=86400, s-maxage=604800'

type Props = { params: Promise<{ codigo: string }> }

async function parametros(params: Props['params']): Promise<Parametros> {
  const p = parametrosDoCodigo((await params).codigo)
  if (!p) notFound()
  return p
}

// Alt fixo: com `generateImageMetadata` o Next serve a imagem em `/opengraph-image/<id>` e o
// `og:image` que a página anuncia (sem id) respondia 404. O placar em si está na descrição da página.
export const alt = 'Placar de um amigo no Caiu Nessa? E você?'

export default async function Image({ params }: Props): Promise<ImageResponse> {
  const { a, t, c, f, g } = await parametros(params)
  return new ImageResponse(
    <CartaoOg acertos={a} total={t} caiu={c} faixa={FAIXAS[f]} casas={letrasParaCasas(g)} />,
    {
      ...size,
      fonts: fontesParaImagem(await carregarFontes()),
      headers: { 'Cache-Control': CACHE },
    },
  )
}
