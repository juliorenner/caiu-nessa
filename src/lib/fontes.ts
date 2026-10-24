// Quais checagens valem como fonte: as do banco e as sugeridas pelo formulário. Sem dados aqui, para o
// formulário (no navegador) não carregar o banco inteiro.
function hostEhDominio(host: string, dominio: string): boolean {
  return host === dominio || host === `www.${dominio}`
}

export function fonteEhPermitida(url: string): boolean {
  let endereco: URL
  try {
    endereco = new URL(url)
  } catch {
    return false
  }
  if (endereco.protocol !== 'https:') return false

  const host = endereco.hostname
  const caminho = endereco.pathname
  if (hostEhDominio(host, 'aosfatos.org')) return true
  if (hostEhDominio(host, 'projetocomprova.com.br')) return true
  if (host === 'lupa.uol.com.br') return true
  if (hostEhDominio(host, 'agencialupa.org')) return true
  if (host === 'g1.globo.com') return caminho === '/fato-ou-fake' || caminho.startsWith('/fato-ou-fake/')
  if (hostEhDominio(host, 'estadao.com.br')) return caminho.includes('estadao-verifica')
  return false
}
