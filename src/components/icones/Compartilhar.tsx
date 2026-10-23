// Ícones da linha de compartilhar: traço só, herdam a cor do texto. Decorativos (o rótulo está no botão).
const TRACO = {
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function IconeWhatsApp() {
  return (
    <svg {...TRACO}>
      <path d="M3 21l1.6-4.6A9 9 0 1 1 8 19.6L3 21z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.5-1.5-2-1-1 1a4 4 0 0 1-2.5-2.5l1-1-1-2L9 9.5z" />
    </svg>
  )
}

export function IconeInstagram() {
  return (
    <svg {...TRACO}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

export function IconeBaixar() {
  return (
    <svg {...TRACO}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  )
}

export function IconeMais() {
  return (
    <svg {...TRACO}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4" />
      <path d="M8.2 13.2l7.6 4.4" />
    </svg>
  )
}
