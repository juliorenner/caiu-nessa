# Link de resultado com prévia (design)

Data: 2026-10-22, noite. Pedido do autor: "geralmente se compartilha um png? ou um link pro site com o resultado onde a pessoa pode também começar o jogo?" → recomendação aceita ("perfeito, vá em frente, faça tudo isso que conversamos"). As escolhas de como fazer estão aqui como decisão do controlador. Revisado por um construtor antes da entrega; as três dúvidas dele (imagem junto do link, link duplicado, domínio) estão resolvidas no texto como decisão do controlador.

## Intenção
No WhatsApp e em grupos, o que converte é um link cuja prévia já mostra o placar e cujo toque abre o jogo. Hoje o texto compartilhado aponta para a home. Passa a apontar para uma página de resultado: a prévia é o cartão com o placar, a página diz "Alguém fez 4/12 e caiu em 3. E você?" e tem o botão Começar. A imagem dos stories continua igual (Instagram não aceita link).

## Objetivos
- Um link curto e estável por resultado, sem banco e sem identidade: `caiunessa.com.br/r/4-12-3-caiu-feio-aeaqeeaeeqea` (os mesmos cinco parâmetros validados de `/cartao`, separados por hífen).
- A prévia do link (Open Graph) é uma variante 1200×630 do cartão: placar grande, faixa carimbada, grade de acertos, "E você?".
- A página mostra o placar do amigo (sem nome, sem afirmações) e o botão **Começar** para `/quiz`.
- O texto compartilhado passa a terminar com esse link em vez do domínio.
- Na tela de placar, **duas ações separadas**: **Compartilhar placar** (link + texto, sem imagem: é o caminho que gera a prévia com o placar no WhatsApp) e **Mandar para os stories** (imagem 1080×1920 + texto, quando o navegador aceita arquivos; senão vira o link "Baixar imagem para os stories"). *(Decisão do controlador: com imagem anexada o WhatsApp mostra a imagem com legenda e não monta a prévia do link; os dois canais precisam de ações diferentes.)*

## Não objetivos
- Nome de quem compartilhou, comparação entre amigos, ranking, qualquer coisa gravada no banco.
- Mudar `/cartao` ou a imagem dos stories.
- Encurtador de URL.

## Anti-objetivos
- Revelar afirmações, lados ou a ordem das perguntas (a grade mostra só acerto/erro/quase na ordem sorteada daquela pessoa; a próxima rodada é outro sorteio).
- Página de resultado que vire página de jogo "pré-respondida": o botão sempre abre uma rodada nova.
- Link inválido quebrando com 500: é 404.

## Restrições
- A URL pública é `https://caiunessa.com.br` (`SITE_URL` de `src/lib/site.ts`); o DNS propagou em 22/10 por volta das 21h e o domínio responde, então o link compartilhado já funciona.
- Stack atual, sem dependência nova. `ImageResponse` como em `/cartao` (fontes de `src/app/fontes/`).
- Validação: o código `{a}-{t}-{c}-{f}-{g}` é separado em cinco partes (o slug da faixa contém hífens: separar pelos dois primeiros e dois últimos hífens, não por `split('-')` simples) e passa por `parametrosSchema` de `src/lib/cartao.ts`; inválido → `notFound()`.
- Página `src/app/r/[codigo]/page.tsx` (server component) com `generateMetadata`; imagem `src/app/r/[codigo]/opengraph-image.tsx` (dinâmica, `Cache-Control` 1 dia / 7 dias como `/cartao`), `size` 1200×630, `alt` "Alguém fez 4/12 no Caiu Nessa? E você?".
- Textos exatos: título da página e `og:title`: `Alguém fez 4/12 no Caiu Nessa?`; descrição e `og:description`: `Caiu em 3 das falsas ou enganosas. E você? 12 afirmações da eleição: verdade, mentira ou cheira mal.` (com `Não caiu em nenhuma.` quando c = 0); na página: ficha `Placar de um amigo` / `Rodada de 12` (ou `6`), número `4/12`, faixa carimbada, grade de casas (como no placar: tinta cheia, X, ?), frase `Caiu em 3 das falsas ou enganosas.`, botão **Começar**, link `Como escolhemos as afirmações`.

## O que foi decidido (como)
- `src/lib/cartao.ts`: `codigoDoResultado(p): string` (→ `4-12-3-caiu-feio-aeaqeeaeeqea`) e `parametrosDoCodigo(codigo: string): Parametros | null` (inverso, validado); `urlDoResultado(p)` → `/r/<codigo>`.
- `src/lib/compartilhar.ts`: `textoDeCompartilhar({ acertos, total, caiu, url? })`: sem `url`, termina na frase "E você?"; com `url`, acrescenta a linha com a URL absoluta (`${SITE_URL}/r/<codigo>`).
- `src/lib/compartilhar-navegador.ts`: `compartilhar` ganha um parâmetro `modo: 'link' | 'imagem'`. `link`: `navigator.share({ text: textoSemUrl, url, title })` (o link vai só em `url`, nunca duplicado); sem `share` → clipboard com o texto **com** a URL. `imagem`: `navigator.share({ files, text: textoComUrl, title })` quando `canShare({ files })` e o arquivo chegou; senão devolve `'indisponivel'` e a interface mostra o link "Baixar imagem para os stories" (o botão de stories só aparece quando `canShare` aceita arquivos; no desktop fica só o link de baixar). `AbortError` continua `'cancelado'`.
- `ResultadoFinal`: botão primário **Compartilhar placar** (`modo: 'link'`), botão secundário **Mandar para os stories** (`modo: 'imagem'`, só quando há suporte a arquivos), link **Baixar imagem para os stories** sempre; o aviso `Texto copiado` / `Não deu para copiar` continua. *(Decisão do controlador.)*
- `src/app/_imagens/CartaoOg.tsx`: composição 1200×630 (paisagem): à esquerda carimbo + `PLACAR` + `4/12` + faixa; à direita a grade de casas (2×6 ou 1×6, casas de 72 px) e `E você? caiunessa.com.br`; moldura e faixa como na imagem OG da home.
- `src/app/r/[codigo]/page.tsx`: mesma estrutura visual da tela de placar (Ficha, número com sombra, faixa, grade via um componente `GradeDeCasas` reutilizável em HTML/Tailwind), sem botões de compartilhar; `Começar` = `BOTAO_PRIMARIO` para `/quiz`; marca-d'água do político se já existir.
- Testes: ida e volta código↔parâmetros, códigos inválidos → `notFound` (mock de `next/navigation`), `generateMetadata` com título/descrição exatos e `openGraph.images` apontando para a imagem da rota, `GET` da imagem 200/IHDR 1200×630, texto compartilhado com a URL, `ResultadoFinal` chamando `share` com a URL do resultado.

## Deixado para quem constrói
- Como separar o código com segurança (regex `^(\d+)-(\d+)-(\d+)-([a-z-]+)-([aeq]+)$`).
- O desenho exato da variante paisagem (olhar o PNG).
- Se a página de resultado também mostra a comparação "você acertou mais que X%" (não: ela é de quem jogou; a página é de quem recebe).

## Critério de pronto
`curl -I` da imagem de um código válido devolve PNG 1200×630; a página do código mostra placar, faixa, grade e Começar; código inválido → 404; a home renderizada de um link `/r/...` tem `og:image` absoluta para a imagem do código; o texto e o `share` usam a URL do resultado; lint, typecheck, testes e build verdes; a prévia conferida num validador de OG (`curl` nas tags) e, pelo autor, no WhatsApp.
