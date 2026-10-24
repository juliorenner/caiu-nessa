'use client'

import { useEffect, useState } from 'react'
import { LINK_PAGINA } from '@/components/rotulos'
import { definirSom, somLigado } from '@/lib/som-urna'

// Liga e desliga o som da urna. Começa "ligado" (igual ao HTML do servidor) e lê a preferência depois de montar.
export function BotaoSom() {
  const [ligado, setLigado] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage só existe no cliente; ler no render divergiria da hidratação
    setLigado(somLigado())
  }, [])

  function alternar() {
    const novo = !ligado
    setLigado(novo)
    definirSom(novo)
  }

  return (
    <button
      type="button"
      aria-pressed={ligado}
      onClick={alternar}
      className={`inline-flex items-center gap-2 self-center text-base lg:self-start ${LINK_PAGINA}`}
    >
      {/* Alto-falante com ondas (ligado) ou com um X (desligado), no tamanho da marca do GitHub. */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0"
      >
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        {ligado ? <path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
      </svg>
      Som da urna: {ligado ? 'ligado' : 'desligado'}
    </button>
  )
}
