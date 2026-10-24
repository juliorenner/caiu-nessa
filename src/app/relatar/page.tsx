import type { Metadata } from 'next'
import { PaginaDeContribuicao } from '@/components/PaginaDeContribuicao'

export const metadata: Metadata = { title: 'Reportar um problema · Caiu Nessa?' }

export default function Relatar() {
  return <PaginaDeContribuicao tipo="problema" />
}
