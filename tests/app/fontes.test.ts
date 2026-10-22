import { readFile } from 'node:fs/promises'
import { expect, it, vi } from 'vitest'
import { carregarFontes } from '@/app/_imagens/fontes'

vi.mock('node:fs/promises', () => ({ readFile: vi.fn() }))

it('leitura que falha não fica no cache: a chamada seguinte lê de novo', async () => {
  const leitura = vi.mocked(readFile)
  leitura.mockRejectedValueOnce(new Error('EIO')).mockResolvedValue(Buffer.from('ttf'))
  await expect(carregarFontes()).rejects.toThrow('EIO')
  await expect(carregarFontes()).resolves.toEqual({ bungee: Buffer.from('ttf'), atkinson: Buffer.from('ttf') })
})
