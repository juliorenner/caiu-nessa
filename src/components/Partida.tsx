'use client'

import { useRef, useState } from 'react'
import type { RespostaRodada } from '@/lib/rodada-api'
import Quiz, { type RodadaFeita } from './Quiz'
import type { AfirmacaoNoQuiz } from './tipos'

type Desfecho = 'ok' | 'fim' | 'falha'

// Uma partida: a rodada completa (TOTAL_AFIRMACOES) que veio do servidor e as rodadas extras pedidas a /api/rodada.
export default function Partida(p: { inicial: AfirmacaoNoQuiz[]; erroPorAfirmacao: Record<string, number> | null }) {
  const [rodada, setRodada] = useState(1)
  const [afirmacoes, setAfirmacoes] = useState(p.inicial)
  const [erroPorAfirmacao, setErroPorAfirmacao] = useState(p.erroPorAfirmacao)
  const [vistas, setVistas] = useState<string[]>([])
  const [acumulado, setAcumulado] = useState({ acertos: 0, total: 0 })
  // Dois cliques rápidos não geram dois sorteios: o segundo recebe a mesma promessa.
  const pedido = useRef<Promise<Desfecho> | null>(null)

  function continuar(feita: RodadaFeita): Promise<Desfecho> {
    if (pedido.current) return pedido.current
    const todasVistas = [...vistas, ...feita.ids]
    const promessa = (async (): Promise<Desfecho> => {
      try {
        const resposta = await fetch('/api/rodada', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vistas: todasVistas }),
        })
        if (!resposta.ok) return 'falha'
        const dados = (await resposta.json()) as RespostaRodada
        if (dados.afirmacoes === null) return 'fim'
        setVistas(todasVistas)
        setAcumulado(anterior => ({ acertos: anterior.acertos + feita.acertos, total: anterior.total + feita.total }))
        setAfirmacoes(dados.afirmacoes)
        setErroPorAfirmacao(dados.erroPorAfirmacao)
        setRodada(r => r + 1)
        return 'ok'
      } catch {
        return 'falha'
      }
    })()
    // Limpa depois de guardar: um erro síncrono no fetch não deixa a promessa presa no ref.
    pedido.current = promessa
    void promessa.finally(() => {
      pedido.current = null
    })
    return promessa
  }

  // key={rodada}: cada rodada monta um Quiz novo, com contador e progresso zerados.
  return (
    <Quiz
      key={rodada}
      rodada={rodada}
      afirmacoes={afirmacoes}
      erroPorAfirmacao={erroPorAfirmacao}
      acumuladoAnterior={acumulado}
      onContinuar={continuar}
    />
  )
}
