import type { Evento } from '@/lib/eventos'

// Envio em segundo plano: o chamador não espera e nada aqui lança (nem sem fetch no navegador:
// globalThis.fetch dá undefined onde `fetch` puro daria ReferenceError fora do try).
export function registrarEvento(evento: Evento, enviar: typeof fetch = globalThis.fetch): void {
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
