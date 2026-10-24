import type { Metadata } from 'next'
import { PaginaDeContribuicao } from '@/components/PaginaDeContribuicao'

export const metadata: Metadata = { title: 'Sugerir uma afirmação · Caiu Nessa?' }

export default function Sugerir() {
  return <PaginaDeContribuicao tipo="sugestao" />
}
