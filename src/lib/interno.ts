export const CHAVE_INTERNO = 'caiu-nessa:interno'

// Ler `localStorage` pode lançar (modo privado, cookies bloqueados): sem armazém, ninguém é interno.
function armazemPadrao(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// Jogador interno (o dono testando, o teste de fumaça em produção): nada dele vai para as métricas.
// A marca fica só neste navegador e não identifica ninguém.
export function jogadorInterno(armazem: Storage | null = armazemPadrao()): boolean {
  try {
    return armazem?.getItem(CHAVE_INTERNO) === '1'
  } catch {
    return false
  }
}

// `?interno=1` liga a marca e `?interno=0` desliga; sem o parâmetro, nada muda.
export function lerMarcaDaUrl(busca: string, armazem: Storage | null = armazemPadrao()): void {
  const valor = new URLSearchParams(busca).get('interno')
  try {
    if (valor === '1') armazem?.setItem(CHAVE_INTERNO, '1')
    else if (valor === '0') armazem?.removeItem(CHAVE_INTERNO)
  } catch {
    // Sem onde gravar: a marca não fica.
  }
}
