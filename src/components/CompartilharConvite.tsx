'use client'

import { useEffect, useRef, useState } from 'react'
import { NOME_ARQUIVO_CONVITE, textoDeChamado, urlDoWhatsApp } from '@/lib/compartilhar'
import { buscarArquivo, compartilhar } from '@/lib/compartilhar-navegador'
import type { MODOS_DE_COMPARTILHAR, RESULTADOS_DE_COMPARTILHAR } from '@/lib/eventos'
import { registrarEvento } from '@/lib/eventos-navegador'
import { SITE_URL, TITULO } from '@/lib/site'
import { LinhaDeCompartilhar } from './LinhaDeCompartilhar'

const URL_IMAGEM = '/convite'
const URL_CONVITE = `${SITE_URL}/jogue`

type Aviso = 'copiado' | 'falhou' | 'carregando' | 'imagemFalhou' | 'imagemNaoCarregou'

const TEXTO_AVISO: Record<Aviso, string> = {
  copiado: 'Texto copiado',
  falhou: 'Não deu para copiar',
  carregando: 'Imagem ainda carregando…',
  imagemFalhou: 'Não deu para mandar a imagem',
  imagemNaoCarregou: 'Não deu para carregar a imagem. Tente o link de baixar.',
}

// Compartilhar da home: só o convite (sem placar), e sem mostrar o cartão. O link é /jogue, cuja
// prévia no WhatsApp já é a arte do convite.
export function CompartilharConvite() {
  // undefined = carregando, null = a busca falhou.
  const [arquivo, setArquivo] = useState<File | null | undefined>(undefined)
  // Só no navegador: no servidor (e até montar) o botão do Instagram não aparece.
  const [aceitaArquivos, setAceitaArquivos] = useState(false)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let aceita = false
    try {
      aceita = navigator.canShare?.({ files: [new File([''], 'x.png', { type: 'image/png' })] }) ?? false
    } catch {
      // Qualquer erro: sem o botão do Instagram; Baixar continua.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- navigator só existe no cliente; ler no render divergiria da hidratação
    setAceitaArquivos(aceita)
    // Só quem pode mandar o arquivo busca a imagem; ao montar, não no toque (o share precisa do toque "fresco").
    if (!aceita) return
    let montado = true
    void buscarArquivo(URL_IMAGEM, NOME_ARQUIVO_CONVITE).then(f => {
      if (!montado) return
      setArquivo(f)
      if (f) setAviso(atual => (atual === 'carregando' ? null : atual))
    })
    return () => {
      montado = false
    }
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

  function registrar(modo: (typeof MODOS_DE_COMPARTILHAR)[number], resultado: (typeof RESULTADOS_DE_COMPARTILHAR)[number]) {
    registrarEvento({ tipo: 'compartilhar', dados: { modo, resultado, cartao: 'convite', tela: 'home' } })
  }

  function aoCompartilhar(modo: 'link' | 'imagem') {
    void compartilhar({
      modo,
      texto: textoDeChamado(),
      textoComUrl: textoDeChamado(URL_CONVITE),
      url: URL_CONVITE,
      titulo: TITULO,
      arquivo: arquivo ?? null,
    }).then(desfecho => {
      registrar(modo, desfecho)
      if (desfecho === 'folha') mostrar(null)
      else if (desfecho === 'copiado') mostrar('copiado')
      else if (desfecho === 'indisponivel') mostrar(arquivo === null ? 'imagemNaoCarregou' : 'carregando')
      else if (desfecho === 'falhou') mostrar(modo === 'imagem' ? 'imagemFalhou' : 'falhou')
    })
  }

  return (
    <div className="flex flex-col gap-1 text-center lg:text-left">
      <LinhaDeCompartilhar
        urlWhatsApp={urlDoWhatsApp(textoDeChamado(URL_CONVITE))}
        onWhatsApp={() => registrar('whatsapp', 'clique')}
        onInstagram={aceitaArquivos ? () => aoCompartilhar('imagem') : undefined}
        urlImagem={URL_IMAGEM}
        nomeArquivo={NOME_ARQUIVO_CONVITE}
        onBaixar={() => registrar('baixar', 'clique')}
        onMais={() => aoCompartilhar('link')}
      />
      <p aria-live="polite" className="min-h-6 text-base">
        {aviso ? TEXTO_AVISO[aviso] : ''}
      </p>
    </div>
  )
}
