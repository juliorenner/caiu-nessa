import type { Metadata } from 'next'
import Link from 'next/link'
import { ALCANCES } from '@/lib/afirmacoes'
import { LINK_PAGINA, TITULO_LETREIRO } from '@/components/rotulos'
import {
  COMPOSICAO_EXTRA,
  COMPOSICAO_PRIMEIRA,
  TOTAL_AFIRMACOES,
  descricaoDaComposicao,
  descricaoDoAlcance,
  tamanhoDa,
} from '@/lib/rodadas'

export const metadata: Metadata = { title: 'Como escolhemos as afirmações · Caiu Nessa?' }

export default function ComoEscolhemos() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-[17px] leading-relaxed text-tinta dark:text-papel">
      <Link href="/" className={LINK_PAGINA}>
        Caiu Nessa?
      </Link>
      <h1 className={`mt-6 ${TITULO_LETREIRO} text-[28px]`}>Como escolhemos as afirmações</h1>

      <h2 className={`mt-8 ${TITULO_LETREIRO} text-lg`}>Só o que já foi checado</h2>
      <p className="mt-2">
        Toda afirmação do jogo já foi verificada por pelo menos uma destas agências de checagem: Aos Fatos, Lupa,
        Comprova, G1 Fato ou Fake e Estadão Verifica. Nós não damos veredito próprio: cada afirmação traz o link da
        checagem original, para você conferir. O conjunto de afirmações é revisado todo mês por um agente automatizado,
        e cada mudança chega como um pull request público no repositório do projeto.
      </p>
      <p className="mt-2">
        Viu uma checagem que não está no jogo? Você pode{' '}
        <Link href="/sugerir" className={LINK_PAGINA}>
          sugerir uma afirmação
        </Link>{' '}
        colando o link da checagem de uma dessas agências. A sugestão vira uma issue pública no repositório e é só uma
        pista: a afirmação só entra depois de conferida, pelas mesmas regras desta página.
      </p>

      <h2 className={`mt-8 ${TITULO_LETREIRO} text-lg`}>Mesmo peso para os dois lados</h2>
      <p className="mt-2">
        Cada rodada é sorteada de um conjunto maior e tem o mesmo número de afirmações de cada lado da disputa e, em cada
        lado, o mesmo número de verdadeiras, falsas e enganosas: a primeira rodada tem {TOTAL_AFIRMACOES} afirmações: de
        cada lado, {descricaoDaComposicao(COMPOSICAO_PRIMEIRA)}; as seguintes têm {tamanhoDa(COMPOSICAO_EXTRA)}, de cada
        lado, {descricaoDaComposicao(COMPOSICAO_EXTRA)}. O &quot;lado&quot; de uma afirmação é
        definido por quem a disse ou a espalhou, conforme a agência de checagem atribui, não pelo assunto. Damos
        prioridade às afirmações que mais circularam. Durante o jogo o lado não aparece.
      </p>

      <h2 className={`mt-8 ${TITULO_LETREIRO} text-lg`}>Verdade, mentira ou enganoso</h2>
      <p className="mt-2">Cada afirmação tem um destes três vereditos:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        <li>
          <strong>Verdade</strong>: a checagem confirmou o que foi dito.
        </li>
        <li>
          <strong>Mentira</strong>: a checagem concluiu que é falso.
        </li>
        <li>
          <strong>Enganoso</strong> (o botão &quot;Cheira mal&quot;): tem algo de verdade, mas foi dito de um
          jeito que leva a uma conclusão errada.
        </li>
      </ul>
      <p className="mt-2">
        As agências usam nomes diferentes. Contamos como enganoso os rótulos Enganoso, Exagerado, Distorcido, Fora de
        contexto, Falta contexto, Impreciso, &quot;Não é bem assim&quot;, Verdadeiro em partes e Subestimado. Rótulos
        que não dizem se a afirmação é verdade ou mentira (Insustentável, Contraditório, Ainda é cedo e Sem contexto
        suficiente) não contam como voto.
      </p>
      <p className="mt-2">
        Quando agências diferentes discordam sobre a mesma afirmação: se uma diz verdadeiro e outra diz falso, ela fica
        de fora. Nos outros casos, vale a maioria dos votos; no empate entre verdadeiro e enganoso, vale enganoso; no
        empate entre falso e enganoso, vale falso. As afirmações que ficam fora do jogo aparecem na lista pública, com
        o motivo.
      </p>

      <h2 className={`mt-8 ${TITULO_LETREIRO} text-lg`}>Alcance</h2>
      <p className="mt-2">Cada afirmação tem um alcance, que mede quanta gente ouviu a fala e quantas agências a checaram:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6">
        {[...ALCANCES].reverse().map((a) => (
          <li key={a}>{descricaoDoAlcance(a)}.</li>
        ))}
      </ul>
      <p className="mt-2">
        A primeira rodada dá preferência às afirmações de maior alcance, igualmente nos dois lados; a composição por lado
        e veredito não muda.
      </p>

      <h2 className={`mt-8 ${TITULO_LETREIRO} text-lg`}>O que o resultado mede</h2>
      <p className="mt-2">
        Nenhum texto do jogo apoia ou ataca candidato. O resultado mede você, não os partidos: quantas você acertou e
        em quantas falsas ou enganosas de cada lado você acreditou.
      </p>

      <p className="mt-10">
        <Link href="/afirmacoes" className={LINK_PAGINA}>
          Ver todas as afirmações e suas fontes
        </Link>
      </p>

      <p className="mt-4">
        O código, as afirmações e os planos de desenvolvimento são públicos.{' '}
        <a href="https://github.com/juliorenner/caiu-nessa" className={LINK_PAGINA}>
          github.com/juliorenner/caiu-nessa
        </a>
      </p>
    </main>
  )
}
