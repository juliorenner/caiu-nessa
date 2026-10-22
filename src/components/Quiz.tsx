'use client'

import { useEffect, useRef, useState } from 'react'
import { type Respostas, TOTAL_AFIRMACOES, type Veredito } from '@/lib/afirmacoes'
import type { RespostaResultado } from '@/lib/resultado-api'
import type { FaseCartao } from './CartaoAfirmacao'
import { PainelVeredito } from './PainelVeredito'
import { PilhaDeCartoes } from './PilhaDeCartoes'
import { ResultadoFinal } from './ResultadoFinal'
import { BOTAO_PRIMARIO, BOTAO_RESPOSTA, FOCO, ROTULO_BOTAO, TEXTO_SECUNDARIO } from './rotulos'
import type { AfirmacaoNoQuiz } from './tipos'

export type { AfirmacaoNoQuiz }

export interface QuizProps {
  afirmacoes: AfirmacaoNoQuiz[]
  erroPorAfirmacao: Record<string, number> | null
  // A ordem vem embaralhada do servidor; embaralhar aqui geraria hydration mismatch.
  embaralharFn?: (itens: AfirmacaoNoQuiz[]) => AfirmacaoNoQuiz[]
}

// respondendo: o cartão desliza carimbado antes do painel subir; saindo: painel fechado, cartão voando para fora.
type Estado =
  | { etapa: 'pergunta' | 'respondendo' | 'feedback' | 'saindo'; indice: number }
  | { etapa: 'enviando' }
  | { etapa: 'resultado'; dados: RespostaResultado }
  | { etapa: 'erro'; motivo: 'limite' | 'invalido' | 'falha' }

const DURACAO_MS = 300

const ORDEM_BOTOES: Veredito[] = ['verdadeiro', 'falso', 'enganoso']

const TECLAS: Record<string, Veredito> = { ArrowLeft: 'falso', ArrowUp: 'enganoso', ArrowRight: 'verdadeiro' }

const FASE_CARTAO: Record<'pergunta' | 'respondendo' | 'feedback' | 'saindo', FaseCartao> = {
  pergunta: 'ativo',
  respondendo: 'respondido',
  feedback: 'respondido',
  saindo: 'saindo',
}

export default function Quiz({ afirmacoes, erroPorAfirmacao, embaralharFn = x => x }: QuizProps) {
  const [ordem] = useState(() => embaralharFn(afirmacoes))
  const [estado, setEstado] = useState<Estado>({ etapa: 'pergunta', indice: 0 })
  const [respostas, setRespostas] = useState<Respostas>({})
  const [reduzirMovimento, setReduzirMovimento] = useState(false)
  const enviando = useRef(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const responderRef = useRef<(v: Veredito) => void>(() => {})
  const raiz = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setReduzirMovimento(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  // Sem dependências: depois de cada render, a tecla usa o responder com o estado atual.
  useEffect(() => {
    responderRef.current = responder
  })

  const naPergunta = estado.etapa === 'pergunta'
  useEffect(() => {
    if (!naPergunta) return
    // Na janela: as setas funcionam sem precisar focar o quiz antes.
    function aoTeclar(e: KeyboardEvent) {
      const veredito = TECLAS[e.key]
      if (!veredito || e.altKey || e.ctrlKey || e.metaKey) return
      e.preventDefault()
      responderRef.current(veredito)
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [naPergunta])

  // Sem movimento a transição é imediata; com movimento espera a animação do cartão.
  function depois(acao: () => void) {
    if (reduzirMovimento) {
      acao()
      return
    }
    temporizador.current = setTimeout(() => {
      temporizador.current = null
      acao()
    }, DURACAO_MS)
  }

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
        const motivo = resposta.status === 429 ? 'limite' : resposta.status === 400 ? 'invalido' : 'falha'
        setEstado({ etapa: 'erro', motivo })
        return
      }
      setEstado({ etapa: 'resultado', dados: (await resposta.json()) as RespostaResultado })
    } catch {
      setEstado({ etapa: 'erro', motivo: 'falha' })
    } finally {
      enviando.current = false
    }
  }

  if (estado.etapa === 'enviando') {
    return (
      <p role="status" className="px-4 py-16 text-center text-lg">
        Calculando seu resultado…
      </p>
    )
  }

  if (estado.etapa === 'resultado') {
    return (
      <div className="px-4 py-8">
        <ResultadoFinal dados={estado.dados} />
      </div>
    )
  }

  if (estado.etapa === 'erro') {
    // 400: reenviar as mesmas respostas daria o mesmo erro; o jeito é recomeçar.
    if (estado.motivo === 'invalido') {
      return (
        <div role="alert" className="flex flex-col gap-5 px-4 py-10 text-center">
          <p className="text-lg">Não conseguimos salvar seu resultado.</p>
          <a href="/quiz" className={BOTAO_PRIMARIO}>
            Jogar de novo
          </a>
        </div>
      )
    }
    return (
      <div role="alert" className="flex flex-col gap-5 px-4 py-10 text-center">
        <p className="text-lg">
          {estado.motivo === 'limite'
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
  const respostaDada = respostas[afirmacao.id] ?? null
  const ultima = indice === ordem.length - 1
  const respondidas = Object.keys(respostas).length
  const acertos = ordem.filter(a => respostas[a.id] === a.veredito).length
  const marcada = etapa === 'respondendo' || etapa === 'feedback'

  // A resposta entra no mesmo render que muda a fase do cartão: a transição parte de onde o dedo soltou.
  function responder(valor: Veredito) {
    if (etapa !== 'pergunta') return
    setRespostas(atual => ({ ...atual, [afirmacao.id]: valor }))
    setEstado({ etapa: 'respondendo', indice })
    depois(() => setEstado({ etapa: 'feedback', indice }))
  }

  function fechar() {
    if (etapa !== 'feedback') return
    // O botão do painel vai sumir: o foco volta para o quiz em vez de cair no body.
    raiz.current?.focus({ preventScroll: true })
    const seguir = () => (ultima ? void enviar(respostas) : setEstado({ etapa: 'pergunta', indice: indice + 1 }))
    if (reduzirMovimento) {
      seguir()
      return
    }
    setEstado({ etapa: 'saindo', indice })
    depois(seguir)
  }

  function classeBotao(v: Veredito) {
    const estilo = BOTAO_RESPOSTA[v]
    if (!marcada) return estilo.base
    return respostaDada === v ? estilo.destaque : `${estilo.base} ${estilo.esmaecido}`
  }

  return (
    <div
      ref={raiz}
      tabIndex={-1}
      className="box-border flex h-dvh flex-col overflow-y-auto overscroll-contain px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none"
    >
      <div data-conteudo inert={etapa === 'feedback' ? true : undefined} className="flex flex-1 flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-base font-medium ${TEXTO_SECUNDARIO}`}>
            Afirmação {indice + 1} de {TOTAL_AFIRMACOES}
          </p>
          {respondidas > 0 && (
            <span
              data-contador
              className="rounded-full bg-stone-900 px-3 py-1 text-base font-bold text-white dark:bg-stone-100 dark:text-stone-900"
            >
              {acertos} de {respondidas} ✔
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label="Progresso"
          aria-valuenow={indice + 1}
          aria-valuemin={0}
          aria-valuemax={TOTAL_AFIRMACOES}
          className="h-1.5 w-full overflow-hidden rounded-full bg-stone-300 dark:bg-stone-700"
        >
          <div
            className="h-full rounded-full bg-stone-900 dark:bg-stone-100"
            style={{ width: `${((indice + 1) / TOTAL_AFIRMACOES) * 100}%` }}
          />
        </div>
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <PilhaDeCartoes
              atual={afirmacao}
              proxima={ordem[indice + 1] ?? null}
              fase={FASE_CARTAO[etapa]}
              respostaDada={respostaDada}
              onResposta={responder}
              reduzirMovimento={reduzirMovimento}
            />
          </div>
        </div>
        <p aria-hidden className={`${TEXTO_SECUNDARIO} text-center text-sm`}>
          ← mentira · ↑ cheira mal · verdade →
        </p>
        <div className="flex flex-col gap-2">
          {ORDEM_BOTOES.map(v => (
            <button
              key={v}
              type="button"
              aria-disabled={etapa === 'pergunta' ? undefined : true}
              onClick={() => responder(v)}
              className={`min-h-12 w-full rounded-xl px-4 text-base font-bold transition-[opacity,box-shadow] ${FOCO} ${classeBotao(v)}`}
            >
              {ROTULO_BOTAO[v]}
            </button>
          ))}
        </div>
      </div>
      {etapa === 'feedback' && respostaDada && (
        <PainelVeredito
          key={afirmacao.id}
          afirmacao={afirmacao}
          respostaDada={respostaDada}
          erroPct={erroPorAfirmacao?.[afirmacao.id] ?? null}
          ultima={ultima}
          onFechar={fechar}
          reduzirMovimento={reduzirMovimento}
        />
      )}
    </div>
  )
}
