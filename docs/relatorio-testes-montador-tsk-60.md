# Relatório Técnico de QA — TSK-60: Testes do Montador

**ID da Tarefa:** TSK-60  
**Responsável Técnico:** Edinei  
**Área:** Qualidade / QA  
**Data:** 18/11/2026  
**Status:** ✅ APROVADO (100% de Sucesso nos Testes)

---

## 1. Contexto e Objetivos

O objetivo da **TSK-60** é validar integralmente as regras de negócio e de interface do Montador de Avaliações (`MontadorTab` e `ImpressaoTab`) e do serviço de geração de provas (`ExamService`, `QuestionService`, `OmrService`), com foco em quatro pilares fundamentais:

1. **Caderno Impresso x Gabarito/OMR na Mesma Ordem por Aluno e Versão (seed):** Garantir correspondência 1:1 rigorosa entre as questões/alternativas apresentadas no caderno impresso de cada aluno/versão e o gabarito oficial / payload óptico do QR Code.
2. **Pontuação Rigorosa de 10,0 Pontos:** Trava determinística que bloqueia a geração e salvamento de avaliações cuja soma das questões divirja de 10.0 pontos (com tolerância flutuante de arredondamento para 30 questões).
3. **Limite Máximo de 30 Questões:** Imposição de teto máximo de 30 questões por prova em conformidade com o layout da grade óptica (2 colunas de 15 questões).
4. **Agrupamento do Exame N-1:** Mecanismo cumulativo que agrupa automaticamente todas as questões cadastradas para a turma nos ciclos N1, N2, N3 e N-1.

---

## 2. Matriz de Rastreabilidade e Cobertura

| Requisito / Critério | Camada / Arquivo Testado | Arquivo de Teste | Status |
| :--- | :--- | :--- | :---: |
| **Sincronismo Caderno x Gabarito/OMR (Seed)** | `ExamService`, `answerKey`, `shuffle` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Idempotência e Anti-cola por Versão** | `ExamService.shuffleArray`, `ExamModel` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Decodificação 1:1 QR Code OMR** | `codificarGabaritoQr`, `decodificarGabaritoQr` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Trava de Pontuação 10.0 (Menor / Maior)** | `ExamService.validarPontuacaoExame` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Tolerância Flutuante (30 questões / 10.0)** | `ExamService.validarPontuacaoExame` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Validação Backend em `salvarProvaComEscopo`** | `ExamService.salvarProvaComEscopo` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Teto de 30 Questões (`LIMITE_MAXIMO_QUESTOES`)**| `QuestionService.validarLimite` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Bloqueio > 30 em `generateVersions`** | `ExamService.generateVersions` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Geração no Limite Exato de 30 Questões** | `ExamService`, `ImpressaoTab` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Agrupamento N-1 em `contarQuestoesPorCiclo`** | `QuestionService.contarQuestoesPorCiclo` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Filtro Cumulativo N-1 (`filtrarQuestoesAvancado`)**| `QuestionService.filtrarQuestoesAvancado` | `__tests__/services/MontadorCadernoGabaritoTSK60.test.ts` | ✅ Aprovado |
| **Interface: Bloqueio UI Nota != 10.0** | `MontadorTab.tsx` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |
| **Interface: Bloqueio UI Qtd > 30** | `MontadorTab.tsx` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |
| **Interface: Contador X / 30 Questões** | `MontadorTab.tsx` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |
| **Interface: Seleção e Geração Ciclo N-1** | `MontadorTab.tsx` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |
| **Impressão: Subtítulo Exame (N-1)** | `ImpressaoTab.tsx` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |
| **Impressão: Renderização Questões & Letras** | `ImpressaoTab.tsx` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |
| **Impressão: Identificação Nominal QR Code** | `ImpressaoTab.tsx`, `QRCodeWrapper` | `__tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx` | ✅ Aprovado |

---

## 3. Evidência de Execução dos Testes

```bash
> jest --runInBand __tests__/services/MontadorCadernoGabaritoTSK60.test.ts __tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx __tests__/frontend/MontadorTab.test.tsx __tests__/services/ExamService.test.ts __tests__/services/Gabarito30Questoes.test.ts

PASS __tests__/frontend/MontadorCadernoGabaritoTSK60.test.tsx (10 passed)
PASS __tests__/frontend/MontadorTab.test.tsx (6 passed)
PASS __tests__/services/MontadorCadernoGabaritoTSK60.test.ts (18 passed)
PASS __tests__/services/ExamService.test.ts (13 passed)
PASS __tests__/services/Gabarito30Questoes.test.ts (3 passed)

Test Suites: 5 passed, 5 total
Tests:       50 passed, 50 total
Snapshots:   0 total
```

---

## 4. Correções e Otimizações de Integridade Implementadas

1. **`MontadorTab.tsx`**:
   - Adicionada validação explícita de `questoesSelecionadas.length > 30` no manipulador `handleGerarCaderno`.
   - Corrigido `useEffect` de limpeza do aviso de validação para manter a mensagem caso o número de questões ultrapasse 30 (`questoesSelecionadas.length <= 30`).
2. **`ExamService.ts`**:
   - Inseridas validações de consistência em `salvarProvaComEscopo` contra cargas excedentes (> 30 questões) e notas totais divergentes de 10.0 pontos.
   - Protegida a chamada de persistência em fallback de banco de dados offline.
3. **`ImpressaoTab.tsx`**:
   - Suporte transparente para renderização de questões objetivas usando tanto a modelagem de `alternativas` quanto `options`.

---

## 5. Conclusão

Todos os 50 testes automatizados foram executados com 100% de sucesso, sem nenhuma regressão e mantendo total integridade com o restante do ecossistema do SGP Católica SC. A tarefa **TSK-60** está homologada para publicação e merge em produção.
