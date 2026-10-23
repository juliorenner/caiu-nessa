'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { slugDaFaixa, urlDoCartao, urlDoResultado, type Casa } from '@/lib/cartao'
import { NOME_ARQUIVO, textoDeCompartilhar } from '@/lib/compartilhar'
import { buscarArquivo, compartilhar } from '@/lib/compartilhar-navegador'
import type { RespostaResultado } from '@/lib/resultado-api'
import { SITE_URL, TITULO } from '@/lib/site'
import { Ficha } from './Ficha'
import {
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CARIMBO_FAIXA,
  LINK_PAGINA,
  NUMERO_PLACAR,
  TEXTO_SECUNDARIO,
} from './rotulos'

type EstadoContinuar = 'parado' | 'sorteando' | 'fim' | 'falha'
type Aviso = 'copiado' | 'falhou' | 'carregando' | 'imagemFalhou'

const TEXTO_AVISO: Record<Aviso, string> = {
  copiado: 'Texto copiado',
  falhou: 'Não deu para copiar',
  carregando: 'Imagem ainda carregando…',
  imagemFalhou: 'Não deu para mandar a imagem',
}

export function ResultadoFinal(p: {
  dados: RespostaResultado
  rodada: number
  acumulado: { acertos: number; total: number }
  // Uma casa por afirmação, na ordem jogada.
  casas: Casa[]
  onContinuar: () => Promise<'ok' | 'fim' | 'falha'>
}) {
  const { resultado, avaliacao, estatisticas, percentilAbaixo, estatisticasIndisponiveis } = p.dados
  const [continuar, setContinuar] = useState<EstadoContinuar>('parado')
  // Números da rodada corrente, não da partida.
  const placar = {
    acertos: resultado.acertos,
    total: resultado.total,
    caiu: resultado.acreditadasEsquerda + resultado.acreditadasDireita,
    casas: p.casas,
  }
  const faixa = slugDaFaixa(avaliacao.titulo)
  const urlResultado = `${SITE_URL}${urlDoResultado({ ...placar, faixa })}`
  const texto = textoDeCompartilhar(placar)
  const textoComUrl = textoDeCompartilhar({ ...placar, url: urlResultado })
  const urlCartao = urlDoCartao({ ...placar, faixa })
  const [arquivo, setArquivo] = useState<File | null>(null)
  // Só no navegador: no servidor (e até montar) o botão dos stories não aparece.
  const [aceitaArquivos, setAceitaArquivos] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Busca a imagem ao montar, não no toque: esperar um fetch depois do toque faz o share falhar.
  useEffect(() => {
    let montado = true
    void buscarArquivo(urlCartao, NOME_ARQUIVO).then(f => {
      if (montado) setArquivo(f)
    })
    return () => {
      montado = false
    }
  }, [urlCartao])

  useEffect(() => {
    let aceita = false
    try {
      aceita = navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }) ?? false
    } catch {
      // Qualquer erro: sem o botão dos stories; Baixar imagem continua.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- navigator só existe no cliente; ler no render divergiria da hidratação
    setAceitaArquivos(aceita)
  }, [])

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    },
    [],
  )

  function mostrar(novo: Aviso | null) {
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = null
    setAviso(novo)
    if (novo === 'copiado') temporizador.current = setTimeout(() => setAviso(null), 2000)
  }

  // Síncrono até o share: usa a imagem que já chegou, sem esperar a que falta.
  function aoCompartilhar(modo: 'link' | 'imagem') {
    void compartilhar({ modo, texto, textoComUrl, url: urlResultado, titulo: TITULO, arquivo }).then(desfecho => {
      // A folha abriu: um aviso de toque anterior já não vale.
      if (desfecho === 'folha') mostrar(null)
      else if (desfecho === 'copiado') mostrar('copiado')
      else if (desfecho === 'indisponivel') mostrar('carregando')
      else if (desfecho === 'falhou') mostrar(modo === 'imagem' ? 'imagemFalhou' : 'falhou')
    })
  }

  async function aoContinuar() {
    if (continuar === 'sorteando') return
    setContinuar('sorteando')
    const desfecho = await p.onContinuar()
    // 'ok' remonta o quiz; aqui só sobram fim e falha.
    if (desfecho !== 'ok') setContinuar(desfecho)
  }

  return (
    <section aria-live="polite" className="flex flex-col gap-5 text-center text-tinta dark:text-papel">
      <Ficha esquerda="Fim de jogo" direita={`Rodada ${p.rodada}`} />
      <div className="flex flex-col items-center gap-3">
        <p className="font-letreiro text-[13px]">Placar</p>
        {/* A barra fica só na tela; o leitor de tela ouve "4 de 12", não "4 barra 12". */}
        <p data-placar aria-hidden className={NUMERO_PLACAR}>
          {resultado.acertos}/{resultado.total}
        </p>
        <p className="sr-only">
          {resultado.acertos} de {resultado.total}
        </p>
        {p.rodada > 1 && (
          <>
            <p aria-hidden className="font-letreiro text-base">
              Na partida {p.acumulado.acertos}/{p.acumulado.total}
            </p>
            <p className="sr-only">
              Na partida: {p.acumulado.acertos} de {p.acumulado.total}
            </p>
          </>
        )}
      </div>
      <h1>
        <span className={CARIMBO_FAIXA}>{avaliacao.titulo}</span>
      </h1>
      <p className="text-lg leading-relaxed">{avaliacao.texto}</p>
      {avaliacao.vies !== null && <p className={`text-base leading-relaxed ${TEXTO_SECUNDARIO}`}>{avaliacao.vies}</p>}
      {/* A comparação com os outros jogadores só existe para a rodada de 12. Papel é claro nos dois temas. */}
      {p.rodada === 1 && (
        <p className="border-[3px] border-tinta bg-papel p-4 text-base text-tinta">
          {estatisticasIndisponiveis
            ? 'A comparação com os outros jogadores não está disponível agora.'
            : estatisticas
            ? `Você acertou mais que ${percentilAbaixo ?? 0}% das pessoas.`
            : 'Você é um dos primeiros a jogar. A comparação com os outros aparece a partir de 100 jogadas.'}
        </p>
      )}
      <button type="button" onClick={() => aoCompartilhar('link')} className={BOTAO_PRIMARIO}>
        Compartilhar placar
      </button>
      {aceitaArquivos && (
        <button type="button" onClick={() => aoCompartilhar('imagem')} className={BOTAO_SECUNDARIO}>
          Mandar para os stories
        </button>
      )}
      <a download={NOME_ARQUIVO} href={urlCartao} className={`self-center text-base ${LINK_PAGINA}`}>
        Baixar imagem para os stories
      </a>
      <p aria-live="polite" className="text-base">
        {aviso ? TEXTO_AVISO[aviso] : ''}
      </p>
      {continuar === 'falha' && (
        <p role="alert" className="text-base">
          Não deu para sortear. Tente de novo.
        </p>
      )}
      {continuar === 'fim' ? (
        <p className="text-lg">Acabaram as afirmações por enquanto. Volte depois: a lista cresce.</p>
      ) : (
        <button
          type="button"
          onClick={aoContinuar}
          disabled={continuar === 'sorteando'}
          aria-busy={continuar === 'sorteando' ? true : undefined}
          className={BOTAO_SECUNDARIO}
        >
          {continuar === 'sorteando' ? 'Sorteando…' : 'Continuar jogando'}
        </button>
      )}
      {/* Recarrega a página: nova partida, novo sorteio e estatísticas atualizadas. */}
      <a href="/quiz" className={`self-center text-base ${LINK_PAGINA}`}>
        Jogar de novo
      </a>
      <Link
        href="/como-escolhemos"
        className={`self-center text-base ${LINK_PAGINA}`}
      >
        Como escolhemos as afirmações
      </Link>
      <Link
        href="/afirmacoes"
        className={`self-center text-base ${LINK_PAGINA}`}
      >
        Ver todas as afirmações e suas fontes
      </Link>
    </section>
  )
}
