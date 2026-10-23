export const CHAVE_SOM = 'caiu-nessa:som'

// Ler `localStorage` pode lançar (modo privado, cookies bloqueados): sem armazém, segue o padrão.
function armazemPadrao(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

// Preferência do som da urna: ligado salvo quando gravado 'desligado'.
export function somLigado(armazem: Storage | null = armazemPadrao()): boolean {
  try {
    return armazem?.getItem(CHAVE_SOM) !== 'desligado'
  } catch {
    return true
  }
}

export function definirSom(ligado: boolean, armazem: Storage | null = armazemPadrao()): void {
  try {
    armazem?.setItem(CHAVE_SOM, ligado ? 'ligado' : 'desligado')
  } catch {
    // Sem onde gravar: a escolha vale só nesta visita.
  }
}
