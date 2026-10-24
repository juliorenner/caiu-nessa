import { z } from 'zod'

// Única fonte dos tipos de evento: adicionar um tipo é adicionar uma entrada aqui e em DADOS_POR_TIPO.
// `inicio`: primeira resposta da primeira rodada (uma partida começada); `compartilhar`: toque num botão do placar.
export const TIPOS_DE_EVENTO = ['inicio', 'compartilhar'] as const
export type TipoDeEvento = (typeof TIPOS_DE_EVENTO)[number]

export const MODOS_DE_COMPARTILHAR = ['link', 'imagem', 'baixar', 'whatsapp'] as const
// Os desfechos de compartilhar() mais 'clique' para os links (baixar a imagem, abrir o WhatsApp).
export const RESULTADOS_DE_COMPARTILHAR = ['folha', 'copiado', 'cancelado', 'falhou', 'indisponivel', 'clique'] as const
// Os cartões do carrossel da tela de fim, na ordem em que aparecem.
export const CARTOES_DE_COMPARTILHAR = ['convite', 'percentil', 'placar'] as const
export type CartaoDeCompartilhar = (typeof CARTOES_DE_COMPARTILHAR)[number]

// Teto do JSON serializado de `dados`, valha o que valer o esquema do tipo.
export const TAMANHO_MAXIMO_DADOS = 500

export const DADOS_POR_TIPO = {
  inicio: z.strictObject({}),
  // `cartao` é opcional: páginas abertas antes do carrossel (e os eventos antigos) não o mandam.
  // `tela: 'home'` marca o compartilhar da home (só o convite); ausente = tela de fim de jogo.
  compartilhar: z.strictObject({
    modo: z.enum(MODOS_DE_COMPARTILHAR),
    resultado: z.enum(RESULTADOS_DE_COMPARTILHAR),
    cartao: z.enum(CARTOES_DE_COMPARTILHAR).optional(),
    tela: z.literal('home').optional(),
  }),
} satisfies Record<TipoDeEvento, z.ZodType>

type Dados = typeof DADOS_POR_TIPO
type OpcaoDoTipo<T extends TipoDeEvento> = z.ZodObject<{ tipo: z.ZodLiteral<T>; dados: Dados[T] }>
// Tupla de opções na mesma ordem de TIPOS_DE_EVENTO: o `map` devolve array, o tipo devolve a tupla que a união pede.
type OpcoesDe<T extends readonly TipoDeEvento[]> = { readonly [K in keyof T]: OpcaoDoTipo<T[K]> }

const opcoes = TIPOS_DE_EVENTO.map(tipo =>
  z.object({ tipo: z.literal(tipo), dados: DADOS_POR_TIPO[tipo] }),
) as unknown as OpcoesDe<typeof TIPOS_DE_EVENTO>

export const eventoSchema = z
  .discriminatedUnion('tipo', opcoes)
  .refine(evento => JSON.stringify(evento.dados).length <= TAMANHO_MAXIMO_DADOS)

export type Evento = z.infer<typeof eventoSchema>
