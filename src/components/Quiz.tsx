'use client'

import { useRef, useState } from 'react'
import { type Afirmacao, type Respostas, TOTAL_AFIRMACOES, type Veredito } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'
import { Feedback } from './Feedback'
import { ResultadoFinal } from './ResultadoFinal'
import { BOTAO_PRIMARIO, FOCO } from './rotulos'

// `lado` fica no servidor: o cliente nunca recebe de que lado é cada afirmação.
export type AfirmacaoNoQuiz = Omit<Afirmacao, 'lado'>

export interface QuizProps {
  afirmacoes: AfirmacaoNoQuiz[]
  erroPorAfirmacao: Record<string, number> | null
  // A ordem vem embaralhada do servidor; embaralhar aqui geraria hydration mismatch.
  embaralharFn?: (itens: AfirmacaoNoQuiz[]) => AfirmacaoNoQuiz[]
}

type Estado =
  | { etapa: 'pergunta' | 'feedback'; indice: number }
  | { etapa: 'enviando' }
  | { etapa: 'resultado'; dados: RespostaResultado }
  | { etapa: 'erro'; limite: boolean }

const OPCOES: { valor: Veredito; rotulo: string; cor: string }[] = [
  { valor: 'verdadeiro', rotulo: 'VERDADE', cor: 'border-emerald-700 text-emerald-900 hover:bg-emerald-50' },
  { valor: 'falso', rotulo: 'MENTIRA', cor: 'border-rose-700 text-rose-900 hover:bg-rose-50' },
  { valor: 'enganoso', rotulo: 'ISSO ME CHEIRA MAL 🤔', cor: 'border-amber-600 text-amber-900 hover:bg-amber-50' },
]

const SELECIONADA: Record<Veredito, string> = {
  verdadeiro: 'bg-emerald-700 text-white',
  falso: 'bg-rose-700 text-white',
  enganoso: 'bg-amber-700 text-white',
}

export default function Quiz({ afirmacoes, erroPorAfirmacao, embaralharFn = x => x }: QuizProps) {
  const [ordem] = useState(() => embaralharFn(afirmacoes))
  const [estado, setEstado] = useState<Estado>({ etapa: 'pergunta', indice: 0 })
  const [respostas, setRespostas] = useState<Respostas>({})
  const enviando = useRef(false)
  const topo = useRef<HTMLDivElement>(null)

  async function enviar(todas: Respostas) {
    if (enviando.current) return
    enviando.current = true
    setEstado({ etapa: 'enviando' })
    try {
      const resposta = await fetch('/api/resultado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respostas: todas }),
      })
      if (!resposta.ok) {
        setEstado({ etapa: 'erro', limite: resposta.status === 429 })
        return
      }
      setEstado({ etapa: 'resultado', dados: (await resposta.json()) as RespostaResultado })
    } catch {
      setEstado({ etapa: 'erro', limite: false })
    } finally {
      enviando.current = false
    }
  }

  if (estado.etapa === 'enviando') {
    return (
      <p role="status" className="py-16 text-center text-lg">
        Calculando seu resultado…
      </p>
    )
  }

  if (estado.etapa === 'resultado') return <ResultadoFinal dados={estado.dados} />

  if (estado.etapa === 'erro') {
    return (
      <div role="alert" className="flex flex-col gap-5 py-10 text-center">
        <p className="text-lg">
          {estado.limite
            ? 'Calma aí: muitas jogadas em pouco tempo. Tente de novo em um minuto.'
            : 'Não conseguimos salvar seu resultado. Tente de novo.'}
        </p>
        <button type="button" onClick={() => enviar(respostas)} className={BOTAO_PRIMARIO}>
          Tentar de novo
        </button>
      </div>
    )
  }

  const { indice, etapa } = estado
  const afirmacao = ordem[indice]
  const respostaDada = respostas[afirmacao.id]
  const ultima = indice === ordem.length - 1

  function responder(valor: Veredito) {
    if (etapa !== 'pergunta') return
    setRespostas(atual => ({ ...atual, [afirmacao.id]: valor }))
    setEstado({ etapa: 'feedback', indice })
  }

  function proximo() {
    if (ultima) {
      void enviar(respostas)
      return
    }
    setEstado({ etapa: 'pergunta', indice: indice + 1 })
    topo.current?.scrollIntoView?.({ block: 'start' })
  }

  return (
    <div ref={topo} className="scroll-mt-4">
      <p className="text-base font-medium text-stone-600">
        Afirmação {indice + 1} de {TOTAL_AFIRMACOES}
      </p>
      <blockquote className="mt-3 text-2xl leading-snug font-semibold text-balance">{afirmacao.texto}</blockquote>
      <p className="mt-3 text-base text-stone-700">Quem disse: {afirmacao.autor}</p>
      <div className="mt-6 flex flex-col gap-3">
        {OPCOES.map(({ valor, rotulo, cor }) => (
          <button
            key={valor}
            type="button"
            disabled={etapa === 'feedback'}
            onClick={() => responder(valor)}
            className={`min-h-14 w-full rounded-xl border-2 px-4 py-3 text-lg font-bold tracking-wide transition-colors disabled:cursor-default ${
              etapa === 'feedback'
                ? respostaDada === valor
                  ? `border-transparent ${SELECIONADA[valor]}`
                  : 'border-stone-200 bg-stone-50 text-stone-400'
                : `bg-white ${cor}`
            } ${FOCO}`}
          >
            {rotulo}
          </button>
        ))}
      </div>
      {etapa === 'feedback' && respostaDada && (
        <Feedback
          key={afirmacao.id}
          afirmacao={afirmacao}
          respostaDada={respostaDada}
          erroPct={erroPorAfirmacao?.[afirmacao.id] ?? null}
          onProximo={proximo}
          ultima={ultima}
        />
      )}
    </div>
  )
}
