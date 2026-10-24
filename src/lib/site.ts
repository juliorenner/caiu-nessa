import { TOTAL_AFIRMACOES } from '@/lib/rodadas'

// Endereço, nome e descrição do site: todo texto e URL de compartilhamento vem daqui.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://caiunessa.com.br'
export const DOMINIO = 'caiunessa.com.br'
export const TITULO = 'Caiu Nessa?'
export const DESCRICAO = `${TOTAL_AFIRMACOES} afirmações da eleição. Verdade, mentira ou cheira mal? Descubra em quantas você caiu.`

// Repositório público: código, issues de sugestão e de problema.
export const REPOSITORIO_GITHUB = 'juliorenner/caiu-nessa'
export const URL_REPOSITORIO = `https://github.com/${REPOSITORIO_GITHUB}`
