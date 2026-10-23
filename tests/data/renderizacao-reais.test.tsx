// Cada afirmação real passa pelo cartão e pelo painel do veredito sem erro e com o texto visível.
// Pega conteúdo que quebra a interface (caractere estranho, campo que o componente não espera).
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { CartaoAfirmacao } from '@/components/CartaoAfirmacao'
import { PainelVeredito } from '@/components/PainelVeredito'
import dados from '@/data/afirmacoes.json'
import { semLado, validarPool } from '@/lib/afirmacoes'

const todas = validarPool(dados)

afterEach(cleanup)

it.each(todas.map((a) => [a.id, a] as const))('cartão e painel renderizam a afirmação %s', (_id, a) => {
  const afirmacao = semLado(a)
  render(
    <CartaoAfirmacao afirmacao={afirmacao} fase="ativo" respostaDada={null} onResposta={() => {}} reduzirMovimento semente={0} />,
  )
  expect(screen.getByText(a.texto)).toBeInTheDocument()
  cleanup()
  render(
    <PainelVeredito afirmacao={afirmacao} respostaDada={a.veredito} erroPct={null} ultima={false} onFechar={() => {}} reduzirMovimento />,
  )
  expect(screen.getByText(a.explicacao)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Ver a checagem/ })).toHaveAttribute('href', a.fonte_url)
})
