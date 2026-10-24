import { ImageResponse } from 'next/og'
import { Percentil } from '@/app/_imagens/Percentil'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'
import { lerPercentil } from '@/lib/percentil'

export const runtime = 'nodejs'

// Mesmo cache de /cartao: a imagem é função pura do parâmetro, mas o desenho pode mudar.
const CACHE = 'public, max-age=86400, s-maxage=604800'

export async function GET(req: Request): Promise<Response> {
  const p = lerPercentil(new URL(req.url).searchParams.get('p'))
  if (p === null) return new Response('Parâmetros inválidos', { status: 400 })

  return new ImageResponse(<Percentil percentil={p} />, {
    width: 1080,
    height: 1920,
    fonts: fontesParaImagem(await carregarFontes()),
    headers: { 'Cache-Control': CACHE },
  })
}
