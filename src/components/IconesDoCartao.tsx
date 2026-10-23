import type { ReactElement } from 'react'
import { Congresso } from './icones/Congresso'
import { Jornal } from './icones/Jornal'
import { Microfone } from './icones/Microfone'
import { Politico } from './icones/Politico'
import { TituloEleitor } from './icones/TituloEleitor'
import { Urna } from './icones/Urna'

type Vaga = { left: number; top: number }
type Icone = (props: { className?: string }) => ReactElement

const REPERTORIO: readonly Icone[] = [Urna, Politico, Congresso, TituloEleitor, Microfone, Jornal]

// Vagas em % do cartão (canto superior esquerdo do ícone). A faixa central (25–75% da altura × 12–88% da largura)
// fica sempre livre para o texto. 0–3 e 12–15 são as extremas (top < 12 ou > 88), as únicas usadas por textos longos.
export const VAGAS: readonly Vaga[] = [
  { left: 4, top: 3 },
  { left: 27, top: 4 },
  { left: 52, top: 3 },
  { left: 78, top: 5 },
  { left: 30, top: 15 },
  { left: 62, top: 16 },
  { left: 2, top: 36 },
  { left: 89, top: 32 },
  { left: 3, top: 60 },
  { left: 89, top: 63 },
  { left: 20, top: 77 },
  { left: 68, top: 78 },
  { left: 6, top: 89 },
  { left: 33, top: 91 },
  { left: 58, top: 89 },
  { left: 82, top: 90 },
]

// 12 variações: vagas × ícones (índices em REPERTORIO) × giro em graus. Cada uma tem ao menos 4 vagas extremas,
// com as quatro primeiras alternando topo e base.
export const VARIACOES: readonly { vagas: number[]; icones: number[]; giros: number[] }[] = [
  { vagas: [0, 13, 6, 3, 9, 15, 4], icones: [0, 1, 2, 3, 4, 5, 1], giros: [-6, 4, -3, 7, -5, 2, -1] },
  { vagas: [1, 12, 2, 14, 7, 10], icones: [2, 3, 4, 5, 0, 1], giros: [5, -7, 2, -4, 6, -2] },
  { vagas: [3, 12, 5, 15, 8, 1, 11, 13], icones: [4, 5, 0, 1, 2, 3, 4, 0], giros: [-3, 6, -8, 3, -5, 8, -2, 4] },
  { vagas: [0, 14, 2, 15, 6, 9, 10, 5, 13], icones: [1, 2, 3, 4, 5, 0, 2, 3, 4], giros: [7, -4, 3, -6, 5, -2, 8, -5, 1] },
  { vagas: [2, 13, 7, 0, 12, 11], icones: [3, 4, 5, 0, 1, 2], giros: [-2, 5, -7, 4, -4, 6] },
  { vagas: [1, 15, 4, 3, 14, 8, 12], icones: [5, 0, 1, 2, 3, 4, 1], giros: [4, -6, 2, -3, 7, -8, 3] },
  { vagas: [0, 12, 3, 15, 6, 7, 10, 11], icones: [2, 5, 1, 4, 0, 3, 2, 5], giros: [-7, 3, 6, -2, 4, -5, 1, -4] },
  { vagas: [2, 14, 1, 13, 9, 4], icones: [0, 3, 4, 1, 5, 2], giros: [6, -3, -6, 5, -1, 8] },
  { vagas: [3, 13, 0, 12, 5, 8, 11, 15, 6], icones: [1, 4, 2, 5, 3, 0, 4, 2, 5], giros: [-5, 7, 2, -6, 3, -3, 5, -8, 6] },
  { vagas: [1, 12, 3, 14, 7, 10, 2], icones: [4, 1, 5, 2, 0, 3, 1], giros: [3, -5, 8, -2, -6, 4, -3] },
  { vagas: [0, 15, 2, 13, 4, 9, 11, 8], icones: [3, 0, 4, 1, 5, 2, 0, 3], giros: [-4, 6, -1, 5, 7, -7, 2, -3] },
  { vagas: [3, 12, 1, 15, 5, 6, 14], icones: [5, 2, 0, 3, 1, 4, 0], giros: [2, -8, 5, -4, -2, 6, -6] },
]

// Classes literais para o Tailwind enxergar: índice = tamanho − 28.
const TAMANHOS = [
  'size-[28px]', 'size-[29px]', 'size-[30px]', 'size-[31px]', 'size-[32px]', 'size-[33px]', 'size-[34px]', 'size-[35px]', 'size-[36px]', 'size-[37px]', 'size-[38px]', 'size-[39px]', 'size-[40px]',
] as const

const extrema = ({ top }: Vaga): boolean => top < 12 || top > 88

// Mesma semente → mesmos ícones; a semente entra em módulo 12. Com `longo`, só as 4 primeiras vagas extremas.
export function escolher(semente: number, longo: boolean): { vaga: Vaga; Icone: Icone; giro: number; tamanho: number }[] {
  const { vagas, icones, giros } = VARIACOES[((semente % 12) + 12) % 12]!
  const itens = vagas.map((v, i) => ({
    vaga: VAGAS[v]!,
    Icone: REPERTORIO[icones[i]!]!,
    giro: giros[i]!,
    tamanho: 28 + ((v * 5 + icones[i]! * 3 + i) % 13),
  }))
  return longo ? itens.filter(({ vaga }) => extrema(vaga)).slice(0, 4) : itens
}

// Ícones pequenos e quase transparentes espalhados pelas bordas do cartão, atrás do texto, sem toque.
export function IconesDoCartao({ semente, longo }: { semente: number; longo: boolean }): ReactElement {
  return (
    <div aria-hidden data-icones-cartao className="pointer-events-none absolute inset-0 overflow-hidden text-tinta opacity-[0.12]">
      {escolher(semente, longo).map(({ vaga, Icone, giro, tamanho }, i) => (
        <span key={i} className="absolute" style={{ left: `${vaga.left}%`, top: `${vaga.top}%`, transform: `rotate(${giro}deg)` }}>
          <Icone className={TAMANHOS[tamanho - 28]} />
        </span>
      ))}
    </div>
  )
}
