import { z } from 'zod'
import dados from '@/data/afirmacoes.json'
import { COMPOSICOES_ACEITAS, type Composicao, composicaoDoTamanho, MINIMO_POR_PAR } from '@/lib/rodadas'

export type Lado = 'esquerda' | 'direita'

export const VEREDITOS = ['verdadeiro', 'falso', 'enganoso'] as const
export type Veredito = (typeof VEREDITOS)[number]

// Alcance da fala (critério em /como-escolhemos): 3 = debate ou TV nacional e duas ou mais agências;
// 2 = debate ou TV nacional, uma agência; 1 = o resto.
export const ALCANCES = [1, 2, 3] as const
export type Alcance = (typeof ALCANCES)[number]

export interface Afirmacao {
  id: string
  texto: string // neutro, em terceira pessoa: é o que aparece na pergunta
  citacao: string // a fala como a agência a citou; só aparece no feedback
  lado: Lado
  autor: string
  veredito: Veredito
  explicacao: string
  fonte_nome: string
  fonte_url: string
  data_checagem: string // YYYY-MM-DD
  alcance: Alcance
  observacao?: string // por que o item fica fora do jogo; item com observacao nunca é sorteado
}

export type Respostas = Record<string, Veredito>


const LADOS: readonly Lado[] = ['esquerda', 'direita']

// Um par é a combinação (lado, veredito); a composição da rodada diz quantos itens cada par tem.
export interface Par {
  lado: Lado
  veredito: Veredito
}

export const PARES: readonly Par[] = LADOS.flatMap((lado) => VEREDITOS.map((veredito) => ({ lado, veredito })))

export function chaveDoPar({ lado, veredito }: Par): string {
  return `${lado}:${veredito}`
}

export function contarPorPar(afirmacoes: readonly Afirmacao[]): Map<string, number> {
  const contagem = new Map<string, number>(PARES.map((par) => [chaveDoPar(par), 0]))
  for (const afirmacao of afirmacoes) {
    const chave = chaveDoPar(afirmacao)
    contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
  }
  return contagem
}

// Balanceada = a contagem por par bate com a composição aceita de mesmo tamanho.
export function ehRodadaBalanceada(
  afirmacoes: readonly Afirmacao[],
  aceitas: readonly Composicao[] = COMPOSICOES_ACEITAS,
): boolean {
  const composicao = composicaoDoTamanho(afirmacoes.length, aceitas)
  if (!composicao) return false
  const contagem = contarPorPar(afirmacoes)
  return (
    contagem.size === PARES.length &&
    PARES.every(({ lado, veredito }) => contagem.get(`${lado}:${veredito}`) === composicao[veredito])
  )
}

function hostEhDominio(host: string, dominio: string): boolean {
  return host === dominio || host === `www.${dominio}`
}

export function fonteEhPermitida(url: string): boolean {
  let endereco: URL
  try {
    endereco = new URL(url)
  } catch {
    return false
  }
  if (endereco.protocol !== 'https:') return false

  const host = endereco.hostname
  const caminho = endereco.pathname
  if (hostEhDominio(host, 'aosfatos.org')) return true
  if (hostEhDominio(host, 'projetocomprova.com.br')) return true
  if (host === 'lupa.uol.com.br') return true
  if (hostEhDominio(host, 'agencialupa.org')) return true
  if (host === 'g1.globo.com') return caminho === '/fato-ou-fake' || caminho.startsWith('/fato-ou-fake/')
  if (hostEhDominio(host, 'estadao.com.br')) return caminho.includes('estadao-verifica')
  return false
}

const esquemaAfirmacao = z.object({
  id: z.string().min(1, { error: 'id não pode ser vazio' }),
  texto: z.string(),
  citacao: z.string({ error: 'citacao é obrigatória' }).min(10, { error: 'citacao deve ter ao menos 10 caracteres' }),
  lado: z.enum(LADOS, { error: 'lado deve ser "esquerda" ou "direita"' }),
  autor: z.string(),
  veredito: z.enum(VEREDITOS, { error: 'veredito deve ser "verdadeiro", "falso" ou "enganoso"' }),
  explicacao: z.string(),
  fonte_nome: z.string(),
  fonte_url: z
    .url({ error: 'fonte_url deve ser uma URL válida' })
    .refine(fonteEhPermitida, { error: 'fonte_url não pertence a uma agência de checagem permitida' }),
  data_checagem: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { error: 'data_checagem deve estar no formato YYYY-MM-DD' })
    .refine(
      (v) => {
        const data = new Date(`${v}T00:00:00Z`)
        return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === v
      },
      {
        error: 'data_checagem deve ser uma data de calendário válida',
      },
    ),
  alcance: z.union([z.literal(1), z.literal(2), z.literal(3)], { error: 'alcance deve ser 1, 2 ou 3' }),
  observacao: z
    .string()
    .refine((v) => v.trim().length >= 20, {
      error: 'observacao deve ter ao menos 20 caracteres (sem contar espaços nas pontas)',
    })
    .optional(),
})

export const afirmacaoSchema = esquemaAfirmacao

function descreverProblemas(erro: z.ZodError): string {
  return erro.issues.map(({ path, message }) => (path.length ? `[${path.join('.')}] ${message}` : message)).join('; ')
}

// Jogável = item sem `observacao`; os demais aparecem em /afirmacoes e nunca são sorteados.
export function jogaveis(pool: readonly Afirmacao[]): Afirmacao[] {
  return pool.filter((a) => a.observacao === undefined)
}

export function foraDoJogo(pool: readonly Afirmacao[]): Afirmacao[] {
  return pool.filter((a) => a.observacao !== undefined)
}

export function validarPool(dados: unknown): Afirmacao[] {
  const resultado = z.array(esquemaAfirmacao).safeParse(dados)
  if (!resultado.success) throw new Error(`Afirmações inválidas: ${descreverProblemas(resultado.error)}`)
  const pool = resultado.data

  const ids = new Set<string>()
  for (const { id } of pool) {
    if (ids.has(id)) throw new Error(`Afirmações inválidas: id duplicado "${id}"`)
    ids.add(id)
  }

  // Cada par precisa de itens jogáveis suficientes para qualquer rodada atual fechar.
  const contagem = contarPorPar(jogaveis(pool))
  const faltando = PARES.map((par) => ({ par, tem: contagem.get(chaveDoPar(par)) ?? 0, precisa: MINIMO_POR_PAR[par.veredito] }))
    .filter(({ tem, precisa }) => tem < precisa)
  if (faltando.length) {
    const detalhe = faltando.map(({ par, tem, precisa }) => `${chaveDoPar(par)} tem ${tem}, precisa de ${precisa}`).join(', ')
    throw new Error(`Afirmações inválidas: cada par (lado:veredito) precisa de jogáveis para a rodada; ${detalhe}`)
  }

  return pool
}

let poolCarregado: Afirmacao[] | undefined

export function carregarPool(): Afirmacao[] {
  poolCarregado ??= validarPool(dados)
  return poolCarregado.map((a) => ({ ...a }))
}

// `lado` fica no servidor: o cliente nunca recebe de que lado é cada afirmação.
export type AfirmacaoNoQuiz = Omit<Afirmacao, 'lado'>

export function semLado({ lado: _lado, ...resto }: Afirmacao): AfirmacaoNoQuiz {
  return resto
}

// Sorteia `composicao[veredito]` jogáveis de cada par, fora de `excluir`, e embaralha o resultado; null se algum par não fecha.
// Com `pesos`, o sorteio dentro de cada par é ponderado pelo alcance; a composição não muda.
export function sortearRodada(
  pool: readonly Afirmacao[],
  composicao: Composicao,
  excluir: Iterable<string>,
  aleatorio: () => number = Math.random,
  pesos?: Readonly<Record<Alcance, number>>,
): Afirmacao[] | null {
  const excluidos = new Set(excluir)
  const disponiveis = jogaveis(pool).filter((a) => !excluidos.has(a.id))
  const sorteadas: Afirmacao[] = []
  for (const { lado, veredito } of PARES) {
    const quantos = composicao[veredito]
    const candidatas = disponiveis.filter((a) => a.lado === lado && a.veredito === veredito)
    if (candidatas.length < quantos) return null
    sorteadas.push(
      ...(pesos
        ? sortearPonderado(candidatas, quantos, (a) => pesos[a.alcance], aleatorio)
        : embaralhar(candidatas, aleatorio).slice(0, quantos)),
    )
  }
  return embaralhar(sorteadas, aleatorio)
}

function indicePonderado(itens: readonly { peso: number }[], total: number, aleatorio: () => number): number {
  let alvo = aleatorio() * total
  for (let i = 0; i < itens.length; i++) {
    alvo -= itens[i].peso
    if (itens[i].peso > 0 && alvo < 0) return i
  }
  // Arredondamento: se o alvo sobrar no fim, vale o último com peso.
  return itens.findLastIndex((r) => r.peso > 0)
}

// Sorteio ponderado sem reposição: cada escolha tem probabilidade proporcional ao peso (peso ≤ 0 conta como 0);
// se todos os restantes pesam 0, a escolha é uniforme.
export function sortearPonderado<T>(
  itens: readonly T[],
  quantos: number,
  peso: (t: T) => number,
  aleatorio: () => number,
): T[] {
  const restantes = itens.map((item) => ({ item, peso: Math.max(0, peso(item)) }))
  const escolhidos: T[] = []
  while (escolhidos.length < quantos && restantes.length > 0) {
    const total = restantes.reduce((soma, r) => soma + r.peso, 0)
    const indice = total > 0 ? indicePonderado(restantes, total, aleatorio) : Math.floor(aleatorio() * restantes.length)
    escolhidos.push(restantes.splice(indice, 1)[0].item)
  }
  return escolhidos
}

export function embaralhar<T>(itens: readonly T[], aleatorio: () => number = Math.random): T[] {
  const copia = [...itens]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
