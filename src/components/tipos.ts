import type { Afirmacao } from '@/lib/afirmacoes'

// `lado` fica no servidor: o cliente nunca recebe de que lado é cada afirmação.
export type AfirmacaoNoQuiz = Omit<Afirmacao, 'lado'>
