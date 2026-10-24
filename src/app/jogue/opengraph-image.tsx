import { ImageResponse } from 'next/og'
import { ConviteOg } from '@/app/_imagens/ConviteOg'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const alt = 'Um amigo jogou o Caiu Nessa? E você, cai nessa?'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image(): Promise<ImageResponse> {
  return new ImageResponse(<ConviteOg />, { ...size, fonts: fontesParaImagem(await carregarFontes()) })
}
