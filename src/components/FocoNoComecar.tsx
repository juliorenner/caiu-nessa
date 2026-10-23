'use client'

import { useEffect } from 'react'

// Em telas largas, dá foco ao alvo ao montar: o Enter segue o link. No celular não faz nada.
export function FocoNoComecar({ alvoId }: { alvoId: string }) {
  useEffect(() => {
    if (window.matchMedia?.('(min-width: 1024px)')?.matches) document.getElementById(alvoId)?.focus()
  }, [alvoId])
  return null
}
