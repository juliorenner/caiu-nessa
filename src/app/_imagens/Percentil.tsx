import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import { DOMINIO } from '@/lib/site'

const PAPEL = '#fff3dc'
const TINTA = '#1b1540'
const PAPEL_ESCURO = '#ffe8b5'

// Mesmas margens de segurança do Cartao: o Instagram desenha a interface no topo e na base.
const MARGEM_TOPO = 220
const MARGEM_BASE = 300
const LATERAL = 90

// Cartão 1080×1920 com a comparação e sem o placar: mostra o quanto foi bem, não quantas errou.
export function Percentil({ percentil }: { percentil: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: `${MARGEM_TOPO}px ${LATERAL}px ${MARGEM_BASE}px`,
        backgroundColor: PAPEL,
        color: TINTA,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          padding: '20px 36px',
          backgroundColor: PAPEL_ESCURO,
          border: `6px solid ${TINTA}`,
          boxShadow: `10px 10px 0 ${TINTA}`,
          fontFamily: 'Bungee',
          fontSize: 36,
          lineHeight: 1,
        }}
      >
        <span>FIM DE JOGO</span>
        <span>CAIU NESSA?</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <div style={{ display: 'flex', transform: 'rotate(-8deg)' }}>
          <CarimboImagem tamanho={220} cor={TINTA} />
        </div>

        <div style={{ display: 'flex', marginTop: 56, fontFamily: 'Bungee', fontSize: 68, lineHeight: 1 }}>
          ACERTEI MAIS QUE
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 12,
            fontFamily: 'Bungee',
            fontSize: 330,
            lineHeight: 1,
            textShadow: `10px 10px 0 ${PAPEL_ESCURO}, 16px 16px 0 ${TINTA}`,
          }}
        >
          {`${percentil}%`}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 8,
            padding: '12px 32px',
            border: `8px solid ${TINTA}`,
            fontFamily: 'Bungee',
            fontSize: 60,
            lineHeight: 1,
            transform: 'rotate(-3deg)',
          }}
        >
          DAS PESSOAS
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 64,
            fontFamily: 'Atkinson Hyperlegible',
            fontWeight: 700,
            fontSize: 50,
            lineHeight: 1.2,
          }}
        >
          Como será que você se sai?
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          padding: '24px 0',
          backgroundColor: TINTA,
          color: PAPEL,
          fontFamily: 'Bungee',
          fontSize: 44,
          lineHeight: 1,
        }}
      >
        {`SUA VEZ · ${DOMINIO.toUpperCase()}`}
      </div>
    </div>
  )
}
