import { describe, expect, it } from 'vitest'
import {
  afirmacaoSchema,
  contarPorPar,
  embaralhar,
  foraDoJogo,
  fonteEhPermitida,
  jogaveis,
  PARES,
  semLado,
  sortearPonderado,
  sortearRodada,
  validarPool,
  type Afirmacao,
} from '@/lib/afirmacoes'
import { COMPOSICAO_EXTRA, COMPOSICAO_PRIMEIRA } from '@/lib/rodadas'
import { afirmacoesValidas } from '../fixtures/afirmacoes-validas'

const OBSERVACAO = 'Agências diferentes deram vereditos diferentes para esta fala.'

describe('validarPool', () => {
  it('aceita um pool com pelo menos 2 jogáveis por par', () => {
    expect(validarPool(afirmacoesValidas)).toHaveLength(12)
  })
  it('aceita um pool maior que 12', () => {
    const extra = { ...afirmacoesValidas[0], id: 'e7' }
    expect(validarPool([...afirmacoesValidas, extra])).toHaveLength(13)
  })
  it('rejeita pool sem verdadeira jogável de um lado', () => {
    const alterada = afirmacoesValidas.map(a => ['e1', 'e2'].includes(a.id) ? { ...a, veredito: 'enganoso' as const } : a)
    expect(() => validarPool(alterada)).toThrow(/esquerda:verdadeiro tem 0, precisa de 2/)
  })
  it('rejeita pool com menos falsas jogáveis do que a primeira rodada pede num lado', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e3' ? { ...a, veredito: 'enganoso' as const } : a)
    expect(() => validarPool(alterada)).toThrow(/esquerda:falso tem 1, precisa de 2/)
  })
  it('item com observacao não conta para o mínimo', () => {
    const alterada = afirmacoesValidas.map(a => ['d1', 'd2'].includes(a.id) ? { ...a, observacao: OBSERVACAO } : a)
    expect(() => validarPool(alterada)).toThrow(/direita:verdadeiro tem 0/)
  })
  it('rejeita id duplicado', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e2' ? { ...a, id: 'e1' } : a)
    expect(() => validarPool(alterada)).toThrow(/duplicad/)
  })
  it('rejeita veredito fora do enum', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e1' ? { ...a, veredito: 'parcialmente' } : a)
    expect(() => validarPool(alterada)).toThrow(/veredito deve ser "verdadeiro", "falso" ou "enganoso"/)
  })
  it('rejeita fonte fora da lista de agências', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, fonte_url: 'https://exemplo.com/x' } : a)
    expect(() => validarPool(alterada)).toThrow(/fonte/)
  })
  it('rejeita data_checagem impossível (2026-02-31)', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, data_checagem: '2026-02-31' } : a)
    expect(() => validarPool(alterada)).toThrow(/data_checagem/)
  })
  it('rejeita data_checagem fora de YYYY-MM-DD', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, data_checagem: '01/10/2026' } : a)
    expect(() => validarPool(alterada)).toThrow(/data_checagem/)
  })
  it('rejeita item sem citacao', () => {
    const { citacao: _citacao, ...semCitacao } = afirmacoesValidas[0]
    expect(() => afirmacaoSchema.parse(semCitacao)).toThrow(/citacao/)
  })
  it('rejeita citacao com menos de 10 caracteres', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e2' ? { ...a, citacao: 'curta' } : a)
    expect(() => validarPool(alterada)).toThrow(/citacao/)
  })
  it('rejeita observacao feita só de espaços', () => {
    const item = { ...afirmacoesValidas[0], observacao: ' '.repeat(25) }
    expect(() => afirmacaoSchema.parse(item)).toThrow(/observacao/)
  })
  it('rejeita item sem alcance', () => {
    const { alcance: _alcance, ...semAlcance } = afirmacoesValidas[0]
    expect(() => afirmacaoSchema.parse(semAlcance)).toThrow(/alcance/)
  })
  it('rejeita alcance fora de 1, 2 ou 3', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'e1' ? { ...a, alcance: 4 } : a)
    expect(() => validarPool(alterada)).toThrow(/alcance deve ser 1, 2 ou 3/)
  })
  it('rejeita observacao com menos de 20 caracteres', () => {
    const alterada = afirmacoesValidas.map(a => a.id === 'd1' ? { ...a, observacao: 'curta' } : a)
    expect(() => validarPool(alterada)).toThrow(/observacao/)
  })
})

// Pool de teste: 3 jogáveis por par (ids <par>-0..2) e 1 fora do jogo por par.
function criarPool(): Afirmacao[] {
  const base = afirmacoesValidas[0]
  return PARES.flatMap(({ lado, veredito }) => [
    ...[0, 1, 2].map(i => ({ ...base, id: `${lado}-${veredito}-${i}`, lado, veredito })),
    { ...base, id: `${lado}-${veredito}-fora`, lado, veredito, observacao: OBSERVACAO },
  ])
}

describe('jogaveis e foraDoJogo', () => {
  it('separam os itens com observacao, mantendo a ordem do pool', () => {
    const pool = criarPool()
    expect(jogaveis(pool).map(a => a.id)).toEqual(pool.filter(a => !a.observacao).map(a => a.id))
    expect(foraDoJogo(pool).map(a => a.id)).toEqual(pool.filter(a => a.observacao).map(a => a.id))
  })
})

describe('sortearRodada', () => {
  it('primeira rodada: 10, com 5 por lado e 2/2/1 por lado em 50 sorteios, nenhum fora do jogo', () => {
    const pool = criarPool()
    for (let i = 0; i < 50; i++) {
      const rodada = sortearRodada(pool, COMPOSICAO_PRIMEIRA, [])!
      expect(rodada).toHaveLength(10)
      expect(new Set(rodada.map(a => a.id)).size).toBe(10)
      expect(rodada.every(a => a.observacao === undefined)).toBe(true)
      expect(rodada.filter(a => a.lado === 'esquerda')).toHaveLength(5)
      expect(rodada.filter(a => a.lado === 'direita')).toHaveLength(5)
      expect([...contarPorPar(rodada).values()]).toEqual([2, 2, 1, 2, 2, 1])
    }
  })
  it('composição histórica: 2 por par (12)', () => {
    const rodada = sortearRodada(criarPool(), { verdadeiro: 2, falso: 2, enganoso: 2 }, [])!
    expect(rodada).toHaveLength(12)
    expect([...contarPorPar(rodada).values()]).toEqual([2, 2, 2, 2, 2, 2])
  })
  it('extra: 1 por par (6) excluindo os ids vistos', () => {
    const vistos = PARES.flatMap(({ lado, veredito }) => [`${lado}-${veredito}-0`, `${lado}-${veredito}-1`])
    const rodada = sortearRodada(criarPool(), COMPOSICAO_EXTRA, vistos)!
    expect(rodada.map(a => a.id).sort()).toEqual(PARES.map(({ lado, veredito }) => `${lado}-${veredito}-2`).sort())
  })
  it('devolve null quando um par não tem itens suficientes (1 falsa sobrando, composição pede 2)', () => {
    expect(sortearRodada(criarPool(), COMPOSICAO_PRIMEIRA, ['direita-falso-0', 'direita-falso-2'])).toBeNull()
    expect(sortearRodada(criarPool(), COMPOSICAO_EXTRA, ['direita-falso-0', 'direita-falso-2'])).not.toBeNull()
  })
  it('é determinístico com aleatorio fixo e embaralhado na saída', () => {
    const pool = criarPool()
    const a = sortearRodada(pool, COMPOSICAO_PRIMEIRA, [], () => 0.3)!
    const b = sortearRodada(pool, COMPOSICAO_PRIMEIRA, [], () => 0.3)!
    expect(a.map(x => x.id)).toEqual(b.map(x => x.id))
    const ordemDosPares = PARES.map(({ lado, veredito }) => `${lado}:${veredito}`)
    const indices = a.map(x => ordemDosPares.indexOf(`${x.lado}:${x.veredito}`))
    expect(indices).not.toEqual([...indices].sort((m, n) => m - n))
  })
})

// Gerador congruente linear semeado: sorteios reproduzíveis nos testes de distribuição.
function lcg(semente: number): () => number {
  let estado = semente
  return () => {
    estado = (estado * 1664525 + 1013904223) % 2 ** 32
    return estado / 2 ** 32
  }
}

describe('sortearPonderado', () => {
  it('escolhe o item de peso maior na grande maioria das vezes', () => {
    const peso: Record<string, number> = { a: 100, b: 1, c: 1 }
    const aleatorio = lcg(42)
    let vezes = 0
    for (let i = 0; i < 500; i++) if (sortearPonderado(['a', 'b', 'c'], 1, (t) => peso[t], aleatorio)[0] === 'a') vezes++
    expect(vezes).toBeGreaterThanOrEqual(475)
  })
  it('pedir todos devolve todos, sem repetir', () => {
    const peso: Record<string, number> = { a: 100, b: 1, c: 1 }
    const escolhidos = sortearPonderado(['a', 'b', 'c'], 3, (t) => peso[t], lcg(7))
    expect([...escolhidos].sort()).toEqual(['a', 'b', 'c'])
  })
  it('pesos todos zero: sorteio uniforme', () => {
    const itens = Array.from({ length: 10 }, (_, i) => i)
    const contagem = new Array<number>(10).fill(0)
    const aleatorio = lcg(3)
    for (let i = 0; i < 2000; i++) contagem[sortearPonderado(itens, 1, () => 0, aleatorio)[0]]++
    for (const n of contagem) {
      expect(n).toBeGreaterThanOrEqual(100)
      expect(n).toBeLessThanOrEqual(300)
    }
  })
})

describe('sortearRodada com pesos por alcance', () => {
  // Um item de alcance 3 e nove de alcance 1 em cada par.
  function poolPorAlcance(): Afirmacao[] {
    const base = afirmacoesValidas[0]
    return PARES.flatMap(({ lado, veredito }) =>
      Array.from({ length: 10 }, (_, i) => ({ ...base, id: `${lado}-${veredito}-${i}`, lado, veredito, alcance: i === 0 ? 3 : 1 }) as Afirmacao),
    )
  }

  // Peso 1000 contra nove de peso 1: chance de 1000/1009 (~99 %) por sorteio. Com peso 100 seria ~92 %.
  it('prefere o item de alcance maior', () => {
    const pool = poolPorAlcance()
    const aleatorio = lcg(11)
    let vezes = 0
    for (let i = 0; i < 500; i++) {
      const rodada = sortearRodada(pool, COMPOSICAO_EXTRA, [], aleatorio, { 1: 1, 2: 1, 3: 1000 })!
      if (rodada.some(a => a.id === 'esquerda-verdadeiro-0')) vezes++
    }
    expect(vezes).toBeGreaterThanOrEqual(475)
  })
  it('com pesos iguais, sorteio uniforme dentro do par', () => {
    const pool = poolPorAlcance()
    const aleatorio = lcg(5)
    const contagem = new Map<string, number>()
    for (let i = 0; i < 2000; i++) {
      const escolhido = sortearRodada(pool, COMPOSICAO_EXTRA, [], aleatorio, { 1: 1, 2: 1, 3: 1 })!.find(
        a => a.lado === 'esquerda' && a.veredito === 'verdadeiro',
      )!
      contagem.set(escolhido.id, (contagem.get(escolhido.id) ?? 0) + 1)
    }
    expect(contagem.size).toBe(10)
    for (const n of contagem.values()) {
      expect(n).toBeGreaterThanOrEqual(100)
      expect(n).toBeLessThanOrEqual(300)
    }
  })
  it('mantém a composição exata e nunca repete um id em 200 sorteios', () => {
    const pool = poolPorAlcance()
    const aleatorio = lcg(9)
    for (let i = 0; i < 200; i++) {
      const rodada = sortearRodada(pool, COMPOSICAO_PRIMEIRA, ['direita-falso-0'], aleatorio, { 1: 1, 2: 2, 3: 4 })!
      expect(rodada).toHaveLength(10)
      expect(new Set(rodada.map(a => a.id)).size).toBe(10)
      expect(rodada.some(a => a.id === 'direita-falso-0')).toBe(false)
      expect([...contarPorPar(rodada).values()]).toEqual([2, 2, 1, 2, 2, 1])
    }
  })
})

describe('semLado', () => {
  it('remove só o lado', () => {
    const { lado: _lado, ...resto } = afirmacoesValidas[0]
    expect(semLado(afirmacoesValidas[0])).toEqual(resto)
    expect('lado' in semLado(afirmacoesValidas[0])).toBe(false)
  })
})

describe('fonteEhPermitida', () => {
  it.each([
    ['https://www.aosfatos.org/noticias/x', true],
    ['https://lupa.uol.com.br/jornalismo/2026/x', true],
    ['https://www.agencialupa.org/checagem/2026/10/18/x/', true],
    ['https://agencialupa.org.evil.com/x', false],
    ['https://projetocomprova.com.br/publicacoes/x', true],
    ['https://g1.globo.com/fato-ou-fake/noticia/2026/x.ghtml', true],
    ['https://g1.globo.com/politica/noticia/x.ghtml', false],
    ['https://g1.globo.com/fato-ou-fakery/x.ghtml', false],
    ['https://www.estadao.com.br/estadao-verifica/x/', true],
    ['https://www.estadao.com.br/politica/x/', false],
    ['http://aosfatos.org/x', false], // https only
  ])('%s -> %s', (url, esperado) => expect(fonteEhPermitida(url)).toBe(esperado))
})
describe('embaralhar', () => {
  it('mantém os mesmos itens e não muta a entrada', () => {
    const entrada = [1, 2, 3, 4]
    const saida = embaralhar(entrada, () => 0.5)
    expect(saida).toEqual([1, 4, 2, 3])
    expect(saida).toHaveLength(4); expect(saida.sort()).toEqual([1, 2, 3, 4]); expect(entrada).toEqual([1, 2, 3, 4])
  })
})
