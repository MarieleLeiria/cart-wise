# Listagem Chrome Web Store — Cart Wise

## Metadados

- Nome: Cart Wise
- Categoria: Shopping
- Idioma principal: Português (Brasil)
- Política de privacidade: publicar `docs/privacy-policy.md` via GitHub Pages (Settings > Pages > pasta `/docs`) e usar a URL gerada, p.ex. `https://marieleleiria.github.io/cart-wise/privacy-policy`

## Descrição curta (até 132 caracteres)

Salve produtos de qualquer loja online em uma lista local e privada. Sem conta, sem telemetria.

## Descrição longa

O Cart Wise ajuda você a guardar produtos de várias lojas em um só lugar.

- Ative a extensão apenas nas lojas que você escolher ("Ativar neste site").
- Salve o produto com o botão flutuante, o popup, o atalho Ctrl+Shift+S ou o menu de contexto.
- Veja e gerencie sua lista no painel.
- Privacidade: tudo fica no seu navegador. Sem conta, sem telemetria, sem envio de dados.

Limitação: a extração é genérica e depende de metadados da página (JSON-LD/Open Graph). Em páginas sem preço identificável, o produto não é salvo e um aviso é exibido.

## Screenshots (1280x800)

1. Popup com "Ativar neste site".
2. Página de loja com o botão flutuante "Salvar no CartWise".
3. Dashboard com a lista de itens.
4. Dashboard, seção "Sites ativados".

## Justificativas de permissões (campo da CWS)

- `optional_host_permissions: https://*/*`: o usuário ativa explicitamente cada loja; não há hosts fixos no manifest. A permissão é solicitada por site e pode ser revogada.
- `scripting`: registrar content scripts dinamicamente nos sites ativados e injetar o script pontualmente com `activeTab`.
- `activeTab`: ler a aba atual quando o usuário pede para salvar.
- `storage`: guardar lista e configurações localmente.
- `contextMenus`: item "Salvar" no menu de contexto.
- Código remoto: não utilizado.

## Declaração de uso de dados

Nenhum dado de usuário é coletado, transmitido ou vendido. Marcar as três certificações de conformidade.

## Envio

1. `npm run package` em `cart-wise-frontend/` gera `release/cart-wise-<versão>.zip`.
2. Incrementar `version` em `package.json` a cada novo envio (o manifest herda dele).
3. Após aprovação: `git tag v<versão>` e `git push --tags`.
