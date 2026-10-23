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

// O "fim" da urna: três bipes curtos e um longo, em Hz e ms.
export const NOTAS: readonly [frequencia: number, duracaoMs: number][] = [
  [1046, 90],
  [1318, 90],
  [1568, 90],
  [2093, 350],
]
export const PAUSA_MS = 30
const GANHO = 0.08
const RAMPA = 0.01

// Chamar dentro do gesto do usuário: fora dele o navegador bloqueia o contexto. Qualquer erro fica em silêncio.
export function tocarSomDaUrna(criarContexto: () => AudioContext = () => new AudioContext()): void {
  try {
    const ctx = criarContexto()
    let t = ctx.currentTime
    let totalMs = 0
    for (const [frequencia, duracaoMs] of NOTAS) {
      const dur = duracaoMs / 1000
      const osc = ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.value = frequencia
      const ganho = ctx.createGain()
      // Rampa de 10 ms na entrada e na saída para não estalar.
      ganho.gain.setValueAtTime(0, t)
      ganho.gain.linearRampToValueAtTime(GANHO, t + RAMPA)
      ganho.gain.setValueAtTime(GANHO, t + dur - RAMPA)
      ganho.gain.linearRampToValueAtTime(0, t + dur)
      osc.connect(ganho)
      ganho.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + dur)
      t += dur + PAUSA_MS / 1000
      totalMs += duracaoMs + PAUSA_MS
    }
    setTimeout(() => void ctx.close?.(), totalMs + 50)
  } catch {
    // Sem Web Audio ou contexto bloqueado: segue sem som.
  }
}
