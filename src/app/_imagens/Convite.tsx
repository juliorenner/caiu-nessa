import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { DOMINIO } from '@/lib/site'

const PAPEL = '#ffe8b5'
const TINTA = '#1b1540'
// Fundo do tema noite: a sombra dura, mais escura que a tinta.
const NOITE = '#120f2b'
const BRANCO = '#ffffff'
// As cores dos vereditos do jogo (globals.css): o convite mostra as três respostas possíveis.
const VEREDITOS = [
  { rotulo: 'VERDADE', cor: '#1d4ed8', giro: -6 },
  { rotulo: 'MENTIRA', cor: '#be185d', giro: 4 },
  { rotulo: 'ENGANOSO', cor: '#c2410c', giro: -3 },
]

// Mesmas margens de segurança do Cartao: o Instagram desenha a interface no topo e na base.
const MARGEM_TOPO = 220
const MARGEM_BASE = 300
const LATERAL = 90

function Selo({ rotulo, cor, giro }: { rotulo: string; cor: string; giro: number }) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '14px 22px 10px',
        backgroundColor: BRANCO,
        border: `6px solid ${cor}`,
        borderRadius: 10,
        boxShadow: `8px 8px 0 ${NOITE}`,
        color: cor,
        fontFamily: 'Bungee',
        fontSize: 40,
        lineHeight: 1,
        transform: `rotate(${giro}deg)`,
      }}
    >
      {rotulo}
    </div>
  )
}

// Cartão 1080×1920 sem placar, no tema noite para parar o dedo no meio dos stories:
// diz que a pessoa jogou e desafia quem vê a jogar também, sem número nenhum.
export function Convite() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: `${MARGEM_TOPO}px ${LATERAL}px ${MARGEM_BASE}px`,
        backgroundColor: TINTA,
        color: PAPEL,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '20px 36px',
          backgroundColor: PAPEL,
          color: TINTA,
          border: `6px solid ${NOITE}`,
          boxShadow: `10px 10px 0 ${NOITE}`,
          fontFamily: 'Bungee',
          fontSize: 36,
          lineHeight: 1,
        }}
      >
        <span>EU JÁ JOGUEI</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          SUA VEZ
          {/* Seta desenhada: a Bungee não tem o glifo ▸. */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 12" width={26} height={32}>
            <path d="M0 0 L10 6 L0 12 Z" fill={TINTA} />
          </svg>
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <div style={{ display: 'flex', transform: 'rotate(8deg)' }}>
          <CarimboImagem tamanho={300} cor={PAPEL} />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 36,
            fontFamily: 'Bungee',
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 84 }}>E VOCÊ,</span>
          <span style={{ fontSize: 200, color: BRANCO, textShadow: `12px 12px 0 ${NOITE}` }}>CAI</span>
          <span style={{ fontSize: 160, color: BRANCO, textShadow: `12px 12px 0 ${NOITE}` }}>NESSA?</span>
        </div>

        <div style={{ display: 'flex', gap: 18, marginTop: 64 }}>
          {VEREDITOS.map(v => (
            <Selo key={v.rotulo} {...v} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 52,
            textAlign: 'center',
            fontFamily: 'Atkinson Hyperlegible',
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.25,
          }}
        >
          {`${TOTAL_AFIRMACOES} afirmações que circularam na eleição. Duvido você não cair em nenhuma.`}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          padding: '26px 0 22px',
          backgroundColor: PAPEL,
          color: TINTA,
          border: `6px solid ${NOITE}`,
          boxShadow: `10px 10px 0 ${NOITE}`,
          fontFamily: 'Bungee',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: 30 }}>INSIRA A FICHA</span>
        <span style={{ fontSize: 56, marginTop: 12 }}>{DOMINIO.toUpperCase()}</span>
      </div>
    </div>
  )
}
