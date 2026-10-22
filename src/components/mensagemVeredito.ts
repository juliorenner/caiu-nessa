import type { Veredito } from '@/lib/afirmacoes'
import { ehQuase } from '@/lib/pontuacao'
import { ROTULO_VEREDITO } from './rotulos'

export function mensagem(veredito: Veredito, respostaDada: Veredito): string {
  if (respostaDada === veredito) return 'Você acertou.'
  if (ehQuase(veredito, respostaDada)) {
    return `Quase: você desconfiou, mas a checagem classificou como ${ROTULO_VEREDITO[veredito]}.`
  }
  if (respostaDada === 'verdadeiro') return 'Você caiu nessa.'
  return 'Era verdade.'
}
