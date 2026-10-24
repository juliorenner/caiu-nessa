import { describe, expect, it } from 'vitest'
import { blocoDeCodigo, contribuicaoSchema, issueDaContribuicao, MAX_CONTEXTO, MAX_DESCRICAO, normalizarLink } from '@/lib/contribuicao'

const URL_OK = 'https://www.aosfatos.org/noticias/checamos-debate-globo/'

describe('contribuicaoSchema', () => {
  it('sugestão: aceita checagem das agências do banco, com ou sem contexto', () => {
    for (const url of [
      URL_OK,
      'https://lupa.uol.com.br/jornalismo/2026/10/23/x',
      'https://g1.globo.com/fato-ou-fake/eleicoes/noticia/x.ghtml',
      'https://www.estadao.com.br/estadao-verifica/x/',
    ])
      expect(contribuicaoSchema.safeParse({ tipo: 'sugestao', url }).success).toBe(true)
    expect(contribuicaoSchema.safeParse({ tipo: 'sugestao', url: URL_OK, contexto: 'No debate.', site: '' }).success).toBe(true)
  })

  it('sugestão: recusa outro domínio, matéria comum do G1, http e contexto longo', () => {
    for (const url of ['https://www.exemplo.com/x', 'https://g1.globo.com/politica/x', 'ftp://www.aosfatos.org/x', 'não é link', ''])
      expect(contribuicaoSchema.safeParse({ tipo: 'sugestao', url }).success).toBe(false)
    expect(contribuicaoSchema.safeParse({ tipo: 'sugestao', url: URL_OK, contexto: 'x'.repeat(MAX_CONTEXTO + 1) }).success).toBe(false)
  })

  it('problema: descrição de 10 a 1000 letras e tela da lista', () => {
    expect(contribuicaoSchema.safeParse({ tipo: 'problema', descricao: 'O botão não funciona.' }).success).toBe(true)
    expect(contribuicaoSchema.safeParse({ tipo: 'problema', descricao: 'curto' }).success).toBe(false)
    expect(contribuicaoSchema.safeParse({ tipo: 'problema', descricao: 'x'.repeat(MAX_DESCRICAO + 1) }).success).toBe(false)
    expect(contribuicaoSchema.safeParse({ tipo: 'problema', descricao: 'O botão não funciona.', tela: 'Fim de jogo' }).success).toBe(true)
    expect(contribuicaoSchema.safeParse({ tipo: 'problema', descricao: 'O botão não funciona.', tela: 'Admin' }).success).toBe(false)
  })

  it('campo-armadilha preenchido, chave extra ou tipo desconhecido: recusa', () => {
    expect(contribuicaoSchema.safeParse({ tipo: 'sugestao', url: URL_OK, site: 'http://spam' }).success).toBe(false)
    expect(contribuicaoSchema.safeParse({ tipo: 'sugestao', url: URL_OK, email: 'a@b.c' }).success).toBe(false)
    expect(contribuicaoSchema.safeParse({ tipo: 'elogio', texto: 'oi' }).success).toBe(false)
  })
})

describe('normalizarLink', () => {
  it('completa o https:// que falta e troca http por https; o resto fica como está', () => {
    expect(normalizarLink(' aosfatos.org/noticias/x/ ')).toBe('https://aosfatos.org/noticias/x/')
    expect(normalizarLink('www.aosfatos.org/x')).toBe('https://www.aosfatos.org/x')
    expect(normalizarLink('http://g1.globo.com/fato-ou-fake/x')).toBe('https://g1.globo.com/fato-ou-fake/x')
    expect(normalizarLink('https://lupa.uol.com.br/x')).toBe('https://lupa.uol.com.br/x')
    expect(normalizarLink('ftp://aosfatos.org/x')).toBe('ftp://aosfatos.org/x')
  })

  it('o esquema aceita o link sem protocolo e entrega já normalizado', () => {
    const r = contribuicaoSchema.safeParse({ tipo: 'sugestao', url: 'www.aosfatos.org/noticias/x/' })
    expect(r.success && r.data.tipo === 'sugestao' && r.data.url).toBe('https://www.aosfatos.org/noticias/x/')
  })
})

describe('issueDaContribuicao', () => {
  it('blocoDeCodigo: a cerca é maior que qualquer sequência de crases do texto', () => {
    expect(blocoDeCodigo('oi @fulano')).toBe('```text\noi @fulano\n```')
    expect(blocoDeCodigo('a ```` b')).toBe('`````text\na ```` b\n`````')
  })

  it('sugestão: título com o endereço, link e contexto em bloco de código, rótulo sugestão', () => {
    const i = issueDaContribuicao({ tipo: 'sugestao', url: URL_OK, contexto: 'Flávio no debate, @alguem' })
    expect(i.title).toBe('Sugestão: aosfatos.org/noticias/checamos-debate-globo/')
    expect(i.labels).toEqual(['sugestão'])
    expect(i.body).toContain(`\`\`\`text\n${URL_OK}\n\`\`\``)
    expect(i.body).toContain('```text\nFlávio no debate, @alguem\n```')
  })

  it('problema: título com o começo do relato, tela e rótulo bug', () => {
    const i = issueDaContribuicao({ tipo: 'problema', descricao: 'O botão\nContinuar não faz nada.', tela: 'Fim de jogo' })
    expect(i.title).toBe('Problema: O botão Continuar não faz nada.')
    expect(i.labels).toEqual(['bug'])
    expect(i.body).toContain('**Tela:** Fim de jogo')
    const longo = issueDaContribuicao({ tipo: 'problema', descricao: 'x'.repeat(200) })
    expect(longo.title.length).toBeLessThanOrEqual('Problema: '.length + 70)
  })
})
