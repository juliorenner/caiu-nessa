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
    <button type="button" aria-pressed={ligado} onClick={alternar} className={`self-center text-base lg:self-start ${LINK_PAGINA}`}>
      Som da urna: {ligado ? 'ligado' : 'desligado'}
    </button>
  )
}
