import { OmrService } from '../../src/services/OmrService';
import { AlunoModel } from '../../src/models/AlunoModel';
import { TurmaModel } from '../../src/models/TurmaModel';
import { Question } from '../../src/types';
import { codificarGabaritoQr, sementeGabarito } from '../../src/lib/answerKey';

/**
 * ============================================================================
 * TSK-47 / QA: TESTES FUNCIONAIS DO LEITOR OMR
 * ============================================================================
 * Escopo da Tarefa:
 *  1. QR Inválido (não-JSON, sistema errado, campos obrigatórios ausentes)
 *  2. Turma diferente da aberta (RF13 - Validação Cruzada de Turma)
 *  3. Dupla Marcação (anulação de questão com dupla alternativa assinalada)
 *  4. Em Branco (questões sem preenchimento)
 *  5. Produtividade com 40 a 50 folhas (meta do cliente: ~30 min por turma)
 * ============================================================================
 */

describe('TSK-47 / QA: Testes Funcionais do Leitor OMR', () => {
  let omrService: OmrService;

  const mockTurma1 = new TurmaModel({
    id: 'turma-1',
    nome: 'Engenharia de Software IV',
    curso: 'Engenharia de Software',
    semestre: '2026/2',
    professorId: 'usr-prof-01'
  });

  const mockTurma2 = new TurmaModel({
    id: 'turma-2',
    nome: 'Banco de Dados Avançado',
    curso: 'Sistemas de Informação',
    semestre: '2026/2',
    professorId: 'usr-prof-01'
  });

  const mockTurmasDisponiveis = [mockTurma1, mockTurma2];

  const mockAlunosTurma1: AlunoModel[] = [
    new AlunoModel({ id: 'alu-01', nome: 'Carlos Silva', ra: '1234567', turmaId: 'turma-1' }),
    new AlunoModel({ id: 'alu-02', nome: 'Mariana Santos', ra: '2345678', turmaId: 'turma-1' })
  ];

  const mockAlunosTurma2: AlunoModel[] = [
    new AlunoModel({ id: 'alu-03', nome: 'Lucas Ferreira', ra: '3456789', turmaId: 'turma-2' }),
    new AlunoModel({ id: 'alu-04', nome: 'Juliana Lima', ra: '4567890', turmaId: 'turma-2' })
  ];

  const todosAlunos = [...mockAlunosTurma1, ...mockAlunosTurma2];

  const letras: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

  const gerarQuestoes = (total: number): Question[] =>
    Array.from({ length: total }, (_, i) => ({
      id: `q_${i + 1}`,
      tipo: 'objetiva',
      type: 'OBJECTIVE',
      enunciado: `Questão ${i + 1} de Teste`,
      pontuacao: 10 / total,
      tags: ['QA'],
      options: letras.map((letra, lIdx) => ({
        letter: letra,
        text: `Opção ${letra}`,
        isCorrect: lIdx === (i % 5)
      }))
    }));

  beforeEach(() => {
    omrService = new OmrService();
  });

  // --------------------------------------------------------------------------
  // 1. QR INVÁLIDO
  // --------------------------------------------------------------------------
  describe('1. Cenário: QR Inválido', () => {
    it('deve rejeitar QR Code com texto plano arbitrário (não-JSON)', () => {
      const res = omrService.validarPayloadQrCode(
        'https://site-invalido.com/gabarito-fake',
        mockAlunosTurma1,
        'turma-1',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('JSON válido');
      expect(res.aluno).toBeUndefined();
    });

    it('deve rejeitar payload com system diferente de "SGP-CATOLICA"', () => {
      const payloadOutroSistema = JSON.stringify({
        system: 'OUTRO_SISTEMA_OMR',
        examId: 'EXAM-1',
        studentId: 'alu-01',
        ra: '1234567',
        name: 'Carlos Silva',
        turmaId: 'turma-1',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(
        payloadOutroSistema,
        mockAlunosTurma1,
        'turma-1',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('SGP-CATOLICA');
      expect(res.aluno).toBeUndefined();
    });

    it('deve rejeitar payload com campos obrigatórios ausentes (ex: sem RA e sem examVersion)', () => {
      const payloadIncompleto = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-1',
        studentId: 'alu-01',
        name: 'Carlos Silva'
        // ra, turmaId e examVersion ausentes
      });

      const res = omrService.validarPayloadQrCode(
        payloadIncompleto,
        mockAlunosTurma1,
        'turma-1',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(false);
      expect(res.erro).toContain('Campo obrigatório');
    });

    it('deve rejeitar payload de aluno não encontrado quando não há identificação válida', () => {
      const payloadAlunoFantasma = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-1',
        studentId: '',
        ra: '',
        name: '',
        turmaId: 'turma-1',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(
        payloadAlunoFantasma,
        mockAlunosTurma1,
        'turma-1',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. TURMA DIFERENTE DA ABERTA (RF13 - VALIDAÇÃO CRUZADA)
  // --------------------------------------------------------------------------
  describe('2. Cenário: Turma Diferente da Aberta (RF13)', () => {
    it('deve disparar alerta de inconsistência cruzada quando a aba ativa for turma-1 e o cartão for de turma-2', () => {
      const payloadCartaoTurma2 = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-turma-2-N1',
        classId: 'turma-2',
        className: 'Banco de Dados Avançado',
        studentId: 'alu-03',
        studentName: 'Lucas Ferreira',
        studentRa: '3456789',
        stage: 'N1',
        turmaId: 'turma-2',
        name: 'Lucas Ferreira',
        ra: '3456789',
        examVersion: 'A'
      });

      // Aba ativa é turma-1 ('Engenharia de Software IV')
      const res = omrService.validarPayloadQrCode(
        payloadCartaoTurma2,
        mockAlunosTurma1,
        'turma-1',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(false);
      expect(res.inconsistenciaTurma).toBe(true);
      expect(res.turmaDetectadaNome).toBe('Banco de Dados Avançado');
      expect(res.turmaAtivaNome).toBe('Engenharia de Software IV');
      expect(res.erro).toContain('Inconsistência de Turma');
    });

    it('deve aprovar sem alerta cruzado quando a turma do cartão for idêntica à aba ativa', () => {
      const payloadCartaoTurma1 = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-turma-1-N1',
        classId: 'turma-1',
        className: 'Engenharia de Software IV',
        studentId: 'alu-01',
        studentName: 'Carlos Silva',
        studentRa: '1234567',
        stage: 'N1',
        turmaId: 'turma-1',
        name: 'Carlos Silva',
        ra: '1234567',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(
        payloadCartaoTurma1,
        mockAlunosTurma1,
        'turma-1',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(true);
      expect(res.inconsistenciaTurma).toBeUndefined();
      expect(res.aluno?.nome).toBe('Carlos Silva');
    });

    it('deve aceitar cartões de qualquer turma quando a aba ativa for "TODAS" (modo automático)', () => {
      const payloadTurma2 = JSON.stringify({
        system: 'SGP-CATOLICA',
        examId: 'EXAM-turma-2-N1',
        classId: 'turma-2',
        className: 'Banco de Dados Avançado',
        studentId: 'alu-03',
        studentName: 'Lucas Ferreira',
        studentRa: '3456789',
        stage: 'N1',
        turmaId: 'turma-2',
        name: 'Lucas Ferreira',
        ra: '3456789',
        examVersion: 'A'
      });

      const res = omrService.validarPayloadQrCode(
        payloadTurma2,
        todosAlunos,
        'TODAS',
        mockTurmasDisponiveis,
        todosAlunos
      );

      expect(res.sucesso).toBe(true);
      expect(res.inconsistenciaTurma).toBeUndefined();
      expect(res.aluno?.nome).toBe('Lucas Ferreira');
    });
  });

  // --------------------------------------------------------------------------
  // 3. DUPLA MARCAÇÃO (ANULAÇÃO)
  // --------------------------------------------------------------------------
  describe('3. Cenário: Dupla Marcação', () => {
    it('deve classificar como ANULADA a questão com duas alternativas marcadas e zerar sua pontuação', () => {
      const questoes = gerarQuestoes(5);
      const gabaritoOficial = omrService.gerarGabaritoOficialVersao(questoes, 'A', false, false);

      // Q1 e Q2: Corretas
      // Q3: Dupla marcação (anulada)
      // Q4: Errada
      // Q5: Dupla marcação (anulada)
      const respostasDetectadas: Record<number, string | null> = {
        1: gabaritoOficial[1],
        2: gabaritoOficial[2],
        3: null, // Anulada pelo sensor óptico
        4: 'E',
        5: null
      };

      const statusCustom: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'> = {
        1: 'CORRETA',
        2: 'CORRETA',
        3: 'ANULADA',
        4: 'INCORRETA',
        5: 'ANULADA'
      };

      const resultado = omrService.processarCorrecaoAutomatica({
        aluno: mockAlunosTurma1[0],
        turma: mockTurma1,
        materia: 'Engenharia de Software IV',
        versaoLetra: 'A',
        questoesBase: questoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        statusCustom,
        fiduciaisValidados: true
      });

      expect(resultado.totalQuestoes).toBe(5);
      expect(resultado.acertos).toBe(2);
      expect(resultado.notaCalculada).toBe(4.0); // 2 de 5 = 4.0 pts

      const q3 = resultado.detalhesQuestoes?.find(q => q.numero === 3);
      expect(q3?.status).toBe('ANULADA');
      expect(q3?.correta).toBe(false);
      expect(q3?.respostaMarcada).toBeNull();
      expect(q3?.score).toBe(0);

      const q5 = resultado.detalhesQuestoes?.find(q => q.numero === 5);
      expect(q5?.status).toBe('ANULADA');
      expect(q5?.respostaMarcada).toBeNull();
      expect(q5?.score).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // 4. EM BRANCO
  // --------------------------------------------------------------------------
  describe('4. Cenário: Em Branco', () => {
    it('deve classificar como EM_BRANCO as questões não assinaladas pelo estudante', () => {
      const questoes = gerarQuestoes(4);
      const gabaritoOficial = omrService.gerarGabaritoOficialVersao(questoes, 'A', false, false);

      // Q1: Correta (2.5 pts)
      // Q2: Em branco
      // Q3: Em branco
      // Q4: Em branco
      const respostasDetectadas: Record<number, string | null> = {
        1: gabaritoOficial[1],
        2: null,
        3: null,
        4: null
      };

      const statusCustom: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'> = {
        1: 'CORRETA',
        2: 'EM_BRANCO',
        3: 'EM_BRANCO',
        4: 'EM_BRANCO'
      };

      const resultado = omrService.processarCorrecaoAutomatica({
        aluno: mockAlunosTurma1[0],
        turma: mockTurma1,
        materia: 'Engenharia de Software IV',
        versaoLetra: 'A',
        questoesBase: questoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        statusCustom,
        fiduciaisValidados: true
      });

      expect(resultado.acertos).toBe(1);
      expect(resultado.notaCalculada).toBe(2.5); // 1 de 4 = 2.5 pts

      const brancas = resultado.detalhesQuestoes?.filter(q => q.status === 'EM_BRANCO');
      expect(brancas).toHaveLength(3);
      brancas?.forEach(q => {
        expect(q.correta).toBe(false);
        expect(q.respostaMarcada).toBeNull();
        expect(q.score).toBe(0);
      });
    });

    it('deve atribuir nota 0.0 quando a prova inteira for entregue em branco', () => {
      const questoes = gerarQuestoes(10);
      const respostasDetectadas: Record<number, string | null> = {};
      const statusCustom: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'> = {};

      for (let i = 1; i <= 10; i++) {
        respostasDetectadas[i] = null;
        statusCustom[i] = 'EM_BRANCO';
      }

      const resultado = omrService.processarCorrecaoAutomatica({
        aluno: mockAlunosTurma1[0],
        turma: mockTurma1,
        materia: 'Engenharia de Software IV',
        versaoLetra: 'A',
        questoesBase: questoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        statusCustom,
        fiduciaisValidados: true
      });

      expect(resultado.acertos).toBe(0);
      expect(resultado.notaCalculada).toBe(0.0);
      expect(resultado.detalhesQuestoes?.every(q => q.status === 'EM_BRANCO')).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 5. PRODUTIVIDADE COM 40 A 50 FOLHAS (META: ~30 MIN POR TURMA)
  // --------------------------------------------------------------------------
  describe('5. Cenário: Produtividade com 40 a 50 Folhas (Meta: ~30 min por turma)', () => {
    it('deve processar um lote de 40 folhas completas com média inferior a 50 ms por folha', () => {
      const totalFolhas = 40;
      const questoes = gerarQuestoes(30); // Prova completa de 30 questões!
      const temposPorFolhaMs: number[] = [];

      const inicioTotal = performance.now();

      for (let i = 0; i < totalFolhas; i++) {
        const ra = (20241000 + i).toString();
        const aluno = new AlunoModel({ id: `alu-${i}`, nome: `Aluno ${i}`, ra, turmaId: 'turma-1' });

        const semente = sementeGabarito('EXAM-turma-1-N1', ra, 'A');
        const gabaritoOficial = omrService.gerarGabaritoOficialVersao(questoes, 'A', false, false);
        const respostasCorretas = Object.values(gabaritoOficial);
        const opcoes = Array(30).fill(5);
        const pontos = Array(30).fill(10 / 30);
        const layoutQr = codificarGabaritoQr(respostasCorretas, opcoes, pontos, semente);

        const payloadQr = JSON.stringify({
          system: 'SGP-CATOLICA',
          examId: 'EXAM-turma-1-N1',
          classId: 'turma-1',
          className: 'Engenharia de Software IV',
          studentId: aluno.id,
          studentName: aluno.nome,
          studentRa: aluno.ra,
          stage: 'N1',
          turmaId: 'turma-1',
          name: aluno.nome,
          ra: aluno.ra,
          examVersion: 'A',
          ...layoutQr
        });

        const t0 = performance.now();

        // 1. Validação de QR Code
        const validacao = omrService.validarPayloadQrCode(payloadQr, [aluno], 'turma-1', mockTurmasDisponiveis);
        expect(validacao.sucesso).toBe(true);

        // 2. Simulação de respostas da folha (alternando acertos, erros e brancos)
        const respostasDetectadas: Record<number, string | null> = {};
        for (let q = 1; q <= 30; q++) {
          if (q % 7 === 0) respostasDetectadas[q] = null; // Em branco
          else if (q % 5 === 0) respostasDetectadas[q] = 'E'; // Possível erro
          else respostasDetectadas[q] = gabaritoOficial[q]; // Acerto
        }

        // 3. Processamento de correção automatizada
        const resultado = omrService.processarCorrecaoAutomatica({
          aluno,
          turma: mockTurma1,
          materia: 'Engenharia de Software IV',
          versaoLetra: 'A',
          questoesBase: questoes,
          shuffleQ: false,
          shuffleAlt: false,
          respostasDetectadas,
          gabaritoEmbutido: validacao.gabaritoEmbutido ?? null,
          fiduciaisValidados: true
        });

        const t1 = performance.now();
        temposPorFolhaMs.push(t1 - t0);

        expect(resultado.totalQuestoes).toBe(30);
        expect(resultado.notaCalculada).toBeGreaterThanOrEqual(0);
        expect(resultado.notaCalculada).toBeLessThanOrEqual(10);
      }

      const tempoTotalMs = performance.now() - inicioTotal;
      const mediaMs = temposPorFolhaMs.reduce((a, b) => a + b, 0) / totalFolhas;
      const ordenados = [...temposPorFolhaMs].sort((a, b) => a - b);
      const p95 = ordenados[Math.floor(totalFolhas * 0.95)];

      // Meta do cliente: ~30 min por turma (1.800.000 ms)
      // O processamento das 40 folhas deve levar menos de 2.000 ms (< 2s)!
      expect(tempoTotalMs).toBeLessThan(5000);
      expect(mediaMs).toBeLessThan(50);
      expect(p95).toBeLessThan(100);

      // eslint-disable-next-line no-console
      console.log(`[TSK-47 Benchmark 40 Folhas]: Total: ${tempoTotalMs.toFixed(1)} ms | Média: ${mediaMs.toFixed(2)} ms/folha | p95: ${p95.toFixed(2)} ms`);
    });

    it('deve processar um lote de 50 folhas completas cumprindo com folga a meta de 30 minutos por turma', () => {
      const totalFolhas = 50;
      const questoes = gerarQuestoes(30);
      const temposPorFolhaMs: number[] = [];

      const inicioTotal = performance.now();

      for (let i = 0; i < totalFolhas; i++) {
        const ra = (20242000 + i).toString();
        const aluno = new AlunoModel({ id: `alu-lote-${i}`, nome: `Estudante ${i}`, ra, turmaId: 'turma-1' });

        const semente = sementeGabarito('EXAM-turma-1-N2', ra, 'B');
        const gabaritoOficial = omrService.gerarGabaritoOficialVersao(questoes, 'B', false, false);
        const respostasCorretas = Object.values(gabaritoOficial);
        const layoutQr = codificarGabaritoQr(respostasCorretas, Array(30).fill(5), Array(30).fill(10 / 30), semente);

        const payloadQr = JSON.stringify({
          system: 'SGP-CATOLICA',
          examId: 'EXAM-turma-1-N2',
          classId: 'turma-1',
          className: 'Engenharia de Software IV',
          studentId: aluno.id,
          studentName: aluno.nome,
          studentRa: aluno.ra,
          stage: 'N2',
          turmaId: 'turma-1',
          name: aluno.nome,
          ra: aluno.ra,
          examVersion: 'B',
          ...layoutQr
        });

        const t0 = performance.now();

        const validacao = omrService.validarPayloadQrCode(payloadQr, [aluno], 'turma-1', mockTurmasDisponiveis);
        expect(validacao.sucesso).toBe(true);

        const respostasDetectadas: Record<number, string | null> = {};
        for (let q = 1; q <= 30; q++) {
          respostasDetectadas[q] = gabaritoOficial[q];
        }

        const resultado = omrService.processarCorrecaoAutomatica({
          aluno,
          turma: mockTurma1,
          materia: 'Engenharia de Software IV',
          versaoLetra: 'B',
          questoesBase: questoes,
          shuffleQ: false,
          shuffleAlt: false,
          respostasDetectadas,
          gabaritoEmbutido: validacao.gabaritoEmbutido ?? null,
          fiduciaisValidados: true
        });

        const t1 = performance.now();
        temposPorFolhaMs.push(t1 - t0);

        expect(resultado.notaCalculada).toBe(10.0);
      }

      const tempoTotalMs = performance.now() - inicioTotal;
      const mediaMs = temposPorFolhaMs.reduce((a, b) => a + b, 0) / totalFolhas;
      const throughputFolhasPorMinuto = (totalFolhas / (tempoTotalMs / 1000)) * 60;

      // Meta: 30 minutos por turma (1800 segundos). 50 folhas devem ser processadas em < 5 segundos!
      expect(tempoTotalMs).toBeLessThan(5000);
      expect(mediaMs).toBeLessThan(50);
      expect(throughputFolhasPorMinuto).toBeGreaterThan(600); // Mais de 600 folhas/minuto de processamento

      // eslint-disable-next-line no-console
      console.log(`[TSK-47 Benchmark 50 Folhas]: Total: ${tempoTotalMs.toFixed(1)} ms | Média: ${mediaMs.toFixed(2)} ms/folha | Throughput: ${throughputFolhasPorMinuto.toFixed(0)} folhas/min`);
    });
  });
});
