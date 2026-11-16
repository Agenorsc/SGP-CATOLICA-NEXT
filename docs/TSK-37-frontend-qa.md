# TSK-37 — QA integrado do frontend (RNF07)

Fonte: Backlog N3, linha TSK-37 (responsável Eric Eduardo, prazo 17/11/2026).
Escopo exigido: Login, Montador, Impressão, Leitura, Relatórios, `collectCoverageFrom` e cobertura.

## Implementado nesta etapa
- `jest.config.js`: coleta de cobertura de componentes, serviços e rotas; relatórios text, lcov e json-summary.
- `__tests__/frontend/LoginScreen.integration.test.tsx`: validação vazia, sucesso com normalização, erro 401 e falha de rede.
- `__tests__/frontend/MontadorTab.integration.test.tsx`: estado vazio e acionamento do cadastro de questão.
- `__tests__/frontend/LeituraTab.integration.test.tsx`: integração da aba com o scanner mockado.

## Validação obrigatória antes de abrir PR para merge
```bash
npm ci
npm test -- --runTestsByPath __tests__/frontend/LoginScreen.integration.test.tsx __tests__/frontend/MontadorTab.integration.test.tsx __tests__/frontend/LeituraTab.integration.test.tsx
npm run test:coverage -- --watch=false
npm run build
```

**Pendente:** testes integrados de Impressão e Relatórios, execução de testes e aferição de percentual de cobertura. Os testes da Leitura usam mock do scanner e não comprovam leitura OMR real. Não considerar TSK-37 concluída ou aprovada até cobrir esses itens e CI verde. Esta branch deve permanecer separada das TSK-56 e TSK-62.
