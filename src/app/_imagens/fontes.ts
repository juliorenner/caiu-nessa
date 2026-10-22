import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

type Fontes = { bungee: Buffer; atkinson: Buffer }

// Lidas do disco uma vez por processo; nunca buscadas de host externo.
let cache: Promise<Fontes> | undefined

function ler(nome: string) {
  return readFile(join(process.cwd(), 'src/app/fontes', nome))
}

export async function carregarFontes(): Promise<Fontes> {
  cache ??= Promise.all([ler('Bungee-Regular.ttf'), ler('AtkinsonHyperlegible-Bold.ttf')]).then(
    ([bungee, atkinson]) => ({ bungee, atkinson }),
  )
  return cache
}

export function fontesParaImagem(
  f: Fontes,
): { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[] {
  return [
    { name: 'Bungee', data: f.bungee, weight: 400, style: 'normal' },
    { name: 'Atkinson Hyperlegible', data: f.atkinson, weight: 700, style: 'normal' },
  ]
}
