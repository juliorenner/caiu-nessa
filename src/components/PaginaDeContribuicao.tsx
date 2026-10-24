import Link from 'next/link'
import { FormularioContribuicao, type TipoContribuicao } from './FormularioContribuicao'
import { LINK_PAGINA, TITULO_LETREIRO } from './rotulos'

const TEXTO: Record<TipoContribuicao, { titulo: string; intro: string; passos: string[] }> = {
  sugestao: {
    titulo: 'Sugerir uma afirmação',
    intro:
      'Viu uma checagem de uma agência que não está no jogo? Cole o link dela. A gente confere e, se couber nas regras, a afirmação entra.',
    passos: [
      'Sua sugestão vira uma issue pública no GitHub.',
      'A gente confere se a checagem é de uma agência aceita e se a afirmação cabe nas regras.',
      'Se couber, ela entra no conjunto, com o link da checagem.',
    ],
  },
  problema: {
    titulo: 'Reportar um problema',
    intro: 'Algo não funcionou, ficou torto ou confuso? Conte o que aconteceu. Quanto mais exato, mais fácil de consertar.',
    passos: [
      'Seu relato vira uma issue pública no GitHub.',
      'A gente tenta reproduzir o problema.',
      'Quando resolvermos, a issue é fechada por lá.',
    ],
  },
}

// Página própria (e não uma folha sobre a tela): no celular o teclado cobre o botão de enviar numa folha.
export function PaginaDeContribuicao({ tipo }: { tipo: TipoContribuicao }) {
  const t = TEXTO[tipo]
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-[17px] leading-relaxed text-tinta lg:max-w-5xl dark:text-papel">
      <Link href="/" className={LINK_PAGINA}>
        Caiu Nessa?
      </Link>
      <h1 className={`mt-6 ${TITULO_LETREIRO} text-[28px] lg:text-[32px]`}>{t.titulo}</h1>
      <div className="mt-4 lg:mt-5 lg:grid lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:items-start lg:gap-14">
        <div>
          <p className="mb-6">{t.intro}</p>
          <FormularioContribuicao tipo={tipo} />
        </div>
        <aside className="mt-10 grid gap-3.5 border-[3px] border-dashed border-tinta px-5 py-5 lg:mt-0 dark:border-papel">
          <h2 className={`${TITULO_LETREIRO} text-sm`}>Como funciona</h2>
          <ol className="grid list-decimal gap-3 pl-5 text-base">
            {t.passos.map(p => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  )
}
