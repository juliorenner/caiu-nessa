export type OpcaoDeCartao = { id: string; rotulo: string; urlImagem: string }

// Carrossel de cartões para os stories: a pessoa desliza, toca no que quer mostrar e os botões de
// compartilhar mandam esse. É um grupo de rádio (um escolhido por vez), com as setas do teclado de graça.
export function EscolhaDeCartao(p: {
  opcoes: OpcaoDeCartao[]
  escolhida: string
  onEscolher: (id: string) => void
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-3 font-letreiro text-[13px]">Escolha o cartão</legend>
      {/* Sangra até a borda no celular para o deslizar ficar evidente; o snap centraliza cada cartão. */}
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pt-1 pb-3 lg:mx-0 lg:px-1">
        {p.opcoes.map(o => (
          <label key={o.id} className="flex shrink-0 cursor-pointer snap-center flex-col items-center gap-2">
            <input
              type="radio"
              name="cartao"
              value={o.id}
              checked={p.escolhida === o.id}
              onChange={() => p.onEscolher(o.id)}
              className="peer sr-only"
            />
            {/* Imagem decorativa: o nome acessível é o rótulo. A mesma URL que a pré-busca usa (cache). */}
            {/* eslint-disable-next-line @next/next/no-img-element -- PNG gerado pela rota, sem otimização */}
            <img
              src={o.urlImagem}
              alt=""
              width={144}
              height={256}
              className="aspect-[9/16] w-36 border-[3px] border-tinta opacity-70 transition-transform duration-100 peer-checked:-translate-y-1 peer-checked:opacity-100 peer-checked:shadow-[6px_6px_0_var(--color-tinta)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tinta motion-reduce:transition-none dark:border-papel dark:peer-checked:shadow-[6px_6px_0_var(--color-papel)] dark:peer-focus-visible:outline-papel"
            />
            <span className="text-[13px] font-bold peer-checked:underline peer-checked:underline-offset-4">
              {o.rotulo}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
