import type { Metadata } from 'next'
import Home from '@/app/page'
import { DESCRICAO } from '@/lib/site'

// Link do cartão "Convite": a mesma capa, com a prévia do convite no lugar da genérica.
// O canonical aponta para a capa: é a mesma página para quem busca.
const title = 'Já joguei o Caiu Nessa? E você, cai nessa?'

export const metadata: Metadata = {
  title,
  description: DESCRICAO,
  alternates: { canonical: '/' },
  openGraph: { title, description: DESCRICAO },
  twitter: { card: 'summary_large_image', title, description: DESCRICAO },
}

export default Home
