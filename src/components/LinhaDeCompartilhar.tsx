import type { ReactNode } from 'react'
import { IconeBaixar, IconeInstagram, IconeMais, IconeWhatsApp } from './icones/Compartilhar'
import { CIRCULO_ICONE_PRIMARIO, CIRCULO_ICONE_SECUNDARIO, ITEM_COMPARTILHAR, ROTULO_ICONE } from './rotulos'

// Conteúdo de um item: círculo com o ícone e o rótulo curto embaixo. O controle (link ou botão)
// envolve os dois, com o nome acessível completo no `aria-label`, que contém o rótulo visível.
function Conteudo({ icone, rotulo, primario = false }: { icone: ReactNode; rotulo: string; primario?: boolean }) {
  return (
    <>
      <span className={primario ? CIRCULO_ICONE_PRIMARIO : CIRCULO_ICONE_SECUNDARIO}>{icone}</span>
      <span aria-hidden className={ROTULO_ICONE}>
        {rotulo}
      </span>
    </>
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
      <div className="flex justify-center gap-1.5 min-[360px]:gap-2.5 lg:justify-start">
        <a
          href={p.urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mandar no WhatsApp"
          onClick={p.onWhatsApp}
          className={ITEM_COMPARTILHAR}
        >
          <Conteudo icone={<IconeWhatsApp />} rotulo="WhatsApp" primario />
        </a>
        {p.onInstagram && (
          <button type="button" aria-label="Mandar para o Instagram" onClick={p.onInstagram} className={ITEM_COMPARTILHAR}>
            <Conteudo icone={<IconeInstagram />} rotulo="Instagram" />
          </button>
        )}
        <a
          download={p.nomeArquivo}
          href={p.urlImagem}
          aria-label="Baixar imagem para os stories"
          onClick={p.onBaixar}
          className={ITEM_COMPARTILHAR}
        >
          <Conteudo icone={<IconeBaixar />} rotulo="Baixar" />
        </a>
        <button type="button" aria-label="Mais opções de compartilhar" onClick={p.onMais} className={ITEM_COMPARTILHAR}>
          <Conteudo icone={<IconeMais />} rotulo="Mais" />
        </button>
      </div>
    </div>
  )
}
