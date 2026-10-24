"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  slugDaFaixa,
  urlDoCartao,
  urlDoResultado,
  type Casa,
} from "@/lib/cartao";
import {
  NOME_ARQUIVO,
  NOME_ARQUIVO_CONVITE,
  NOME_ARQUIVO_PERCENTIL,
  textoDeCompartilhar,
  textoDeConvite,
  textoDePercentil,
  urlDoWhatsApp,
} from "@/lib/compartilhar";
import { buscarArquivo, compartilhar } from "@/lib/compartilhar-navegador";
import { registrarEvento } from "@/lib/eventos-navegador";
import type { RespostaResultado } from "@/lib/resultado-api";
import { SITE_URL, TITULO } from "@/lib/site";
import { EscolhaDeCartao } from "./EscolhaDeCartao";
import { Ficha } from "./Ficha";
import { LinhaDeCompartilhar } from "./LinhaDeCompartilhar";
import { Politico } from "./icones/Politico";
import { MarcaDagua } from "./MarcaDagua";
import { SuasRespostas, type RespostaDada } from "./SuasRespostas";
import {
  BOTAO_SECUNDARIO,
  CARIMBO_FAIXA,
  LINK_PAGINA,
  NUMERO_PLACAR,
  TEXTO_SECUNDARIO,
} from "./rotulos";


type EstadoContinuar = "parado" | "sorteando" | "fim" | "falha";
type IdCartao = "convite" | "percentil" | "placar";
// O que cada cartão manda: a imagem e o texto (sem e com a URL), e o link que vai junto.
type Cartao = {
  id: IdCartao;
  rotulo: string;
  urlImagem: string;
  nomeArquivo: string;
  url: string;
  texto: string;
  textoComUrl: string;
};

type Aviso = "copiado" | "falhou" | "carregando" | "imagemFalhou" | "imagemNaoCarregou";

const TEXTO_AVISO: Record<Aviso, string> = {
  copiado: "Texto copiado",
  falhou: "Não deu para copiar",
  carregando: "Imagem ainda carregando…",
  imagemFalhou: "Não deu para mandar a imagem",
  imagemNaoCarregou: "Não deu para carregar a imagem. Tente o link de baixar.",
};

export function ResultadoFinal(p: {
  dados: RespostaResultado;
  rodada: number;
  acumulado: { acertos: number; total: number };
  // Uma casa por afirmação, na ordem jogada.
  casas: Casa[];
  // Uma linha por afirmação, na ordem jogada; sem itens, a lista não aparece.
  respostas?: RespostaDada[];
  onContinuar: () => Promise<"ok" | "fim" | "falha">;
}) {
  const { resultado, avaliacao, estatisticas, percentilAbaixo } = p.dados;
  const respostas = p.respostas ?? [];
  const [continuar, setContinuar] = useState<EstadoContinuar>("parado");
  // Números da rodada corrente, não da partida.
  const placar = {
    acertos: resultado.acertos,
    total: resultado.total,
    caiu: resultado.acreditadasEsquerda + resultado.acreditadasDireita,
    casas: p.casas,
  };
  const faixa = slugDaFaixa(avaliacao.titulo);
  const urlResultado = `${SITE_URL}${urlDoResultado({ ...placar, faixa })}`;
  // O convite vem primeiro (e escolhido): ninguém precisa mostrar quantas errou para chamar os amigos.
  // A comparação só existe na rodada completa, com estatísticas, e "mais que 0%" não entra.
  // Os cartões sem placar levam o link da capa, cuja prévia também não tem números.
  const comPercentil =
    p.rodada === 1 && estatisticas !== null && percentilAbaixo !== null && percentilAbaixo >= 1 && percentilAbaixo <= 99;
  const cartoes: Cartao[] = [
    {
      id: "convite",
      rotulo: "Convite",
      urlImagem: "/convite",
      nomeArquivo: NOME_ARQUIVO_CONVITE,
      url: SITE_URL,
      texto: textoDeConvite(),
      textoComUrl: textoDeConvite(SITE_URL),
    },
    ...(comPercentil
      ? [
          {
            id: "percentil" as const,
            rotulo: `Mais que ${percentilAbaixo}%`,
            urlImagem: `/percentil?p=${percentilAbaixo}`,
            nomeArquivo: NOME_ARQUIVO_PERCENTIL,
            url: SITE_URL,
            texto: textoDePercentil(percentilAbaixo),
            textoComUrl: textoDePercentil(percentilAbaixo, SITE_URL),
          },
        ]
      : []),
    {
      id: "placar",
      rotulo: "Com placar",
      urlImagem: urlDoCartao({ ...placar, faixa }),
      nomeArquivo: NOME_ARQUIVO,
      url: urlResultado,
      texto: textoDeCompartilhar(placar),
      textoComUrl: textoDeCompartilhar({ ...placar, url: urlResultado }),
    },
  ];
  const [escolhida, setEscolhida] = useState<IdCartao>("convite");
  const escolhidaRef = useRef<IdCartao>("convite");
  const cartao = cartoes.find((c) => c.id === escolhida) ?? cartoes[0];
  // Por cartão: ausente = carregando, null = a busca falhou.
  const [arquivos, setArquivos] = useState<Partial<Record<IdCartao, File | null>>>({});
  const arquivo = arquivos[cartao.id] ?? null;
  const imagemNaoCarregou = arquivos[cartao.id] === null;
  // Só no navegador: no servidor (e até montar) o botão do Instagram não aparece.
  const [aceitaArquivos, setAceitaArquivos] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Busca as imagens de todos os cartões ao montar, não no toque: esperar um fetch depois do toque
  // faz o share falhar. As miniaturas do carrossel usam as mesmas URLs (vêm do cache).
  const fontesDosArquivos = cartoes.map((c) => `${c.id} ${c.urlImagem} ${c.nomeArquivo}`).join("\n");
  useEffect(() => {
    let montado = true;
    for (const linha of fontesDosArquivos.split("\n")) {
      const [id, url, nome] = linha.split(" ") as [IdCartao, string, string];
      void buscarArquivo(url, nome).then((f) => {
        if (!montado) return;
        // null marca a falha: o próximo toque no Instagram avisa isso, não "carregando".
        setArquivos((atual) => ({ ...atual, [id]: f }));
        // Quem tocou em "Instagram" cedo demais viu "carregando": some quando a imagem escolhida chega.
        if (f && id === escolhidaRef.current) setAviso((atual) => (atual === "carregando" ? null : atual));
      });
    }
    return () => {
      montado = false;
    };
  }, [fontesDosArquivos]);

  useEffect(() => {
    let aceita = false;
    try {
      aceita =
        navigator.canShare?.({
          files: [new File([""], "x.png", { type: "image/png" })],
        }) ?? false;
    } catch {
      // Qualquer erro: sem o botão do Instagram; Baixar continua.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- navigator só existe no cliente; ler no render divergiria da hidratação
    setAceitaArquivos(aceita);
  }, []);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  function mostrar(novo: Aviso | null) {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    setAviso(novo);
    if (novo === "copiado")
      temporizador.current = setTimeout(() => setAviso(null), 2000);
  }

  // Síncrono até o share: usa a imagem que já chegou, sem esperar a que falta.
  function aoCompartilhar(modo: "link" | "imagem") {
    void compartilhar({
      modo,
      texto: cartao.texto,
      textoComUrl: cartao.textoComUrl,
      url: cartao.url,
      titulo: TITULO,
      arquivo,
    }).then((desfecho) => {
      registrarEvento({ tipo: "compartilhar", dados: { modo, resultado: desfecho } });
      // A folha abriu: um aviso de toque anterior já não vale.
      if (desfecho === "folha") mostrar(null);
      else if (desfecho === "copiado") mostrar("copiado");
      else if (desfecho === "indisponivel") mostrar(imagemNaoCarregou ? "imagemNaoCarregou" : "carregando");
      else if (desfecho === "falhou")
        mostrar(modo === "imagem" ? "imagemFalhou" : "falhou");
    });
  }

  function aoEscolher(id: string) {
    escolhidaRef.current = id as IdCartao;
    setEscolhida(id as IdCartao);
    mostrar(null);
  }

  async function aoContinuar() {
    if (continuar === "sorteando") return;
    setContinuar("sorteando");
    const desfecho = await p.onContinuar();
    // 'ok' remonta o quiz; aqui só sobram fim e falha.
    if (desfecho !== "ok") setContinuar(desfecho);
  }

  return (
    <>
      {/* Marca-d'água atrás do conteúdo: o section fica acima (z-10). */}
      <MarcaDagua posicao="canto">
        <Politico className="w-full" />
      </MarcaDagua>
      <section
        aria-live="polite"
        className="relative z-10 flex flex-col gap-5 text-center text-tinta dark:text-papel lg:mx-auto lg:grid lg:max-w-5xl lg:grid-cols-[1fr_1fr_1.5rem_2fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-4 lg:gap-y-5 lg:text-left"
      >
        {/* No celular os invólucros somem (contents): a coluna é a mesma de sempre. Em lg, a coluna da
            esquerda ocupa as duas primeiras trilhas; os botões ficam lado a lado embaixo dela. */}
        <div className="contents lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-5">
          <Ficha esquerda="Fim de jogo" direita={`Rodada ${p.rodada}`} />
          <div className="contents lg:flex lg:items-center lg:gap-7">
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <p className="font-letreiro text-[13px]">Placar</p>
              {/* A barra fica só na tela; o leitor de tela ouve "4 de N", não "4 barra N". */}
              <p data-placar aria-hidden className={`${NUMERO_PLACAR} lg:text-[96px]`}>
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
          </div>
          <p className="text-lg leading-relaxed lg:text-xl">{avaliacao.texto}</p>
          {avaliacao.vies !== null && (
            <p className={`text-base leading-relaxed ${TEXTO_SECUNDARIO}`}>
              {avaliacao.vies}
            </p>
          )}
          {/* A comparação com os outros jogadores só existe para a rodada completa (TOTAL_AFIRMACOES) e só
              aparece quando já há jogadas suficientes; antes disso (ou com as estatísticas fora) não se diz nada. */}
          {p.rodada === 1 && estatisticas && (
            <p className="border-[3px] border-tinta bg-papel p-4 text-base text-tinta">
              Você acertou mais que {percentilAbaixo ?? 0}% das pessoas.
            </p>
          )}
          <EscolhaDeCartao opcoes={cartoes} escolhida={cartao.id} onEscolher={aoEscolher} />
          <LinhaDeCompartilhar
            urlWhatsApp={urlDoWhatsApp(cartao.textoComUrl)}
            onWhatsApp={() =>
              registrarEvento({ tipo: "compartilhar", dados: { modo: "whatsapp", resultado: "clique" } })
            }
            onInstagram={aceitaArquivos ? () => aoCompartilhar("imagem") : undefined}
            urlImagem={cartao.urlImagem}
            nomeArquivo={cartao.nomeArquivo}
            onBaixar={() =>
              registrarEvento({ tipo: "compartilhar", dados: { modo: "baixar", resultado: "clique" } })
            }
            onMais={() => aoCompartilhar("link")}
          />
          <p aria-live="polite" className="text-base">
            {aviso ? TEXTO_AVISO[aviso] : ""}
          </p>
          {continuar === "falha" && (
            <p role="alert" className="text-base">
              Não deu para sortear. Tente de novo.
            </p>
          )}
        </div>
        {continuar === "fim" ? (
          <p className="text-lg lg:col-start-1 lg:row-start-2">
            Acabaram as afirmações por enquanto. Volte depois: a lista cresce.
          </p>
        ) : (
          <button
            type="button"
            onClick={aoContinuar}
            disabled={continuar === "sorteando"}
            aria-busy={continuar === "sorteando" ? true : undefined}
            className={`${BOTAO_SECUNDARIO} lg:col-start-1 lg:row-start-2`}
          >
            {continuar === "sorteando" ? "Sorteando…" : "Continuar jogando"}
          </button>
        )}
        {/* No celular a lista fica logo abaixo de "Continuar jogando"; em lg, na coluna da direita. */}
        {respostas.length > 0 && (
          <div className="lg:col-start-4 lg:row-span-3 lg:row-start-1 lg:self-start">
            <SuasRespostas respostas={respostas} acertos={resultado.acertos} total={resultado.total} />
          </div>
        )}
        {/* Recarrega a página: nova partida, novo sorteio e estatísticas atualizadas. É link no celular;
            em lg, botão secundário tracejado ao lado de "Continuar jogando" (um por tamanho). */}
        <a href="/quiz" className={`self-center text-base ${LINK_PAGINA} lg:hidden`}>
          Jogar de novo
        </a>
        <a
          href="/quiz"
          className={`${BOTAO_SECUNDARIO} max-lg:hidden lg:col-start-2 lg:row-start-2 lg:border-dashed`}
        >
          Jogar de novo
        </a>
        {/* Em lg os dois links ficam no fim da lista "Suas respostas". */}
        <Link
          href="/como-escolhemos"
          className={`self-center text-base ${LINK_PAGINA} lg:hidden`}
        >
          Como escolhemos as afirmações
        </Link>
        <Link
          href="/afirmacoes"
          className={`self-center text-base ${LINK_PAGINA} lg:hidden`}
        >
          Ver todas as afirmações e suas fontes
        </Link>
      </section>
    </>
  );
}
