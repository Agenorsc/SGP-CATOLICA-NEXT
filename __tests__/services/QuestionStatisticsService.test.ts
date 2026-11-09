import { QuestionStatisticsService } from '@/services/QuestionStatisticsService';
import { LeituraOMRRegistro } from '@/types';

const leitura = (id: string, turmaId: string, detalhesQuestoes: LeituraOMRRegistro['detalhesQuestoes']): LeituraOMRRegistro => ({
  id, alunoId: id, alunoNome: id, ra: id, turmaId, turmaNome: turmaId, materia: 'Matemática', versao: 'A',
  acertos: 0, totalQuestoes: 1, notaCalculada: 0, dataLeitura: '2026-11-09', respostasDetectadas: {}, detalhesQuestoes
});

describe('QuestionStatisticsService', () => {
  it('agrega acertos, alternativas, distrator, brancos e anuladas por questão', () => {
    const resultado = QuestionStatisticsService.gerar([
      leitura('1', 'turma-1', [{ numero: 1, respostaMarcada: 'A', respostaCorreta: 'A', correta: true, status: 'CORRETA' }]),
      leitura('2', 'turma-1', [{ numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', correta: false, status: 'INCORRETA' }]),
      leitura('3', 'turma-1', [{ numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', correta: false, status: 'INCORRETA' }]),
      leitura('4', 'turma-1', [{ numero: 1, respostaMarcada: null, respostaCorreta: 'A', correta: false, status: 'EM_BRANCO' }]),
      leitura('5', 'turma-1', [{ numero: 1, respostaMarcada: 'C', respostaCorreta: 'A', correta: false, status: 'ANULADA' }])
    ], { turmaId: 'turma-1' });

    const questao = resultado.questoes[0];
    expect(resultado.totalLeituras).toBe(5);
    expect(questao).toMatchObject({ totalSubmissoes: 5, totalAcertos: 1, percentualAcerto: 20, totalErros: 2, totalEmBranco: 1, totalAnuladas: 1 });
    expect(questao.contagemPorAlternativa).toEqual([
      { alternativa: 'A', quantidade: 1, percentual: 20 },
      { alternativa: 'B', quantidade: 2, percentual: 40 },
      { alternativa: 'C', quantidade: 1, percentual: 20 }
    ]);
    expect(questao.distratorMaisMarcado).toEqual({ alternativa: 'B', quantidade: 2, percentual: 100 });
  });

  it('filtra por turma e ordena as questões por número', () => {
    const resultado = QuestionStatisticsService.gerar([
      leitura('1', 'turma-1', [{ numero: 2, respostaMarcada: 'A', respostaCorreta: 'A', correta: true, status: 'CORRETA' }]),
      leitura('2', 'turma-2', [{ numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', correta: false, status: 'INCORRETA' }]),
      leitura('3', 'turma-1', [{ numero: 1, respostaMarcada: 'A', respostaCorreta: 'A', correta: true, status: 'CORRETA' }])
    ], { turmaId: 'turma-1' });

    expect(resultado.totalLeituras).toBe(2);
    expect(resultado.questoes.map(questao => questao.numero)).toEqual([1, 2]);
  });

  it('não cria distrator para respostas em branco ou anuladas', () => {
    const resultado = QuestionStatisticsService.gerar([
      leitura('1', 'turma-1', [{ numero: 1, respostaMarcada: null, respostaCorreta: 'A', correta: false, status: 'EM_BRANCO' }]),
      leitura('2', 'turma-1', [{ numero: 1, respostaMarcada: 'B', respostaCorreta: 'A', correta: false, status: 'ANULADA' }])
    ]);
    expect(resultado.questoes[0].distratorMaisMarcado).toBeUndefined();
  });
});
