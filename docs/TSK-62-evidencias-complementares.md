# TSK-62 — Evidências complementares de QA (RF09 / RNF05)

## Escopo desta PR
A TSK-62 já teve a correção de impressão individual integrada pela PR #29. Esta PR acrescenta **testes automatizados de regressão estática** sobre o contrato de impressão, sem reimplementar a correção existente e sem alterar a TSK-56.

## Evidências rastreáveis
- Código de teste: `__tests__/print/TSK62PrintContract.test.ts`
- Arquivos inspecionados: `src/app/globals.css` e `src/components/impressao/ImpressaoTab.tsx`
- Contratos verificados: A4 retrato com margens; controles ocultos; verso do cartão condicionado ao duplex; quebras de página; proteção contra divisão de questão, imagem e alternativas.
- Histórico de validação em PDF no Chrome: `docs/TSK-62-impressao-a4.md` (PR #29).

## O que NÃO está validado por esses testes
Estes testes verificam declarações de CSS/JSX, **não renderizam PDFs** e não provam a paginação real do navegador. A inspeção visual de PDF no Edge, a impressão física duplex pela borda longa e a impressão em lote com TSK-52 continuam pendentes. Não marcar esses itens como aprovados.

## Como executar
```bash
npm ci
npm test -- --runTestsByPath __tests__/print/TSK62PrintContract.test.ts
npm run build
```

## Checklist para validação do Agenor
1. Conferir os testes no CI e revisar alterações na PR.
2. Gerar PDF no Chrome e Edge em A4 retrato, 100%, sem cabeçalhos/rodapés.
3. Confirmar que o cartão está na página 1, o verso vazio na página 2 e o caderno inicia na página 3 quando duplex estiver ativo.
4. Repetir sem duplex (caderno começa na página 2).
5. Verificar questões longas e com imagem perto da quebra.
6. Quando a TSK-52 estiver integrada, repetir para dois alunos e cadernos com número ímpar de páginas.
7. Executar impressão física quando houver equipamento disponível.

**Status:** automação adicionada; execução no CI e testes manuais sujeitos à validação. Impressora física indisponível para o autor.
