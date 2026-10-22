import { CarimboImagem } from '@/app/_imagens/CarimboImagem'
import type { Casa } from '@/lib/cartao'
import { DOMINIO } from '@/lib/site'

const PAPEL = '#fff3dc'
const TINTA = '#1b1540'
const PAPEL_ESCURO = '#ffe8b5'
const BRANCO = '#ffffff'

// Margens de segurança: o Instagram desenha a interface no topo e na base dos stories.
const MARGEM_TOPO = 220
const MARGEM_BASE = 300
const LATERAL = 90
const CASA = 120
const BORDA_CASA = 6
const POR_LINHA = 6

function X() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={72} height={72}>
      <path d="M20 20 L80 80 M80 20 L20 80" stroke={TINTA} strokeWidth={10} strokeLinecap="square" fill="none" />
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
        fontSize: 72,
        lineHeight: 1,
        color: TINTA,
      }}
    >
      {casa === 'erro' ? <X /> : casa === 'quase' ? '?' : null}
    </div>
  )
}

function linhas(casas: Casa[]): Casa[][] {
  const resultado: Casa[][] = []
  for (let i = 0; i < casas.length; i += POR_LINHA) resultado.push(casas.slice(i, i + POR_LINHA))
  return resultado
}

// Cartão 1080×1920 para os stories: só o placar, sem afirmação, autor, lado ou data.
export function Cartao(p: { acertos: number; total: number; caiu: number; faixa: string; casas: Casa[] }) {
  const frase = p.caiu === 0 ? 'Não caí em nenhuma.' : `Caí em ${p.caiu} das falsas ou enganosas.`

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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

      <div style={{ display: 'flex', marginTop: 48 }}>
        <CarimboImagem tamanho={160} cor={TINTA} />
      </div>

      <div style={{ display: 'flex', marginTop: 24, fontFamily: 'Bungee', fontSize: 40, lineHeight: 1 }}>PLACAR</div>
      <div
        style={{
          display: 'flex',
          fontFamily: 'Bungee',
          fontSize: 300,
          lineHeight: 1,
          textShadow: `10px 10px 0 ${PAPEL_ESCURO}, 16px 16px 0 ${TINTA}`,
        }}
      >
        {`${p.acertos}/${p.total}`}
      </div>
      <div
        style={{
          display: 'flex',
          padding: '12px 32px',
          border: `8px solid ${TINTA}`,
          fontFamily: 'Bungee',
          fontSize: 56,
          lineHeight: 1,
          transform: 'rotate(-3deg)',
        }}
      >
        {p.faixa.toUpperCase()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 56 }}>
        {linhas(p.casas).map((linha, i) => (
          <div key={i} style={{ display: 'flex', gap: 16 }}>
            {linha.map((casa, j) => (
              <Quadrado key={j} casa={casa} />
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          marginTop: 44,
          fontFamily: 'Atkinson Hyperlegible',
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.2,
        }}
      >
        {frase}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginTop: 44,
          padding: '24px 0',
          backgroundColor: TINTA,
          color: PAPEL,
          fontFamily: 'Bungee',
          fontSize: 44,
          lineHeight: 1,
        }}
      >
        {`E você? ${DOMINIO}`}
      </div>
    </div>
  )
}
