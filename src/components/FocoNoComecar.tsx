'use client'

import { useEffect } from 'react'

const TELA_LARGA = '(min-width: 1024px)'

// Em telas largas: dá foco ao alvo ao montar e trata Enter como atalho global para segui-lo, mesmo que o
// foco tenha ido para outro lugar (a página aberta pela barra de endereço só recebe foco depois de um
// clique, que tira o foco do link). No celular não faz nada.
export function FocoNoComecar({ alvoId }: { alvoId: string }) {
  useEffect(() => {
    if (!window.matchMedia?.(TELA_LARGA)?.matches) return
    const alvo = document.getElementById(alvoId)
    alvo?.focus()
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const origem = e.target instanceof HTMLElement ? e.target : null
      // Enter num botão, link ou campo já tem o seu próprio efeito; o atalho vale para o resto da página.
      if (origem && origem !== document.body && origem.closest('a, button, input, textarea, select, [role="button"]')) return
      e.preventDefault()
      document.getElementById(alvoId)?.click()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [alvoId])
  return null
}
