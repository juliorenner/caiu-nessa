'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { slugDaFaixa, urlDoCartao, type Casa } from '@/lib/cartao'
import { NOME_ARQUIVO, textoDeCompartilhar } from '@/lib/compartilhar'
import { buscarArquivo, compartilhar } from '@/lib/compartilhar-navegador'
import type { RespostaResultado } from '@/lib/resultado-api'
import { SITE_URL, TITULO } from '@/lib/site'
import { Ficha } from './Ficha'
import { Politico } from './icones/Politico'
import { MarcaDagua } from './MarcaDagua'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, LINK_PAGINA, TEXTO_SECUNDARIO } from './rotulos'

// Número grande do placar: letreiro com sombra em camadas (papel e tinta; trocam no escuro).
const NUMERO_PLACAR =
  'font-letreiro text-[clamp(56px,18vw,72px)] leading-none text-tinta dark:text-papel [text-shadow:4px_4px_0_var(--color-papel),6px_6px_0_var(--color-tinta)] dark:[text-shadow:4px_4px_0_var(--color-tinta),6px_6px_0_var(--color-papel)]'

// Carimbo tinta da avaliação: não é cor de veredito, a faixa não é juízo de valor colorido.
const CARIMBO_AVALIACAO =
  'font-letreiro text-base border-[3px] border-tinta dark:border-papel rounded-md -rotate-3 inline-block px-3 pt-1.5 pb-1'

type EstadoContinuar = 'parado' | 'sorteando' | 'fim' | 'falha'

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
  const texto = textoDeCompartilhar(placar)
  const urlCartao = urlDoCartao({ ...placar, faixa: slugDaFaixa(avaliacao.titulo) })
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [aviso, setAviso] = useState<'copiado' | 'falhou' | null>(null)
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

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    },
    [],
  )

  // Síncrono até o share: usa a imagem que já chegou, sem esperar a que falta.
  function aoCompartilhar() {
    void compartilhar({ texto, url: SITE_URL, titulo: TITULO, arquivo }).then(desfecho => {
      // A folha abriu: um aviso de toque anterior já não vale.
      if (desfecho === 'folha') {
        if (temporizador.current) clearTimeout(temporizador.current)
        temporizador.current = null
        setAviso(null)
      }
      if (desfecho !== 'copiado' && desfecho !== 'falhou') return
      // A folha recusou o arquivo (ex.: NotAllowedError no Android): o próximo toque vai direto para texto + link.
      if (arquivo) setArquivo(null)
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = null
      setAviso(desfecho)
      if (desfecho === 'copiado') temporizador.current = setTimeout(() => setAviso(null), 2000)
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
    <>
      {/* Antes do section e fora dele: a marca (fixed z-0) fica atrás do placar (relative z-10). */}
      <MarcaDagua posicao="canto">
        <Politico className="w-full" />
      </MarcaDagua>
      <section aria-live="polite" className="relative z-10 flex flex-col gap-5 text-center text-tinta dark:text-papel">
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
          <span className={CARIMBO_AVALIACAO}>{avaliacao.titulo}</span>
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
        <button type="button" onClick={aoCompartilhar} className={BOTAO_PRIMARIO}>
          Compartilhar placar
        </button>
        <a download={NOME_ARQUIVO} href={urlCartao} className={`self-center text-base ${LINK_PAGINA}`}>
          Baixar imagem para os stories
        </a>
        <p aria-live="polite" className="text-base">
          {aviso === 'copiado' ? 'Texto copiado' : aviso === 'falhou' ? 'Não deu para copiar' : ''}
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
    </>
  )
}
