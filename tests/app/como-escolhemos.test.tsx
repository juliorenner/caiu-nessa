import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ComoEscolhemos from '@/app/como-escolhemos/page'

describe('página /como-escolhemos', () => {
  it('chama o botão de "Cheira mal"', () => {
    render(<ComoEscolhemos />)
    expect(screen.getByText(/o botão "Cheira mal"/)).toBeInTheDocument()
  })
})
