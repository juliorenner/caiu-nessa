import type { ReactElement } from 'react'
import { Traco } from './Traco'

// Urna eletrônica de frente: tampa chanfrada, caixa, tela à esquerda, teclado 3×4 e três teclas maiores à direita, pé.
// As teclas são traços de comprimento zero: o remate quadrado vira um quadradinho do tamanho do traço.
const TECLADO = [19, 25, 31, 37].flatMap(y => [37, 44, 51].map(x => `M${x} ${y}h0`)).join('')

export function Urna({ className }: { className?: string }): ReactElement {
  return (
    <Traco className={className}>
      <path d="M8 14l6-8h36l6 8" />
      <rect x={6} y={14} width={52} height={34} />
      <rect x={11} y={19} width={18} height={14} />
      <path d={TECLADO} />
      <path d="M36 43h2M43 43h2M50 43h2" />
      <path d="M20 48v8h24v-8" />
    </Traco>
  )
}
