'use client'

import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { MAX_CONTEXTO, MAX_DESCRICAO, MIN_DESCRICAO, normalizarLink, TELAS } from '@/lib/contribuicao'
import { fonteEhPermitida } from '@/lib/fontes'
import { URL_REPOSITORIO } from '@/lib/site'
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, FOCO, LINK_EM_CARTAO, LINK_PAGINA, SUPERFICIE } from './rotulos'

export type TipoContribuicao = 'sugestao' | 'problema'

export const AGENCIAS = ['Aos Fatos', 'Lupa', 'Comprova', 'G1 Fato ou Fake', 'Estadão Verifica'] as const

type Estado =
  | { fase: 'editando'; erro: string | null }
  | { fase: 'enviando' }
  | { fase: 'enviado'; numero: number; url: string }
  | { fase: 'falhou'; status: number }

const CAMPO = `w-full rounded-none border-[3px] border-tinta bg-superficie px-3.5 py-3 text-[17px] text-tinta dark:border-papel ${FOCO}`
const ROTULO = 'mb-2 flex items-baseline justify-between gap-3 font-letreiro text-[13px]'
const OPCIONALIDADE = 'font-sans text-sm font-bold normal-case text-secundario dark:text-secundario-escuro'
const MENSAGEM =
  'flex items-start gap-3 border-[3px] border-l-[10px] border-tinta bg-papel px-3.5 py-3 text-base text-tinta dark:border-papel'

function Mensagem({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div id={id} role="alert" className={MENSAGEM}>
      <span aria-hidden className="flex size-[26px] shrink-0 items-center justify-center bg-tinta font-letreiro text-papel">
        !
      </span>
      <div>{children}</div>
    </div>
  )
}

function erroDoLink(url: string): string | null {
  if (!url.trim()) return 'Cole o link da checagem. Ele é obrigatório.'
  const valor = normalizarLink(url)
  try {
    if (!new URL(valor).hostname.includes('.')) throw new Error('sem domínio')
  } catch {
    return 'Isso não parece um link. Cole o endereço da checagem, por exemplo aosfatos.org/noticias/…'
  }
  if (!fonteEhPermitida(valor)) return `Esse link não é de uma checagem aceita. Cole o link de: ${AGENCIAS.join(', ')}.`
  return null
}

// Formulário de sugestão de afirmação ou de relato de problema. O servidor cria a issue pública no GitHub
// (POST /api/contribuicao); aqui só validamos o que dá para validar antes, com mensagens claras.
export function FormularioContribuicao({ tipo }: { tipo: TipoContribuicao }) {
  const [url, setUrl] = useState('')
  const [contexto, setContexto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [tela, setTela] = useState('')
  // Campo-armadilha: escondido de pessoas; robôs costumam preencher.
  const [site, setSite] = useState('')
  const [estado, setEstado] = useState<Estado>({ fase: 'editando', erro: null })

  async function aoEnviar(e: FormEvent) {
    e.preventDefault()
    if (estado.fase === 'enviando') return
    const erro = tipo === 'sugestao' ? erroDoLink(url) : descricao.trim().length < MIN_DESCRICAO ? `Conte o que aconteceu, com pelo menos ${MIN_DESCRICAO} letras, para a gente conseguir reproduzir.` : null
    if (erro) {
      setEstado({ fase: 'editando', erro })
      return
    }
    const corpo =
      tipo === 'sugestao'
        ? { tipo, url: normalizarLink(url), ...(contexto.trim() ? { contexto: contexto.trim() } : {}), site }
        : { tipo, descricao: descricao.trim(), ...(tela ? { tela } : {}), site }
    setEstado({ fase: 'enviando' })
    try {
      const resposta = await fetch('/api/contribuicao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      })
      if (resposta.status === 201) {
        const issue = (await resposta.json()) as { numero: number; url: string }
        setEstado({ fase: 'enviado', numero: issue.numero, url: issue.url })
      } else setEstado({ fase: 'falhou', status: resposta.status })
    } catch {
      setEstado({ fase: 'falhou', status: 0 })
    }
  }

  function deNovo() {
    setUrl('')
    setContexto('')
    setDescricao('')
    setTela('')
    setEstado({ fase: 'editando', erro: null })
  }

  if (estado.fase === 'enviado') {
    return (
      <div className={`${SUPERFICIE} grid justify-items-start gap-4 px-5 py-6`}>
        <span className="-rotate-[8deg] rounded-md border-4 border-tinta px-3.5 pt-1.5 pb-1 font-letreiro text-[22px]">
          Enviado
        </span>
        <h2 className="font-letreiro text-[22px] leading-tight">
          {tipo === 'sugestao' ? 'Obrigado pela sugestão' : 'Obrigado por avisar'}
        </h2>
        <p role="status" className="text-[17px] leading-relaxed">
          {tipo === 'sugestao' ? (
            <>
              Sua sugestão virou a issue pública <b>#{estado.numero}</b> no GitHub, com o rótulo “sugestão”. A gente confere a
              checagem antes de qualquer afirmação entrar no jogo.
            </>
          ) : (
            <>
              Seu relato virou a issue pública <b>#{estado.numero}</b> no GitHub, com o rótulo “bug”. A gente lê e responde por lá.
            </>
          )}
        </p>
        <a href={estado.url} target="_blank" rel="noopener noreferrer" className={LINK_EM_CARTAO}>
          Ver a issue no GitHub ↗
        </a>
        <div className="mt-1.5 grid w-full gap-3.5">
          <button type="button" onClick={deNovo} className={BOTAO_SECUNDARIO}>
            {tipo === 'sugestao' ? 'Sugerir outra' : 'Reportar outro'}
          </button>
          <Link href="/" className={BOTAO_PRIMARIO}>
            Voltar ao jogo
          </Link>
        </div>
      </div>
    )
  }

  const enviando = estado.fase === 'enviando'
  const erro = estado.fase === 'editando' ? estado.erro : null
  return (
    <form onSubmit={aoEnviar} noValidate className="grid gap-5">
      {tipo === 'sugestao' ? (
        <>
          <div>
            <label htmlFor="url" className={ROTULO}>
              <span>Link da checagem</span>
              <small className={OPCIONALIDADE}>obrigatório</small>
            </label>
            <input
              id="url"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="off"
              placeholder="aosfatos.org/noticias/…"
              value={url}
              onChange={e => setUrl(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby="url-ajuda"
              className={`${CAMPO} ${erro ? 'border-4 border-dashed' : ''}`}
            />
            <div id="url-ajuda" className="mt-2">
              {erro ? (
                <Mensagem>{erro}</Mensagem>
              ) : (
                <p className="text-[15px] text-secundario dark:text-secundario-escuro">
                  Só aceitamos checagens de: {AGENCIAS.join(', ')}.
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="contexto" className={ROTULO}>
              <span>Contexto</span>
              <small className={OPCIONALIDADE}>opcional</small>
            </label>
            <textarea
              id="contexto"
              name="contexto"
              rows={3}
              maxLength={MAX_CONTEXTO}
              placeholder={`Quem disse e onde, se ajudar. Até ${MAX_CONTEXTO} caracteres.`}
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              className={`${CAMPO} resize-y`}
            />
            <p aria-hidden className="mt-1 text-right text-[13px] font-bold text-secundario dark:text-secundario-escuro">
              {contexto.length}/{MAX_CONTEXTO}
            </p>
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="descricao" className={ROTULO}>
              <span>O que aconteceu?</span>
              <small className={OPCIONALIDADE}>obrigatório</small>
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows={5}
              maxLength={MAX_DESCRICAO}
              placeholder="O que você fez, o que esperava e o que viu."
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? 'descricao-erro' : undefined}
              className={`${CAMPO} resize-y ${erro ? 'border-4 border-dashed' : ''}`}
            />
            <p aria-hidden className="mt-1 text-right text-[13px] font-bold text-secundario dark:text-secundario-escuro">
              {descricao.length}/{MAX_DESCRICAO}
            </p>
            {erro && <Mensagem id="descricao-erro">{erro}</Mensagem>}
          </div>
          <div>
            <label htmlFor="tela" className={ROTULO}>
              <span>Em qual tela?</span>
              <small className={OPCIONALIDADE}>opcional</small>
            </label>
            <select id="tela" name="tela" value={tela} onChange={e => setTela(e.target.value)} className={CAMPO}>
              <option value="">Não sei</option>
              {TELAS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site">Não preencha este campo</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" value={site} onChange={e => setSite(e.target.value)} />
      </div>
      <div className="flex gap-3 border-[3px] border-tinta bg-superficie px-3.5 py-3 text-[15px] text-tinta dark:border-papel">
        <span aria-hidden className="flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 border-tinta font-letreiro text-sm">
          i
        </span>
        <p>
          O que você escrever vira uma <b>issue pública no GitHub</b> (rótulo “{tipo === 'sugestao' ? 'sugestão' : 'bug'}”). Não
          pedimos nome nem e-mail: não escreva dados pessoais.
        </p>
      </div>
      {estado.fase === 'falhou' && (
        <Mensagem>
          <b>{estado.status === 429 ? 'Muitos envios seguidos.' : 'Não deu para enviar agora.'}</b> Seu texto continua aqui.
          Tente de novo em instantes. Se preferir,{' '}
          <a href={`${URL_REPOSITORIO}/issues/new`} target="_blank" rel="noopener noreferrer" className={LINK_EM_CARTAO}>
            abra a issue direto no GitHub ↗
          </a>
          .
        </Mensagem>
      )}
      <button type="submit" disabled={enviando} aria-busy={enviando || undefined} className={BOTAO_PRIMARIO}>
        {enviando
          ? 'Enviando…'
          : estado.fase === 'falhou'
            ? 'Tentar de novo'
            : tipo === 'sugestao'
              ? 'Enviar sugestão'
              : 'Enviar relato'}
      </button>
      <Link href="/" className={`justify-self-center text-base ${LINK_PAGINA}`}>
        Voltar ao jogo
      </Link>
    </form>
  )
}
