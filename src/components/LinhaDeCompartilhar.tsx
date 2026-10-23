import type { ReactNode } from 'react'
import { IconeBaixar, IconeInstagram, IconeMais, IconeWhatsApp } from './icones/Compartilhar'
import { BOTAO_ICONE, BOTAO_ICONE_PRIMARIO, ROTULO_ICONE } from './rotulos'

// Um item da linha: círculo com o ícone e o rótulo curto embaixo. O nome acessível completo vai
// no `aria-label` do controle e contém o rótulo visível.
function Item({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <span className="flex w-[72px] flex-col items-center gap-2">
      {children}
      <span aria-hidden className={ROTULO_ICONE}>
        {rotulo}
      </span>
    </span>
  )
}

// Linha de compartilhar da tela de placar. Quem chama é dono do estado e dos avisos: aqui só os
// controles e o que cada toque dispara. `onInstagram` ausente = o navegador não aceita arquivos.
export function LinhaDeCompartilhar(p: {
  urlWhatsApp: string
  onWhatsApp: () => void
  onInstagram?: () => void
  urlImagem: string
  nomeArquivo: string
  onBaixar: () => void
  onMais: () => void
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <p className="font-letreiro text-[13px]">Compartilhar</p>
      <div className="flex justify-center gap-2.5">
        <Item rotulo="WhatsApp">
          <a
            href={p.urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mandar no WhatsApp"
            onClick={p.onWhatsApp}
            className={BOTAO_ICONE_PRIMARIO}
          >
            <IconeWhatsApp />
          </a>
        </Item>
        {p.onInstagram && (
          <Item rotulo="Instagram">
            <button type="button" aria-label="Mandar para o Instagram" onClick={p.onInstagram} className={BOTAO_ICONE}>
              <IconeInstagram />
            </button>
          </Item>
        )}
        <Item rotulo="Baixar">
          <a
            download={p.nomeArquivo}
            href={p.urlImagem}
            aria-label="Baixar imagem para os stories"
            onClick={p.onBaixar}
            className={BOTAO_ICONE}
          >
            <IconeBaixar />
          </a>
        </Item>
        <Item rotulo="Mais">
          <button type="button" aria-label="Mais opções de compartilhar" onClick={p.onMais} className={BOTAO_ICONE}>
            <IconeMais />
          </button>
        </Item>
      </div>
    </div>
  )
}
