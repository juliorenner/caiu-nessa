import type { Veredito } from '@/lib/afirmacoes'

export const ROTULO_VEREDITO: Record<Veredito, string> = {
  verdadeiro: 'Verdade',
  falso: 'Mentira',
  enganoso: 'Enganoso',
}

// Cor do veredito como borda + texto. Só sobre superfícies brancas (iguais nos dois temas).
const COR_VEREDITO: Record<Veredito, string> = {
  verdadeiro: 'border-verdade text-verdade',
  falso: 'border-mentira text-mentira',
  enganoso: 'border-cheira text-cheira',
}

const POR_VEREDITO = (classes: string) =>
  Object.fromEntries(Object.entries(COR_VEREDITO).map(([v, cor]) => [v, `${classes} ${cor}`])) as Record<
    Veredito,
    string
  >

// Selo do veredito (carimbo pequeno): o mesmo no painel do jogo e na página /afirmacoes.
export const SELO_VEREDITO = POR_VEREDITO(
  'font-letreiro text-[15px] border-[3px] rounded-md -rotate-3 self-start px-2.5 pt-1.5 pb-1',
)

// Selo do alcance em /afirmacoes: mesma forma do selo do veredito, em tinta (alcance não é veredito).
export const SELO_ALCANCE = 'font-letreiro text-[13px] border-2 border-tinta text-tinta rounded-md self-start px-2 pt-1 pb-0.5'

// Carimbo do cartão: aparece no arrasto e fica depois da resposta.
export const CARIMBO_CARTAO = POR_VEREDITO(
  'font-letreiro text-[22px] border-4 rounded-md -rotate-[14deg] bg-white/70 mix-blend-multiply px-2.5 pt-1.5 pb-1',
)

// Foco sobre o fundo da página: tinta no claro, papel no escuro.
export const FOCO =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tinta dark:focus-visible:outline-papel'

// Foco dentro de uma superfície branca (igual nos dois temas).
export const FOCO_EM_SUPERFICIE = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-tinta'

// Letreiro (claro) e Letreiro noite (escuro). As cores ficam em globals.css (@theme).
export const FUNDO_PAGINA = 'hachura bg-fundo text-tinta dark:bg-fundo-escuro dark:text-papel'

// Superfície (cartão, quadro, painel): branca nos dois temas, cantos retos, sombra dura.
// No escuro a borda e a sombra viram papel; dentro dela nada muda (tinta sobre branco).
export const SUPERFICIE =
  'bg-superficie text-tinta border-[3px] border-tinta shadow-[6px_6px_0_var(--color-tinta)] dark:border-papel dark:shadow-[6px_6px_0_var(--color-papel)]'

// Cartões da lista em /afirmacoes: a mesma superfície com sombra menor.
export const SUPERFICIE_LISTA =
  'bg-superficie text-tinta border-[3px] border-tinta shadow-[4px_4px_0_var(--color-tinta)] dark:border-papel dark:shadow-[4px_4px_0_var(--color-papel)]'

// Ficha: faixa de papel com borda tinta (papel nos dois temas).
export const FICHA =
  'relative bg-papel text-tinta border-[3px] border-tinta shadow-[4px_4px_0_var(--color-tinta)] dark:border-papel dark:shadow-[4px_4px_0_var(--color-papel)]'

// Botão "de apertar": borda e sombra dura embaixo; ao pressionar, afunda.
const APERTAR_CLARO =
  'font-letreiro border-[3px] border-tinta shadow-[0_5px_0_var(--color-tinta)] active:translate-y-[5px] active:shadow-none transition-transform duration-[80ms] motion-reduce:transition-none'
const APERTAR_ESCURO = 'dark:border-papel dark:shadow-[0_5px_0_var(--color-papel)]'
const BOTAO_APERTAR = `${APERTAR_CLARO} ${APERTAR_ESCURO}`

// Forma dos botões de ação (largura total, conteúdo centralizado).
const BOTAO_ACAO = 'flex min-h-12 w-full items-center justify-center px-5 py-3 disabled:opacity-60'

export const BOTAO_PRIMARIO = `${BOTAO_APERTAR} ${BOTAO_ACAO} bg-tinta text-papel dark:bg-papel dark:text-tinta ${FOCO}`

// Ação secundária ("fantasma") ao lado do primário: mesma forma, fundo branco; no escuro, transparente com papel.
export const BOTAO_SECUNDARIO = `${BOTAO_APERTAR} ${BOTAO_ACAO} bg-superficie text-tinta dark:bg-fundo-escuro dark:text-papel ${FOCO}`

// Linha de compartilhar: o controle inteiro (círculo + rótulo) é o alvo do toque e do foco;
// o círculo afunda quando o controle é pressionado (group-active). Estreito abaixo de 360 px.
export const ITEM_COMPARTILHAR = `group flex w-[66px] shrink flex-col items-center gap-2 rounded min-[360px]:w-[72px] ${FOCO}`
const CIRCULO_ICONE =
  'flex size-[60px] shrink-0 items-center justify-center rounded-full border-[3px] border-tinta shadow-[0_5px_0_var(--color-tinta)] group-active:translate-y-[5px] group-active:shadow-none transition-transform duration-[80ms] motion-reduce:transition-none dark:border-papel dark:shadow-[0_5px_0_var(--color-papel)]'
export const CIRCULO_ICONE_PRIMARIO = `${CIRCULO_ICONE} bg-tinta text-papel dark:bg-papel dark:text-tinta`
export const CIRCULO_ICONE_SECUNDARIO = `${CIRCULO_ICONE} bg-superficie text-tinta dark:bg-fundo-escuro dark:text-papel`
export const ROTULO_ICONE = 'text-[12px] font-bold min-[360px]:text-[13px]'

// Botão dentro de um cartão (branco nos dois temas): sem variante escura.
export const BOTAO_EM_CARTAO = `${APERTAR_CLARO} ${BOTAO_ACAO} bg-tinta text-papel ${FOCO_EM_SUPERFICIE}`

// Link dentro de uma superfície branca: texto e anel de foco sempre tinta.
export const LINK_EM_CARTAO = `rounded font-medium text-tinta underline underline-offset-4 ${FOCO_EM_SUPERFICIE}`

// Link sobre o fundo da página (tinta no claro, papel no escuro).
export const LINK_PAGINA = `rounded font-medium text-tinta underline underline-offset-4 dark:text-papel ${FOCO}`

// Tecla do teclado (<kbd>): borda na cor do texto, mais grossa embaixo. A visibilidade (display) fica com quem usa.
export const TECLA_BASE =
  'min-h-6 min-w-[26px] items-center justify-center rounded-[5px] border-2 border-b-4 border-current px-1.5 font-letreiro text-[12px] leading-none'

// Texto secundário sobre o fundo da página.
export const TEXTO_SECUNDARIO = 'text-secundario dark:text-secundario-escuro'

// Número grande do placar: letreiro com sombra em camadas (papel e tinta; trocam no escuro).
export const NUMERO_PLACAR =
  'font-letreiro text-[clamp(56px,18vw,72px)] leading-none text-tinta dark:text-papel [text-shadow:4px_4px_0_var(--color-papel),6px_6px_0_var(--color-tinta)] dark:[text-shadow:4px_4px_0_var(--color-tinta),6px_6px_0_var(--color-papel)]'

// Carimbo tinta da faixa: não é cor de veredito, a faixa não é juízo de valor colorido.
export const CARIMBO_FAIXA =
  'font-letreiro text-base border-[3px] border-tinta dark:border-papel rounded-md -rotate-3 inline-block px-3 pt-1.5 pb-1'

// h1/h2 das páginas de texto.
export const TITULO_LETREIRO = 'font-letreiro text-tinta dark:text-papel'

// Texto no DOM em capitalização normal; a caixa alta vem da fonte Bungee.
export const ROTULO_BOTAO: Record<Veredito, string> = {
  verdadeiro: 'Verdade',
  falso: 'Mentira',
  enganoso: 'Cheira mal',
}

export const ARIA_BOTAO_RESPOSTA: Partial<Record<Veredito, string>> = {
  enganoso: 'Isso me cheira mal: enganoso',
}

const PREENCHIMENTO: Record<Veredito, string> = {
  verdadeiro: 'bg-verdade',
  falso: 'bg-mentira',
  enganoso: 'bg-cheira',
}

// Botões de resposta: cheios na cor do veredito nos dois temas; no escuro, borda e sombra papel.
// `destaque` substitui `base` no botão escolhido (afundado: sem sombra, deslocado 5 px);
// `esmaecido` soma-se a `base` nos outros dois.
export const BOTAO_RESPOSTA = Object.fromEntries(
  Object.entries(PREENCHIMENTO).map(([v, cor]) => {
    const base = `${BOTAO_APERTAR} ${cor} text-white`
    const afundado = base
      .split(' ')
      .filter((c) => !c.startsWith('active:') && !/(^|:)shadow-/.test(c))
      .join(' ')
    return [v, { base, destaque: `${afundado} translate-y-[5px] shadow-none`, esmaecido: 'opacity-35' }]
  }),
) as Record<Veredito, { base: string; destaque: string; esmaecido: string }>
