import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { DOMINIO } from '@/lib/site'

const PAPEL = '#ffe8b5'
const TINTA = '#1b1540'
const NOITE = '#120f2b'
const BRANCO = '#ffffff'
// As cores dos vereditos do jogo (globals.css), como no Convite dos stories.
const VEREDITOS = [
  { rotulo: 'VERDADE', cor: '#1d4ed8', giro: -5 },
  { rotulo: 'MENTIRA', cor: '#be185d', giro: 3 },
  { rotulo: 'ENGANOSO', cor: '#c2410c', giro: -2 },
]

// Prévia 1200×630 do link do convite (/jogue): a mesma arte dos stories, deitada.
export function ConviteOg() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: TINTA,
        color: PAPEL,
      }}
    >
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', padding: '0 64px', gap: 56 }}>
        <div style={{ display: 'flex', transform: 'rotate(8deg)' }}>
          <CarimboImagem tamanho={300} cor={PAPEL} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', fontFamily: 'Bungee', fontSize: 40, lineHeight: 1 }}>EU JÁ JOGUEI. E VOCÊ,</div>
          <div
            style={{
              display: 'flex',
              marginTop: 12,
              fontFamily: 'Bungee',
              fontSize: 112,
              lineHeight: 1,
              color: BRANCO,
              textShadow: `8px 8px 0 ${NOITE}`,
            }}
          >
            CAI NESSA?
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
            {VEREDITOS.map(v => (
              <div
                key={v.rotulo}
                style={{
                  display: 'flex',
                  padding: '10px 16px 6px',
                  backgroundColor: BRANCO,
                  border: `5px solid ${v.cor}`,
                  borderRadius: 8,
                  boxShadow: `6px 6px 0 ${NOITE}`,
                  color: v.cor,
                  fontFamily: 'Bungee',
                  fontSize: 30,
                  lineHeight: 1,
                  transform: `rotate(${v.giro}deg)`,
                }}
              >
                {v.rotulo}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontFamily: 'Atkinson Hyperlegible',
              fontWeight: 700,
              fontSize: 32,
              lineHeight: 1.25,
            }}
          >
            {`${TOTAL_AFIRMACOES} afirmações que circulam no mundo político brasileiro.`}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 88,
          backgroundColor: PAPEL,
          color: TINTA,
          fontFamily: 'Bungee',
          fontSize: 36,
          lineHeight: 1,
        }}
      >
        {`SUA VEZ · ${DOMINIO.toUpperCase()}`}
      </div>
    </div>
  )
}
