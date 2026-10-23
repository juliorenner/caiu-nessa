'use client'

import { useEffect, useRef, useState } from 'react'
import type { Respostas, Veredito } from '@/lib/afirmacoes'
import { ehQuase } from '@/lib/pontuacao'
import type { RespostaResultado } from '@/lib/resultado-api'
import { somLigado, tocarSomDaUrna } from '@/lib/som-urna'
import type { FaseCartao } from './CartaoAfirmacao'
import { PainelVeredito } from './PainelVeredito'
import { PilhaDeCartoes } from './PilhaDeCartoes'
import { ResultadoFinal } from './ResultadoFinal'
import { CarimbosDeProgresso } from './CarimbosDeProgresso'
import { Ficha } from './Ficha'
import { IconeVeredito } from './IconeVeredito'
import { Urna } from './icones/Urna'
import { ARIA_BOTAO_RESPOSTA, BOTAO_EM_CARTAO, BOTAO_RESPOSTA, FOCO, ROTULO_BOTAO, SUPERFICIE } from './rotulos'
import type { AfirmacaoNoQuiz } from './tipos'

export type { AfirmacaoNoQuiz }

export interface RodadaFeita {
  ids: string[]
  acertos: number
  total: number
}

export interface QuizProps {
  afirmacoes: AfirmacaoNoQuiz[]
  erroPorAfirmacao: Record<string, number> | null
  // A ordem vem embaralhada do servidor; embaralhar aqui geraria hydration mismatch.
  embaralharFn?: (itens: AfirmacaoNoQuiz[]) => AfirmacaoNoQuiz[]
  rodada: number
  // Placar das rodadas anteriores desta partida.
  acumuladoAnterior: { acertos: number; total: number }
  onContinuar: (feita: RodadaFeita) => Promise<'ok' | 'fim' | 'falha'>
}

// respondendo: o cartão desliza carimbado antes do painel subir; saindo: painel fechado, cartão voando para fora.
type Estado =
  | { etapa: 'pergunta' | 'respondendo' | 'feedback' | 'saindo'; indice: number }
  | { etapa: 'enviando' }
  | { etapa: 'resultado'; dados: RespostaResultado }
  | { etapa: 'erro'; motivo: 'limite' | 'invalido' | 'falha' }

const DURACAO_MS = 300

// Na ordem dos gestos: esquerda, cima, direita.
const ORDEM_BOTOES: Veredito[] = ['falso', 'enganoso', 'verdadeiro']

const doisDigitos = (n: number) => String(n).padStart(2, '0')

const TECLAS: Record<string, Veredito> = { ArrowLeft: 'falso', ArrowUp: 'enganoso', ArrowRight: 'verdadeiro' }

const FASE_CARTAO: Record<'pergunta' | 'respondendo' | 'feedback' | 'saindo', FaseCartao> = {
  pergunta: 'ativo',
  respondendo: 'respondido',
  feedback: 'respondido',
  saindo: 'saindo',
}

export default function Quiz({
  afirmacoes,
  erroPorAfirmacao,
  embaralharFn = x => x,
  rodada,
  acumuladoAnterior,
  onContinuar,
}: QuizProps) {
  const [ordem] = useState(() => embaralharFn(afirmacoes))
  const [estado, setEstado] = useState<Estado>({ etapa: 'pergunta', indice: 0 })
  const [respostas, setRespostas] = useState<Respostas>({})
  const [reduzirMovimento, setReduzirMovimento] = useState(false)
  const enviando = useRef(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const responderRef = useRef<(v: Veredito) => void>(() => {})
  const raiz = useRef<HTMLDivElement>(null)
  // Trava síncrona: duas entradas no mesmo tick (toque + tecla) não passam ambas pela checagem de etapa.
  const respondeu = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- matchMedia só existe no cliente; ler no render divergiria da hidratação
    setReduzirMovimento(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false)
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  // Rodada extra: o botão "Continuar jogando" sumiu com a tela de resultado; o foco vem para o quiz em vez de cair no body.
  useEffect(() => {
    if (rodada > 1) raiz.current?.focus({ preventScroll: true })
  }, [rodada])

  // Sem dependências: depois de cada render, a tecla usa o responder com o estado atual.
  useEffect(() => {
    responderRef.current = responder
  })

  const naPergunta = estado.etapa === 'pergunta'
  useEffect(() => {
    if (naPergunta) respondeu.current = false
  }, [naPergunta])
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
      <div role="status" className="px-4 py-16">
        <Ficha esquerda="Calculando seu resultado…" />
      </div>
    )
  }

  if (estado.etapa === 'resultado') {
    const { resultado } = estado.dados
    return (
      <div className="px-4 py-8">
        <ResultadoFinal
          dados={estado.dados}
          rodada={rodada}
          acumulado={{
            acertos: acumuladoAnterior.acertos + resultado.acertos,
            total: acumuladoAnterior.total + resultado.total,
          }}
          casas={ordem.map(a =>
            respostas[a.id] === a.veredito ? 'acerto' : ehQuase(a.veredito, respostas[a.id]) ? 'quase' : 'erro',
          )}
          onContinuar={() => onContinuar({ ids: ordem.map(a => a.id), acertos: resultado.acertos, total: resultado.total })}
        />
      </div>
    )
  }

  if (estado.etapa === 'erro') {
    // 400: reenviar as mesmas respostas daria o mesmo erro; o jeito é recomeçar.
    if (estado.motivo === 'invalido') {
      return (
        <div role="alert" className={`mx-4 my-10 flex flex-col gap-5 p-5 text-center ${SUPERFICIE}`}>
          <p className="text-lg">Não conseguimos salvar seu resultado.</p>
          <a href="/quiz" className={BOTAO_EM_CARTAO}>
            Jogar de novo
          </a>
        </div>
      )
    }
    return (
      <div role="alert" className={`mx-4 my-10 flex flex-col gap-5 p-5 text-center ${SUPERFICIE}`}>
        <p className="text-lg">
          {estado.motivo === 'limite'
            ? 'Calma aí: muitas jogadas em pouco tempo. Tente de novo em um minuto.'
            : 'Não conseguimos salvar seu resultado. Tente de novo.'}
        </p>
        <button type="button" onClick={() => enviar(respostas)} className={BOTAO_EM_CARTAO}>
          Tentar de novo
        </button>
      </div>
    )
  }

  const { indice, etapa } = estado
  const afirmacao = ordem[indice]
  const respostaDada = respostas[afirmacao.id] ?? null
  const ultima = indice === ordem.length - 1
  // O contador só muda quando o painel revela o veredito, não enquanto o cartão ainda desliza.
  const contadas = ordem.filter(a => a.id in respostas && !(etapa === 'respondendo' && a.id === afirmacao.id))
  const acertos = contadas.filter(a => respostas[a.id] === a.veredito).length
  const estados = ordem.map(a => {
    if (!contadas.includes(a)) return null
    return respostas[a.id] === a.veredito ? ('acerto' as const) : ('erro' as const)
  })
  const marcada = etapa === 'respondendo' || etapa === 'feedback'

  // A resposta entra no mesmo render que muda a fase do cartão: a transição parte de onde o dedo soltou.
  function responder(valor: Veredito) {
    if (etapa !== 'pergunta' || respondeu.current) return
    respondeu.current = true
    setRespostas(atual => ({ ...atual, [afirmacao.id]: valor }))
    setEstado({ etapa: 'respondendo', indice })
    depois(() => setEstado({ etapa: 'feedback', indice }))
  }

  function fechar() {
    if (etapa !== 'feedback') return
    // Ainda dentro do gesto: depois do atraso do `depois`, o iOS bloquearia o som.
    if (ultima && somLigado()) tocarSomDaUrna()
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
      className="box-border flex h-dvh flex-col overflow-x-hidden overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none"
    >
      <div
        data-conteudo
        inert={etapa === 'feedback' ? true : undefined}
        className={`flex flex-1 flex-col gap-3 ${etapa === 'feedback' ? '[filter:brightness(.75)_saturate(.6)]' : ''}`}
      >
        <Ficha
          icone={<Urna className="size-[18px]" />}
          esquerda={
            // A posição é lida pelo sr-only "Afirmação n de N" logo abaixo: aqui não anuncia de novo.
            <>
              {rodada > 1 && <span className="font-sans text-[11px] font-bold uppercase">Rodada {rodada} · </span>}
              <span aria-hidden>Ficha {doisDigitos(indice + 1)}/{doisDigitos(ordem.length)}</span>
            </>
          }
          direita={<span data-contador>{`Placar ${doisDigitos(acertos)}`}</span>}
        />
        <p className="sr-only">
          Afirmação {indice + 1} de {ordem.length}
        </p>
        <CarimbosDeProgresso total={ordem.length} atual={indice} estados={estados} />
        {/* O cartão ocupa toda a altura que sobra entre o progresso e os botões: sem vazio em telas altas. */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col">
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
        <p className="sr-only">Use as setas: esquerda é mentira, cima é cheira mal, direita é verdade.</p>
        <div className="grid grid-cols-3 gap-2.5">
          {ORDEM_BOTOES.map(v => (
            <button
              key={v}
              type="button"
              aria-label={ARIA_BOTAO_RESPOSTA[v]}
              aria-disabled={etapa === 'pergunta' ? undefined : true}
              onClick={() => responder(v)}
              className={`flex min-h-14 flex-col items-center justify-center gap-2 px-1 py-2 text-[11px] leading-tight ${FOCO} ${classeBotao(v)}`}
            >
              <IconeVeredito veredito={v} />
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
