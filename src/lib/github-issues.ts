import type { NovaIssue } from '@/lib/contribuicao'
import { REPOSITORIO_GITHUB } from '@/lib/site'

export interface IssueCriada {
  numero: number
  url: string
}

export type CriarIssue = (issue: NovaIssue) => Promise<IssueCriada>

// GITHUB_ISSUES_TOKEN: token fine-grained só deste repositório, com Issues: read and write e nada mais.
export function criadorDeIssues(token: string, fetchFn: typeof fetch = fetch): CriarIssue {
  return async issue => {
    const resposta = await fetchFn(`https://api.github.com/repos/${REPOSITORIO_GITHUB}/issues`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issue),
    })
    if (!resposta.ok) throw new Error(`GitHub respondeu ${resposta.status}`)
    const criada = (await resposta.json()) as { number: number; html_url: string }
    return { numero: criada.number, url: criada.html_url }
  }
}
