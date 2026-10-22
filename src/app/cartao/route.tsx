import { ImageResponse } from 'next/og'
import { Cartao } from '@/app/_imagens/Cartao'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'
import { FAIXAS, letrasParaCasas, parametrosSchema } from '@/lib/cartao'

export const runtime = 'nodejs'

// Um dia no navegador, uma semana na CDN: a imagem é função pura dos parâmetros,
// mas o desenho pode mudar em ajustes futuros (por isso sem `immutable`).
const CACHE = 'public, max-age=86400, s-maxage=604800'

export async function GET(req: Request): Promise<Response> {
  const resultado = parametrosSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams))
  if (!resultado.success) return new Response('Parâmetros inválidos', { status: 400 })

  const { a, t, c, f, g } = resultado.data
  return new ImageResponse(
    <Cartao acertos={a} total={t} caiu={c} faixa={FAIXAS[f]} casas={letrasParaCasas(g)} />,
    {
      width: 1080,
      height: 1920,
      fonts: fontesParaImagem(await carregarFontes()),
      headers: { 'Cache-Control': CACHE },
    },
  )
}
