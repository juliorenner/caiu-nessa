import { ImageResponse } from 'next/og'
import { Convite } from '@/app/_imagens/Convite'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'

export const runtime = 'nodejs'

// Mesmo cache de /cartao: a imagem não tem parâmetros, mas o desenho pode mudar.
const CACHE = 'public, max-age=86400, s-maxage=604800'

export async function GET(): Promise<Response> {
  return new ImageResponse(<Convite />, {
    width: 1080,
    height: 1920,
    fonts: fontesParaImagem(await carregarFontes()),
    headers: { 'Cache-Control': CACHE },
  })
}
