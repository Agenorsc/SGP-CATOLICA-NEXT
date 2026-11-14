import { OmrService } from '../../src/services/OmrService';
import { AlunoModel } from '../../src/models/AlunoModel';
import { TurmaModel } from '../../src/models/TurmaModel';
import { Question } from '../../src/types';
import { codificarGabaritoQr, decodificarGabaritoQr, sementeGabarito } from '../../src/lib/answerKey';

describe('TSK-59 - Validação do Gabarito de 30 Questões e Resolução Dinâmica de Cabeçalho', () => {
  let omrService: OmrService;

  const mockAluno = new AlunoModel({
    id: 'alu-01',
    nome: 'GABRIEL MENEZES',
    ra: '20241001',
    turmaId: 't1'
  });

  const mockTurmaEngenharia = new TurmaModel({
    id: 't1',
    nome: 'Engenharia de Software IV',
    curso: 'Engenharia de Software',
    semestre: '2026/2',
    professorId: 'usr-prof-01',
    professorNome: 'Prof. Agenor Alvise'
  });

  const letras: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

  // Criação de 30 questões objetivas completas
  const mock30Questoes: Question[] = Array.from({ length: 30 }, (_, i) => {
    const qNum = i + 1;
    const corretaIndex = i % 5;
    return {
      id: `q_${qNum}`,
      tipo: 'objetiva',
      type: 'OBJECTIVE',
      enunciado: `Enunciado da questão objetiva número ${qNum} sobre Engenharia de Software.`,
      pontuacao: Number((10 / 30).toFixed(4)),
      tags: ['Engenharia de Software', 'N3'],
      options: letras.map((letra, lIdx) => ({
        letter: letra,
        text: `Opção ${letra} para a questão ${qNum}`,
        isCorrect: lIdx === corretaIndex
      }))
    };
  });

  beforeEach(() => {
    omrService = new OmrService();
  });

  describe('1. Codificação e Decodificação de Gabarito com 30 Questões no QR Code', () => {
    it('deve codificar e decodificar perfeitamente 30 questões preservando o gabarito e pontuação', () => {
      const examId = 'EXAM-t1-N3';
      const ra = '20241001';
      const versao = 'A';
      const semente = sementeGabarito(examId, ra, versao);

      const respostasCorretas = mock30Questoes.map(q => {
        const correta = q.options?.find(o => o.isCorrect);
        return correta ? correta.letter : 'A';
      });
      const opcoesPorQuestao = mock30Questoes.map(q => q.options?.length || 5);
      const pontos = mock30Questoes.map(() => 10 / 30);

      const layout = codificarGabaritoQr(respostasCorretas, opcoesPorQuestao, pontos, semente);

      expect(layout.nq).toBe(30);
      expect(layout.op).toHaveLength(30);
      expect(layout.k).toHaveLength(30);

      const decodificado = decodificarGabaritoQr(layout, semente);

      expect(decodificado).not.toBeNull();
      expect(decodificado!.totalQuestoes).toBe(30);
      expect(decodificado!.opcoesPorQuestao).toHaveLength(30);
      expect(decodificado!.pontos).toHaveLength(30);

      // Valida cada uma das 30 respostas decodificadas
      for (let n = 1; n <= 30; n++) {
        expect(decodificado!.gabarito[n]).toBe(respostasCorretas[n - 1]);
      }
    });

    it('deve decodificar corretamente gabarito de 30 questões com opções variadas (4 e 5 alternativas)', () => {
      const semente = 'EXAM-30Q|1328834|B';
      const respostasCorretas = Array.from({ length: 30 }, (_, i) => letras[i % 4]);
      const opcoesPorQuestao = Array.from({ length: 30 }, (_, i) => (i < 15 ? 4 : 5));
      const pontos = Array.from({ length: 30 }, () => 0.33);

      const layout = codificarGabaritoQr(respostasCorretas, opcoesPorQuestao, pontos, semente);
      const decodificado = decodificarGabaritoQr(layout, semente);

      expect(decodificado).not.toBeNull();
      expect(decodificado!.totalQuestoes).toBe(30);
      expect(decodificado!.opcoesPorQuestao.slice(0, 15)).toEqual(Array(15).fill(4));
      expect(decodificado!.opcoesPorQuestao.slice(15, 30)).toEqual(Array(15).fill(5));
      for (let n = 1; n <= 30; n++) {
        expect(decodificado!.gabarito[n]).toBe(respostasCorretas[n - 1]);
      }
    });
  });

  describe('2. Correção Automatizada de Avaliação Completa com 30 Questões', () => {
    it('deve calcular corretamente acertos, erros, questões em branco e nota final com 30 questões', () => {
      const gabaritoOficial = omrService.gerarGabaritoOficialVersao(mock30Questoes, 'A', false, false);
      expect(Object.keys(gabaritoOficial)).toHaveLength(30);

      // Simula respostas do aluno:
      // Q1 a Q20: Acertos
      // Q21 a Q25: Erros
      // Q26 a Q28: Em branco (null)
      // Q29 a Q30: Anuladas
      const respostasDetectadas: Record<number, string | null> = {};
      const statusCustom: Record<number, 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO'> = {};

      for (let i = 1; i <= 30; i++) {
        if (i <= 20) {
          respostasDetectadas[i] = gabaritoOficial[i];
          statusCustom[i] = 'CORRETA';
        } else if (i <= 25) {
          // Erro: marca alternativa diferente
          const gab = gabaritoOficial[i];
          const errada = letras.find(l => l !== gab) || 'E';
          respostasDetectadas[i] = errada;
          statusCustom[i] = 'INCORRETA';
        } else if (i <= 28) {
          respostasDetectadas[i] = null;
          statusCustom[i] = 'EM_BRANCO';
        } else {
          respostasDetectadas[i] = null;
          statusCustom[i] = 'ANULADA';
        }
      }

      const resultado = omrService.processarCorrecaoAutomatica({
        aluno: mockAluno,
        turma: mockTurmaEngenharia,
        materia: 'Engenharia de Software IV',
        versaoLetra: 'A',
        questoesBase: mock30Questoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        statusCustom,
        fiduciaisValidados: true
      });

      expect(resultado.totalQuestoes).toBe(30);
      expect(resultado.acertos).toBe(20);
      expect(resultado.detalhesQuestoes).toHaveLength(30);

      // 20 acertos de 30 questões = 20 / 30 * 10 = 6.67
      expect(resultado.notaCalculada).toBeCloseTo(6.67, 1);

      // Verifica status de cada questão
      expect(resultado.detalhesQuestoes?.filter(q => q.status === 'CORRETA')).toHaveLength(20);
      expect(resultado.detalhesQuestoes?.filter(q => q.status === 'INCORRETA')).toHaveLength(5);
      expect(resultado.detalhesQuestoes?.filter(q => q.status === 'EM_BRANCO')).toHaveLength(3);
      expect(resultado.detalhesQuestoes?.filter(q => q.status === 'ANULADA')).toHaveLength(2);
    });

    it('deve conceder nota 10.0 quando o estudante acertar todas as 30 questões', () => {
      const gabaritoOficial = omrService.gerarGabaritoOficialVersao(mock30Questoes, 'A', false, false);
      const respostasDetectadas: Record<number, string | null> = {};

      for (let i = 1; i <= 30; i++) {
        respostasDetectadas[i] = gabaritoOficial[i];
      }

      const resultado = omrService.processarCorrecaoAutomatica({
        aluno: mockAluno,
        turma: mockTurmaEngenharia,
        materia: 'Engenharia de Software IV',
        versaoLetra: 'A',
        questoesBase: mock30Questoes,
        shuffleQ: false,
        shuffleAlt: false,
        respostasDetectadas,
        fiduciaisValidados: true
      });

      expect(resultado.totalQuestoes).toBe(30);
      expect(resultado.acertos).toBe(30);
      expect(resultado.notaCalculada).toBe(10.0);
    });
  });
});
