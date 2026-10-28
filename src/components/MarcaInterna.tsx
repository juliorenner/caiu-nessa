'use client'

import { Analytics } from '@vercel/analytics/next'
import { useEffect } from 'react'
import { jogadorInterno, lerMarcaDaUrl } from '@/lib/interno'

// Lê `?interno=1|0` em qualquer página e carrega o Vercel Web Analytics (visitas, origem, país e
// aparelho, sem cookies; só carrega na Vercel), que descarta as visitas do jogador interno.
export function MarcaInterna() {
  useEffect(() => {
    lerMarcaDaUrl(window.location.search)
  }, [])
  return <Analytics beforeSend={evento => (jogadorInterno() ? null : evento)} />
}
