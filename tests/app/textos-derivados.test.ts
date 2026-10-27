import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { render } from '@testing-library/react'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import Home from '@/app/page'
import { TOTAL_AFIRMACOES } from '@/lib/rodadas'
import { DESCRICAO } from '@/lib/site'

// Só src/lib/rodadas.ts descreve o tamanho das rodadas; os dados (src/data) ficam de fora da varredura.
const RAIZ = join(process.cwd(), 'src')
const IGNORADOS = new Set(['data', join('lib', 'rodadas.ts')])
const PROIBIDOS = [/\b\d+ afirmaç/, /de cada por lado/, /\b(6|8|12) \| (6|8|12)\b/]

function arquivos(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(dir, entrada.name)
    if (IGNORADOS.has(relative(RAIZ, caminho))) return []
    return entrada.isDirectory() ? arquivos(caminho) : [caminho]
  })
}

describe('textos derivados de src/lib/rodadas.ts', () => {
  const lista = arquivos(RAIZ)

  it('varre os arquivos de src/', () => {
    expect(lista.some((f) => f.endsWith(join('app', 'page.tsx')))).toBe(true)
    expect(lista.some((f) => f.endsWith(join('lib', 'rodadas.ts')))).toBe(false)
  })

  it.each(PROIBIDOS)('nenhum arquivo fixa o tamanho da rodada no texto (%s)', (padrao) => {
    const ofensores = lista.filter((f) => padrao.test(readFileSync(f, 'utf8'))).map((f) => relative(RAIZ, f))
    expect(ofensores).toEqual([])
  })

  it('a home e a descrição mostram TOTAL_AFIRMACOES', () => {
    const { container } = render(createElement(Home))
    expect(container.textContent).toContain(`${TOTAL_AFIRMACOES} afirmações do mundo político brasileiro.`)
    expect(DESCRICAO.startsWith(`${TOTAL_AFIRMACOES} afirmações do mundo político brasileiro.`)).toBe(true)
  })
})
