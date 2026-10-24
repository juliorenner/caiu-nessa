import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormularioContribuicao } from '@/components/FormularioContribuicao'

const enviar = (nome: RegExp) => fireEvent.click(screen.getByRole('button', { name: nome }))
const assentar = () => act(() => new Promise(r => setTimeout(r, 0)))

function stubFetch(resposta: Response | Promise<never>) {
  const f = vi.fn().mockReturnValue(resposta instanceof Response ? Promise.resolve(resposta) : resposta)
  vi.stubGlobal('fetch', f)
  return f
}

afterEach(() => vi.unstubAllGlobals())

describe('FormularioContribuicao: sugestão', () => {
  it('avisa que vira issue pública e que não pedimos nome nem e-mail', () => {
    render(<FormularioContribuicao tipo="sugestao" />)
    expect(screen.getByText(/issue pública no GitHub/)).toBeInTheDocument()
    expect(screen.getByText(/Não pedimos nome nem e-mail/)).toBeInTheDocument()
  })

  it('link vazio, não-link e domínio fora da lista: mensagem certa e nenhum envio', () => {
    const f = stubFetch(new Response(null, { status: 500 }))
    render(<FormularioContribuicao tipo="sugestao" />)
    enviar(/Enviar sugestão/)
    expect(screen.getByRole('alert')).toHaveTextContent('Cole o link da checagem')
    fireEvent.change(screen.getByLabelText(/Link da checagem/), { target: { value: 'abc' } })
    enviar(/Enviar sugestão/)
    expect(screen.getByRole('alert')).toHaveTextContent('Isso não parece um link')
    fireEvent.change(screen.getByLabelText(/Link da checagem/), { target: { value: 'https://www.exemplo.com/x' } })
    enviar(/Enviar sugestão/)
    expect(screen.getByRole('alert')).toHaveTextContent('não é de uma checagem aceita')
    expect(screen.getByLabelText(/Link da checagem/)).toHaveAttribute('aria-invalid', 'true')
    expect(f).not.toHaveBeenCalled()
  })

  it('envio aceito: POST com link e contexto, mostra o número da issue e o link', async () => {
    const f = stubFetch(Response.json({ numero: 42, url: 'https://github.com/juliorenner/caiu-nessa/issues/42' }, { status: 201 }))
    render(<FormularioContribuicao tipo="sugestao" />)
    fireEvent.change(screen.getByLabelText(/Link da checagem/), { target: { value: ' https://www.aosfatos.org/noticias/x/ ' } })
    fireEvent.change(screen.getByLabelText(/Contexto/), { target: { value: 'No debate da Globo' } })
    enviar(/Enviar sugestão/)
    await assentar()
    const [url, init] = f.mock.calls[0]
    expect(url).toBe('/api/contribuicao')
    expect(JSON.parse(init.body)).toEqual({ tipo: 'sugestao', url: 'https://www.aosfatos.org/noticias/x/', contexto: 'No debate da Globo', site: '' })
    expect(screen.getByRole('status')).toHaveTextContent('#42')
    expect(screen.getByRole('link', { name: /Ver a issue no GitHub/ })).toHaveAttribute('href', 'https://github.com/juliorenner/caiu-nessa/issues/42')
  })

  it('falha no envio: mantém o texto, oferece tentar de novo e o link direto para o GitHub', async () => {
    stubFetch(new Response(null, { status: 503 }))
    render(<FormularioContribuicao tipo="sugestao" />)
    fireEvent.change(screen.getByLabelText(/Link da checagem/), { target: { value: 'https://www.aosfatos.org/noticias/x/' } })
    enviar(/Enviar sugestão/)
    await assentar()
    expect(screen.getByRole('alert')).toHaveTextContent('Não deu para enviar agora')
    expect(screen.getByLabelText(/Link da checagem/)).toHaveValue('https://www.aosfatos.org/noticias/x/')
    expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /abra a issue direto no GitHub/ })).toHaveAttribute(
      'href',
      'https://github.com/juliorenner/caiu-nessa/issues/new',
    )
  })
})

describe('FormularioContribuicao: problema', () => {
  it('descrição curta: mensagem e nenhum envio; aceita com a tela escolhida', async () => {
    const f = stubFetch(Response.json({ numero: 7, url: 'https://x/7' }, { status: 201 }))
    render(<FormularioContribuicao tipo="problema" />)
    fireEvent.change(screen.getByLabelText(/O que aconteceu/), { target: { value: 'curto' } })
    enviar(/Enviar relato/)
    expect(screen.getByRole('alert')).toHaveTextContent('pelo menos 10 letras')
    expect(f).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText(/O que aconteceu/), { target: { value: 'O botão Continuar não faz nada.' } })
    fireEvent.change(screen.getByLabelText(/Em qual tela/), { target: { value: 'Fim de jogo' } })
    enviar(/Enviar relato/)
    await assentar()
    expect(JSON.parse(f.mock.calls[0][1].body)).toEqual({ tipo: 'problema', descricao: 'O botão Continuar não faz nada.', tela: 'Fim de jogo', site: '' })
    expect(screen.getByRole('status')).toHaveTextContent('rótulo “bug”')
  })
})
