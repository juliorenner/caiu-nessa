import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import type { Casa } from '@/lib/cartao'
import { porLinha } from '@/lib/rodadas'
import { DOMINIO } from '@/lib/site'

const PAPEL = '#fff3dc'
const TINTA = '#1b1540'
const PAPEL_ESCURO = '#ffe8b5'
const BRANCO = '#ffffff'

// Moldura, sombra e faixa como na imagem OG da home (src/app/opengraph-image.tsx).
const LARGURA = 1200
const ALTURA = 630
const MOLDURA = 12
const SOMBRA = 16
const MARGEM = 32
const CASA = 72
const BORDA_CASA = 5
const VAO = 10

function X() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={44} height={44}>
      <path d="M20 20 L80 80 M80 20 L20 80" stroke={TINTA} strokeWidth={12} strokeLinecap="square" fill="none" />
    </svg>
  )
}

function Quadrado({ casa }: { casa: Casa }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: CASA,
        height: CASA,
        border: `${BORDA_CASA}px solid ${TINTA}`,
        backgroundColor: casa === 'acerto' ? TINTA : BRANCO,
        fontFamily: 'Bungee',
        fontSize: 44,
        lineHeight: 1,
        color: TINTA,
      }}
    >
      {casa === 'erro' ? <X /> : casa === 'quase' ? '?' : null}
    </div>
  )
}

function linhas(casas: Casa[]): Casa[][] {
  const n = porLinha(casas.length)
  const resultado: Casa[][] = []
  for (let i = 0; i < casas.length; i += n) resultado.push(casas.slice(i, i + n))
  return resultado
}

// Prévia 1200×630 do link do resultado: só o placar, sem afirmação, autor, lado ou data.
export function CartaoOg(p: { acertos: number; total: number; caiu: number; faixa: string; casas: Casa[] }) {
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
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '0 40px', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <CarimboImagem tamanho={140} cor={TINTA} />
              <div style={{ display: 'flex', fontFamily: 'Bungee', fontSize: 40, lineHeight: 1 }}>PLACAR</div>
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Bungee',
                fontSize: 180,
                lineHeight: 1,
                textShadow: `6px 6px 0 ${PAPEL_ESCURO}, 10px 10px 0 ${TINTA}`,
              }}
            >
              {`${p.acertos}/${p.total}`}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 8,
                padding: '8px 24px',
                border: `6px solid ${TINTA}`,
                fontFamily: 'Bungee',
                fontSize: 36,
                lineHeight: 1,
                transform: 'rotate(-3deg)',
              }}
            >
              {p.faixa.toUpperCase()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: VAO }}>
              {linhas(p.casas).map((linha, i) => (
                <div key={i} style={{ display: 'flex', gap: VAO }}>
                  {linha.map((casa, j) => (
                    <Quadrado key={j} casa={casa} />
                  ))}
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 32,
                fontFamily: 'Atkinson Hyperlegible',
                fontWeight: 700,
                fontSize: 36,
                lineHeight: 1.2,
              }}
            >
              E você?
            </div>
            <div style={{ display: 'flex', fontFamily: 'Bungee', fontSize: 30, lineHeight: 1.2 }}>{DOMINIO}</div>
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
          CAIU NESSA?
        </div>
      </div>
    </div>
  )
}
