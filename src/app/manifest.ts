import type { MetadataRoute } from 'next'
import { DESCRICAO, TITULO } from '@/lib/site'

// "Adicionar à tela inicial": nome, ícone e cores do papel.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: TITULO,
    short_name: TITULO,
    description: DESCRICAO,
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff3dc',
    theme_color: '#fff3dc',
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
