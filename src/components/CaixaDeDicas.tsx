import { SUPERFICIE } from './rotulos'
import { Tecla } from './Tecla'

// Dentro da superfície branca: cores sem variante escura (o branco é o mesmo nos dois temas).
const DICAS = [
  { tecla: '←', cor: 'mentira', rotulo: 'Mentira' },
  { tecla: '↑', cor: 'cheira', rotulo: 'Cheira mal' },
  { tecla: '→', cor: 'verdade', rotulo: 'Verdade' },
] as const

// Coluna da direita do quiz em lg enquanto o painel do veredito não abre; no celular não aparece.
export function CaixaDeDicas() {
  return (
    <aside aria-label="Dicas de teclado" className={`hidden lg:flex lg:flex-col lg:gap-4 lg:p-6 ${SUPERFICIE}`}>
      <h2 className="font-letreiro text-[15px] leading-none">Teclas</h2>
      <ul className="flex flex-col gap-3">
        {DICAS.map(({ tecla, cor, rotulo }) => (
          <li key={tecla} className="flex items-center gap-3 font-letreiro text-[13px]">
            <Tecla cor={cor} className="inline-flex w-8">
              {tecla}
            </Tecla>
            {rotulo}
          </li>
        ))}
      </ul>
      <p className="text-sm text-secundario">ou arraste com o mouse</p>
    </aside>
  )
}
