import { z } from 'zod'

// "Mais que 0%" não é motivo para compartilhar, e "mais que 100%" não existe: só de 1 a 99.
export const percentilSchema = z.coerce.number().int().min(1).max(99)

export function ehPercentilCompartilhavel(p: number | null): p is number {
  return p !== null && percentilSchema.safeParse(p).success
}

// A comparação lida da URL (`/percentil?p=`, `/jogue/<p>`); null quando não vale.
export function lerPercentil(valor: string | null | undefined): number | null {
  const resultado = percentilSchema.safeParse(valor)
  return resultado.success ? resultado.data : null
}
