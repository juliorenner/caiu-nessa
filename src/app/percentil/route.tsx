import { ImageResponse } from 'next/og'
import { z } from 'zod'
import { Percentil } from '@/app/_imagens/Percentil'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'

export const runtime = 'nodejs'

// Mesmo cache de /cartao: a imagem é função pura do parâmetro, mas o desenho pode mudar.
const CACHE = 'public, max-age=86400, s-maxage=604800'

// "Mais que 0%" não é motivo para compartilhar, e "mais que 100%" não existe: a tela só oferece de 1 a 99.
const parametrosSchema = z.object({ p: z.coerce.number().int().min(1).max(99) })

export async function GET(req: Request): Promise<Response> {
  const resultado = parametrosSchema.safeParse(Object.fromEntries(new URL(req.url).searchParams))
  if (!resultado.success) return new Response('Parâmetros inválidos', { status: 400 })

  return new ImageResponse(<Percentil percentil={resultado.data.p} />, {
    width: 1080,
    height: 1920,
    fonts: fontesParaImagem(await carregarFontes()),
    headers: { 'Cache-Control': CACHE },
  })
}
