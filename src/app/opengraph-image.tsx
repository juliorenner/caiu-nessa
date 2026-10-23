import { ImageResponse } from 'next/og'
import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import { carregarFontes, fontesParaImagem } from '@/app/_imagens/fontes'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { DESCRICAO, DOMINIO, TITULO } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const alt = `${TITULO} ${DESCRICAO}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PAPEL = '#fff3dc'
const TINTA = '#1b1540'
const PAPEL_ESCURO = '#ffe8b5'

// Moldura de 12 px com sombra dura: um retângulo de tinta deslocado 16 px atrás do cartão.
const MOLDURA = 12
const SOMBRA = 16
const MARGEM = 32

export default async function Image(): Promise<ImageResponse> {
  const fontes = fontesParaImagem(await carregarFontes())
  const largura = size.width - 2 * MARGEM - SOMBRA
  const altura = size.height - 2 * MARGEM - SOMBRA

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: PAPEL, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: MARGEM + SOMBRA,
            top: MARGEM + SOMBRA,
            width: largura,
            height: altura,
            backgroundColor: TINTA,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: MARGEM,
            top: MARGEM,
            width: largura,
            height: altura,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: PAPEL,
            border: `${MOLDURA}px solid ${TINTA}`,
          }}
        >
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '0 48px', gap: 40 }}>
            <CarimboImagem tamanho={300} cor={TINTA} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontFamily: 'Bungee',
                  fontSize: 132,
                  lineHeight: 1,
                  color: TINTA,
                }}
              >
                <span>CAIU</span>
                <span>NESSA?</span>
              </div>
              <div
                style={{
                  marginTop: 24,
                  fontFamily: 'Atkinson Hyperlegible',
                  fontWeight: 700,
                  fontSize: 40,
                  lineHeight: 1.2,
                  color: TINTA,
                }}
              >
                {`${TOTAL_AFIRMACOES} afirmações da eleição. Verdade, mentira ou cheira mal?`}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: 84,
              backgroundColor: PAPEL_ESCURO,
              borderTop: `${MOLDURA}px solid ${TINTA}`,
              fontFamily: 'Bungee',
              fontSize: 32,
              color: TINTA,
            }}
          >
            {`INSIRA A FICHA · ${DOMINIO}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fontes },
  )
}
