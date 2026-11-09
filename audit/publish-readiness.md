# Cart Wise — O que falta para publicar a extensão

> Alvo: Chrome Web Store (Chrome/Chromium, MV3). Modelo: ativação por site + extração genérica (ADR-0009).
> Data: 2026-11-08. Versão: `0.1.0`.

## Veredito

Funcionalidade MVP e ícones básicos estão no código. A publicação ainda exige **política de privacidade**, **empacotamento release** e **validação manual** do fluxo ativar → revisitar → botão Salvar.

| Categoria | Status |
| --------- | ------ |
| Ativação por site, FAB, captura manual, lista, remoção | Pronto |
| Ícones no manifest | **Pronto** (`public/icons/`) |
| Política de privacidade e listagem CWS | **Faltando** |
| Script `package` (ZIP) | **Faltando** |
| Validação em Chrome real | **Parcial** |

## P0 — bloqueia submissão

| # | Item | Ação |
| - | ---- | ---- |
| 1 | Política de privacidade (URL pública) | Hospedar página: dados só locais, sem telemetria, permissões opcionais host a host |
| 2 | Justificativa `optional_host_permissions: https://*/*` | Explicar: usuário ativa explicitamente cada loja; sem hosts fixos no manifest |
| 3 | Justificativa `scripting` | Registro dinâmico de content scripts + injeção pontual com `activeTab` |
| 4 | Pacote ZIP (`npm run package`) | Zipar `dist/` após `npm run build` |
| 5 | Listagem CWS (textos, screenshots) | Incluir popup com “Ativar neste site” e página com botão flutuante |
| 6 | Conta desenvolvedor CWS | Taxa US$ 5 + 2FA |
| 7 | Checklist manual (abaixo) | Ativar site, fechar navegador, reabrir e confirmar FAB |

## Checklist manual

1. `npm ci && npm run lint && npm run typecheck && npm test && npm run build` em `cart-wise-frontend/`.
2. Carregar `dist/` em `chrome://extensions`.
3. Em loja HTTPS: popup → **Ativar neste site** → conceder permissão.
4. Recarregar a página: botão **Salvar no CartWise** visível (canto inferior esquerdo).
5. Salvar pelo FAB, popup, `Ctrl+Shift+S` e menu de contexto.
6. Dashboard → **Sites ativados** → desativar e confirmar que o FAB some após recarregar.
7. Aba Network: nenhuma requisição originada pela extensão (NFR-PRIV-001).

## P1 recomendado

- Ícones finais de marca (substituir placeholders em `public/icons/`).
- e2e Playwright para ativação de site (além da lista no popup).
- Aceitar TRD/NFR (`proposed` → `accepted`).
- `package.json`: `author`, `license`, estratégia de versão para CWS.

## Observações

- Extração genérica falha em páginas sem JSON-LD/OG de preço → toast `price_not_found`.
- Revisão CWS pode pedir vídeo do fluxo de permissão opcional por host.
