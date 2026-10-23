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

// 12 variações: vagas × ícones (índices em REPERTORIO) × giro em graus. Cada uma lista 6–9 candidatos, dos quais
// `escolher` usa até 3 (MAXIMO). Cada uma tem ao menos 4 vagas extremas,
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
  'size-[42px]', 'size-[43px]', 'size-[44px]', 'size-[45px]', 'size-[46px]', 'size-[47px]', 'size-[48px]', 'size-[49px]', 'size-[50px]', 'size-[51px]', 'size-[52px]', 'size-[53px]', 'size-[54px]', 'size-[55px]', 'size-[56px]', 'size-[57px]', 'size-[58px]', 'size-[59px]', 'size-[60px]',
] as const

const extrema = ({ top }: Vaga): boolean => top < 12 || top > 88

// Mesma semente → mesmos ícones; a semente entra em módulo 12. Com `longo`, só vagas extremas (até MAXIMO).
export const MAXIMO = 3

// Fora da faixa do texto (25–75% da altura) e fora do canto superior esquerdo, onde fica o "?".
export function livreParaGrande(v: Vaga): boolean {
  return (v.top < 25 || v.top > 75) && !(v.top < 25 && v.left < 20)
}

export function escolher(semente: number, longo: boolean): { vaga: Vaga; Icone: Icone; giro: number; tamanho: number }[] {
  const { vagas, icones, giros } = VARIACOES[((semente % 12) + 12) % 12]!
  const itens = vagas.map((v, i) => ({
    vaga: VAGAS[v]!,
    Icone: REPERTORIO[icones[i]!]!,
    giro: giros[i]!,
    tamanho: 42 + ((v * 5 + icones[i]! * 3 + i) % 19),
  }))
  // No máximo 3 por cartão, e grandes (42–60 px): só as faixas de cima e de baixo (as laterais encostariam no
  // texto a 320 px) e longe do canto do "?". As posições variam pela variação, não pela quantidade.
  const candidatos = itens.filter(({ vaga }) => livreParaGrande(vaga) && (!longo || extrema(vaga)))
  return espalhar(candidatos)
}

// Distância mínima entre ícones, em pontos percentuais do cartão (pedido do autor: "mais distribuídos").
// Tenta a maior distância que ainda rende 3; a menor é garantida pelo teste.
export const DISTANCIA_MINIMA = 20
const DISTANCIAS = [40, 30, DISTANCIA_MINIMA] as const

const distancia = (a: Vaga, b: Vaga): number => Math.hypot(a.left - b.left, a.top - b.top)
const faixa = (v: Vaga): 'cima' | 'baixo' => (v.top < 50 ? 'cima' : 'baixo')

function espalhar<T extends { vaga: Vaga }>(candidatos: T[]): T[] {
  for (const minimo of DISTANCIAS) {
    const escolhidos: T[] = []
    let restantes = candidatos
    while (escolhidos.length < MAXIMO && restantes.length > 0) {
      // Depois do primeiro, prefere a outra faixa (cima/baixo) para cobrir o cartão inteiro.
      const ultimo = escolhidos[escolhidos.length - 1]
      const ordem = ultimo ? [...restantes].sort((x, y) => Number(faixa(x.vaga) === faixa(ultimo.vaga)) - Number(faixa(y.vaga) === faixa(ultimo.vaga))) : restantes
      const proximo = ordem.find(c => escolhidos.every(e => distancia(e.vaga, c.vaga) >= minimo))
      if (!proximo) break
      escolhidos.push(proximo)
      restantes = restantes.filter(c => c !== proximo)
    }
    if (escolhidos.length === MAXIMO) return escolhidos
  }
  return candidatos.slice(0, MAXIMO)
}

// Ícones pequenos e quase transparentes espalhados pelas bordas do cartão, atrás do texto, sem toque.
export function IconesDoCartao({ semente, longo }: { semente: number; longo: boolean }): ReactElement {
  return (
    <div aria-hidden data-icones-cartao className="pointer-events-none absolute inset-0 overflow-hidden text-tinta opacity-[0.12]">
      {escolher(semente, longo).map(({ vaga, Icone, giro, tamanho }, i) => (
        <span key={i} className="absolute" style={{ left: `${vaga.left}%`, top: `${vaga.top}%`, transform: `rotate(${giro}deg)` }}>
          <Icone className={TAMANHOS[tamanho - 42]} />
        </span>
      ))}
    </div>
  )
}
