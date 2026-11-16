# TSK-37 — Testes integrados de frontend (RNF07)

Fonte: Planner Backlog N3, TSK-37. Escopo: Login, Montador, Impressão, Leitura, Relatórios e cobertura Jest/React Testing Library.

## Entrega refeita

- `jest.config.js`: `collectCoverageFrom` para frontend, serviços e rotas; relatórios text, lcov e json-summary.
- `__tests__/frontend/LoginScreen.integration.test.tsx`: validação de formulário, autenticação, erro 401 e indisponibilidade com fallback isolado.
- `__tests__/frontend/MontadorTab.integration.test.tsx`: estado vazio e abertura de cadastro; fixture alinhada a `ContagemCiclos`.
- `__tests__/frontend/ImpressaoTab.integration.test.tsx`: renderização do cartão de impressão com dados mínimos.
- `__tests__/frontend/LeituraTab.integration.test.tsx`: passagem de contexto ao scanner com mock.
- `__tests__/frontend/RelatoriosTab.integration.test.tsx`: renderização de indicadores sem dados e ausência de exportação indevida.

## Comandos de validação

```bash
npm ci
npm test -- --runTestsByPath __tests__/frontend/LoginScreen.integration.test.tsx __tests__/frontend/MontadorTab.integration.test.tsx __tests__/frontend/ImpressaoTab.integration.test.tsx __tests__/frontend/LeituraTab.integration.test.tsx __tests__/frontend/RelatoriosTab.integration.test.tsx
npm run test:coverage -- --watch=false
npm run build
```

## Evidências e limites

Os testes verificam comportamento de componentes com mocks para serviços externos, não testes end-to-end. A cobertura deve ser medida com `npm run test:coverage`, e seu percentual não foi medido nesta edição. **O ambiente de edição não executou npm/Jest/build:** o CI deve passar antes de solicitar merge. Se algum teste falhar, revisar o log e corrigir na mesma branch. Esta PR não altera TSK-56 ou TSK-62.
