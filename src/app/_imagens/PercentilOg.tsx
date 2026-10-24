import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import { DOMINIO } from '@/lib/site'

const PAPEL = '#fff3dc'
const TINTA = '#1b1540'
const PAPEL_ESCURO = '#ffe8b5'

// Moldura, sombra e faixa como na imagem OG da home (src/app/opengraph-image.tsx).
const LARGURA = 1200
const ALTURA = 630
const MOLDURA = 12
const SOMBRA = 16
const MARGEM = 32

// Prévia 1200×630 do link da comparação (/jogue/<p>): quanto foi bem, sem o placar.
export function PercentilOg({ percentil }: { percentil: number }) {
  const largura = LARGURA - 2 * MARGEM - SOMBRA
  const altura = ALTURA - 2 * MARGEM - SOMBRA

  return (
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
          color: TINTA,
        }}
      >
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '0 48px', gap: 40 }}>
          <div style={{ display: 'flex', transform: 'rotate(-8deg)' }}>
            <CarimboImagem tamanho={200} cor={TINTA} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', fontFamily: 'Bungee', fontSize: 44, lineHeight: 1 }}>ACERTEI MAIS QUE</div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Bungee',
                fontSize: 190,
                lineHeight: 1,
                textShadow: `6px 6px 0 ${PAPEL_ESCURO}, 10px 10px 0 ${TINTA}`,
              }}
            >
              {`${percentil}%`}
            </div>
            <div
              style={{
                display: 'flex',
                padding: '8px 24px',
                border: `6px solid ${TINTA}`,
                fontFamily: 'Bungee',
                fontSize: 36,
                lineHeight: 1,
                transform: 'rotate(-3deg)',
              }}
            >
              DAS PESSOAS
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 20,
                fontFamily: 'Atkinson Hyperlegible',
                fontWeight: 700,
                fontSize: 34,
                lineHeight: 1.2,
              }}
            >
              Como será que você se sai?
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 76,
            backgroundColor: PAPEL_ESCURO,
            borderTop: `${MOLDURA}px solid ${TINTA}`,
            fontFamily: 'Bungee',
            fontSize: 32,
            lineHeight: 1,
          }}
        >
          {`SUA VEZ · ${DOMINIO.toUpperCase()}`}
        </div>
      </div>
    </div>
  )
}
