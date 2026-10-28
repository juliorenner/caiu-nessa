import type { Evento } from '@/lib/eventos'
import { jogadorInterno } from '@/lib/interno'

// Envio em segundo plano: o chamador não espera e nada aqui lança (nem sem fetch no navegador:
// globalThis.fetch dá undefined onde `fetch` puro daria ReferenceError fora do try).
// O jogador interno não envia nada.
export function registrarEvento(
  evento: Evento,
  enviar: typeof fetch = globalThis.fetch,
  interno: boolean = jogadorInterno(),
): void {
  if (interno) return
  try {
    enviar('/api/evento', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(evento),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // Sem fetch ou falha síncrona: o evento se perde, o jogo segue.
  }
}
