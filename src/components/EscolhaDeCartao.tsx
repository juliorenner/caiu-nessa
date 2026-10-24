"use client";

import { useEffect, useRef } from "react";

export type OpcaoDeCartao = { id: string; rotulo: string; urlImagem: string };

// Carrossel em destaque: o cartão do centro é o escolhido, grande; os vizinhos aparecem menores
// e cortados nas bordas, convidando a deslizar. Deslizar, tocar num vizinho ou usar os pontos
// (um grupo de rádio, com as setas do teclado) escolhem o cartão que os botões vão mandar.
export function EscolhaDeCartao(p: {
  opcoes: OpcaoDeCartao[];
  escolhida: string;
  onEscolher: (id: string) => void;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  // A escolha veio do deslizar: o trilho já está no lugar, não rola de novo (brigaria com o dedo).
  const doDeslizar = useRef(false);
  const quadro = useRef<number | null>(null);

  // Escolha por toque ou pelos pontos: centraliza o cartão escolhido.
  useEffect(() => {
    if (doDeslizar.current) {
      doDeslizar.current = false;
      return;
    }
    const t = trilho.current;
    const item = t?.querySelector<HTMLElement>(`[data-cartao="${p.escolhida}"]`);
    if (!t || !item) return;
    const suave = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    t.scrollTo?.({ left: item.offsetLeft - (t.clientWidth - item.clientWidth) / 2, behavior: suave ? "smooth" : "auto" });
  }, [p.escolhida]);

  useEffect(
    () => () => {
      if (quadro.current !== null) cancelAnimationFrame(quadro.current);
    },
    [],
  );

  // Ao deslizar, escolhe o cartão mais perto do centro (uma vez por quadro).
  function aoDeslizar() {
    if (quadro.current !== null) return;
    quadro.current = requestAnimationFrame(() => {
      quadro.current = null;
      const t = trilho.current;
      if (!t) return;
      const centro = t.scrollLeft + t.clientWidth / 2;
      let maisPerto: HTMLElement | null = null;
      for (const item of t.querySelectorAll<HTMLElement>("[data-cartao]")) {
        const distancia = Math.abs(item.offsetLeft + item.clientWidth / 2 - centro);
        const melhor = maisPerto && Math.abs(maisPerto.offsetLeft + maisPerto.clientWidth / 2 - centro);
        if (melhor === null || distancia < melhor) maisPerto = item;
      }
      const id = maisPerto?.dataset.cartao;
      if (id && id !== p.escolhida) {
        doDeslizar.current = true;
        p.onEscolher(id);
      }
    });
  }

  const escolhida = p.opcoes.find((o) => o.id === p.escolhida);

  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <p className="font-letreiro text-[13px] lg:self-start">Escolha o cartão</p>
      {/* Sangra até a borda no celular; o recuo lateral (em % do pai, 2rem mais estreito no celular)
          deixa o primeiro e o último no centro. */}
      <div
        ref={trilho}
        onScroll={aoDeslizar}
        className="-mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory items-center gap-1 overflow-x-auto px-[calc(50%+1rem-6.5rem)] lg:px-[calc(50%-6.5rem)] py-3 [scrollbar-width:none] lg:mx-0 lg:w-full [&::-webkit-scrollbar]:hidden"
      >
        {p.opcoes.map((o) => {
          const ativo = o.id === p.escolhida;
          return (
            // Fora da ordem de foco e da árvore de acessibilidade: quem escolhe pelo teclado usa os pontos.
            <button
              key={o.id}
              type="button"
              data-cartao={o.id}
              tabIndex={-1}
              aria-hidden
              onClick={() => p.onEscolher(o.id)}
              className="w-52 shrink-0 snap-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- PNG gerado pela rota, sem otimização */}
              <img
                src={o.urlImagem}
                alt=""
                width={208}
                height={370}
                className={`aspect-[9/16] w-full border-[3px] border-tinta transition-[transform,opacity,box-shadow] duration-200 motion-reduce:transition-none dark:border-papel ${
                  ativo
                    ? "scale-100 opacity-100 shadow-[8px_8px_0_var(--color-tinta)] dark:shadow-[8px_8px_0_var(--color-papel)]"
                    : "scale-[0.84] opacity-55"
                }`}
              />
            </button>
          );
        })}
      </div>
      <p aria-hidden className="text-base font-bold">
        {escolhida?.rotulo}
      </p>
      <fieldset className="flex gap-2">
        <legend className="sr-only">Escolha o cartão</legend>
        {p.opcoes.map((o) => (
          <label key={o.id} className="flex cursor-pointer p-1.5">
            <input
              type="radio"
              name="cartao"
              value={o.id}
              checked={p.escolhida === o.id}
              onChange={() => p.onEscolher(o.id)}
              className="peer sr-only"
            />
            <span className="sr-only">{o.rotulo}</span>
            <span
              aria-hidden
              className="size-3 rounded-full border-2 border-tinta transition-colors peer-checked:bg-tinta peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tinta dark:border-papel dark:peer-checked:bg-papel dark:peer-focus-visible:outline-papel"
            />
          </label>
        ))}
      </fieldset>
    </div>
  );
}
