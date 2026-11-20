import { ExamService } from '../../src/services/ExamService';
import { QuestionService, LIMITE_MAXIMO_QUESTOES } from '../../src/services/QuestionService';
import { OmrService } from '../../src/services/OmrService';
import { ExamRepository } from '../../src/repositories/ExamRepository';
import { Question, ProvaMontadaRegistro, Student } from '../../src/types';
import { codificarGabaritoQr, decodificarGabaritoQr, sementeGabarito } from '../../src/lib/answerKey';
import { shuffleArray } from '../../src/lib/shuffle';

describe('TSK-60 — Testes do Montador: Caderno Impresso x Gabarito/OMR, Pontuação 10.0, Limite 30q e Exame N-1', () => {
  let examService: ExamService;
  let questionService: QuestionService;
  let omrService: OmrService;
  let mockExamRepo: ExamRepository;

  const letras: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

  const mockStudents: Student[] = [
    { id: 'alu-01', nome: 'Gabriel Menezes', matricula: '20241001', email: 'gabriel.m@catolicasc.edu.br' },
    { id: 'alu-02', nome: 'Beatriz Ramos', matricula: '20241002', email: 'beatriz.r@catolicasc.edu.br' },
    { id: 'alu-03', nome: 'Carlos Eduardo', matricula: '20241003', email: 'carlos.e@catolicasc.edu.br' },
    { id: 'alu-04', nome: 'Daniela Silva', matricula: '20241004', email: 'daniela.s@catolicasc.edu.br' }
  ];

  // Gerador de banco de questões auxiliar
  const criarQuestaoObjetiva = (
    id: string,
    enunciado: string,
    pontuacao: number,
    corretaIdx: number = 0,
    avaliacao: 'N1' | 'N2' | 'N3' | 'N-1' | 'GERAL' = 'N2',
    turmaId: string = 't1'
  ): Question => ({
    id,
    tipo: 'objetiva',
    type: 'OBJECTIVE',
    enunciado,
    pontuacao,
    points: pontuacao,
    avaliacao,
    stage: avaliacao as any,
    turmaId,
    classId: turmaId,
    tags: [avaliacao, 'Engenharia'],
    alternativas: letras.map((letra, idx) => ({
      id: `alt_${id}_${letra}`,
      letraOriginal: letra,
      texto: `Alternativa ${letra} para a questão ${id}`,
      correta: idx === corretaIdx
    })),
    options: letras.map((letra, idx) => ({
      letter: letra,
      text: `Alternativa ${letra} para a questão ${id}`,
      isCorrect: idx === corretaIdx
    }))
  });

  beforeEach(() => {
    mockExamRepo = new ExamRepository();
    jest.spyOn(mockExamRepo, 'getStudents').mockResolvedValue(mockStudents);
    examService = new ExamService(mockExamRepo);
    questionService = new QuestionService();
    omrService = new OmrService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // 1. CADERNO IMPRESSO X GABARITO/OMR COM A MESMA ORDEM POR ALUNO E VERSÃO (SEED)
  // =========================================================================
  describe('1. Caderno Impresso x Gabarito/OMR na Mesma Ordem por Aluno e Versão (seed)', () => {
    const questoesBase: Question[] = [
      criarQuestaoObjetiva('q1', 'Qual o conceito de Polimorfismo?', 2.5, 0), // Resposta original: A
      criarQuestaoObjetiva('q2', 'O que significa ACID em SGBDs?', 2.5, 1),   // Resposta original: B
      criarQuestaoObjetiva('q3', 'Qual o princípio Single Responsibility?', 2.5, 2), // Resposta original: C
      criarQuestaoObjetiva('q4', 'Qual o papel do Gateway em Microserviços?', 2.5, 3) // Resposta original: D
    ];

    it('deve garantir que o embaralhamento por seed é estritamente determinístico e reprodutível', () => {
      const seed1 = 42;
      const seed2 = 42;
      const seedDiferente = 99;

      const embaralhado1 = examService.shuffleArray([...questoesBase], seed1);
      const embaralhado2 = examService.shuffleArray([...questoesBase], seed2);
      const embaralhadoOutro = examService.shuffleArray([...questoesBase], seedDiferente);

      expect(embaralhado1.map(q => q.id)).toEqual(embaralhado2.map(q => q.id));
      expect(embaralhado1.map(q => q.id)).not.toEqual(embaralhadoOutro.map(q => q.id));
    });

    it('deve manter 100% de sincronismo entre a ordem do caderno impresso e o gabarito oficial por versão universal', () => {
      const provaId = 'prova_sync_01';
      const cadernos = examService.gerarCadernosEmbaralhados(
        provaId,
        questoesBase,
        { shuffleQuestoes: true, shuffleAlternativas: true, nominalQrCode: false }
      );

      // Valida os cadernos gerados: CADERNO-A, CADERNO-B, CADERNO-C, CADERNO-D
      expect(cadernos.length).toBeGreaterThanOrEqual(4);

      cadernos.forEach(caderno => {
        const questoesCaderno = caderno.mapaQuestoesJson as Question[];
        const gabaritoOficial = caderno.gabaritoOficialJson;

        expect(questoesCaderno).toHaveLength(questoesBase.length);

        // Para cada questão do caderno, a alternativa marcada como 'correta' deve ser exatamente a letra no gabarito
        questoesCaderno.forEach((questao, qIdx) => {
          const numeroQuestao = String(qIdx + 1);
          const letraGabarito = gabaritoOficial[numeroQuestao];
          expect(letraGabarito).toBeDefined();

          const letrasMapeadas = ['A', 'B', 'C', 'D', 'E'];
          const alternativaCorreta = questao.alternativas?.find(alt => alt.correta);
          expect(alternativaCorreta).toBeDefined();

          const idxCorretaNoCaderno = questao.alternativas?.findIndex(alt => alt.correta);
          const letraCorretaNoCaderno = letrasMapeadas[idxCorretaNoCaderno!];

          // O gabarito oficial DEVE bater com a posição da alternativa correta no caderno impresso
          expect(letraGabarito).toBe(letraCorretaNoCaderno);
        });
      });
    });

    it('deve manter 100% de sincronismo entre caderno impresso e gabarito nominal para cada aluno', () => {
      const provaId = 'prova_nominal_02';
      const alunosInfo = mockStudents.map(s => ({ id: s.id, nome: s.nome, ra: s.matricula }));

      const cadernos = examService.gerarCadernosEmbaralhados(
        provaId,
        questoesBase,
        { shuffleQuestoes: true, shuffleAlternativas: true, nominalQrCode: true },
        alunosInfo
      );

      // Deve ter ao menos 4 cadernos nominais (1 por aluno) + 4 cadernos universais
      const cadernosNominais = cadernos.filter(c => c.alunoRa !== null);
      expect(cadernosNominais).toHaveLength(4);

      cadernosNominais.forEach((caderno, alunoIdx) => {
        expect(caderno.alunoRa).toBe(mockStudents[alunoIdx].matricula);
        expect(caderno.alunoNome).toBe(mockStudents[alunoIdx].nome);

        const questoesCaderno = caderno.mapaQuestoesJson as Question[];
        const gabarito = caderno.gabaritoOficialJson;

        questoesCaderno.forEach((q, qIdx) => {
          const num = String(qIdx + 1);
          const letraEsperada = gabarito[num];
          const letrasMapeadas = ['A', 'B', 'C', 'D', 'E'];
          const idxCorreta = q.alternativas?.findIndex(a => a.correta);
          expect(letrasMapeadas[idxCorreta!]).toBe(letraEsperada);
        });
      });
    });

    it('deve validar que a decodificação do QR Code OMR bate 1:1 com as respostas do caderno impresso', () => {
      const examId = 'EXAM-t1-N2';
      const ra = '20241001';
      const versao = 'A';
      const semente = sementeGabarito(examId, ra, versao);

      // Simula caderno do aluno com embaralhamento por seed
      let lista = JSON.parse(JSON.stringify(questoesBase)) as Question[];
      lista = shuffleArray(lista, 1);
      lista = lista.map((q, qIdx) => {
        const seedAlt = 1 * 10 + (qIdx + 1);
        let alts = q.alternativas ? [...q.alternativas] : [];
        if (alts.length > 0) alts = shuffleArray(alts, seedAlt);
        return { ...q, alternativas: alts };
      });

      const respostasImpressasCaderno = lista.map(q => {
        const idx = q.alternativas!.findIndex(a => !!a.correta);
        return letras[idx];
      });

      const opcoesImpressas = lista.map(q => q.alternativas!.length);
      const pontosImpressos = lista.map(q => q.pontuacao);

      const layout = codificarGabaritoQr(respostasImpressasCaderno, opcoesImpressas, pontosImpressos, semente);
      const decodificado = decodificarGabaritoQr(layout, semente);

      expect(decodificado).not.toBeNull();
      expect(decodificado!.totalQuestoes).toBe(4);

      // Cada questão no gabarito decodificado do QR Code DEVE coincidir com o caderno do aluno
      for (let n = 1; n <= 4; n++) {
        expect(decodificado!.gabarito[n]).toBe(respostasImpressasCaderno[n - 1]);
      }
    });

    it('deve garantir que versões diferentes geram ordens anti-cola diferentes para o mesmo banco de questões', () => {
      const provaId = 'prova_anticola_03';
      const cadernos = examService.gerarCadernosEmbaralhados(
        provaId,
        questoesBase,
        { shuffleQuestoes: true, shuffleAlternativas: true, nominalQrCode: false }
      );

      const cadernoA = cadernos.find(c => c.codigoVersao === 'CADERNO-A')!;
      const cadernoB = cadernos.find(c => c.codigoVersao === 'CADERNO-B')!;
      const cadernoC = cadernos.find(c => c.codigoVersao === 'CADERNO-C')!;

      const idsA = (cadernoA.mapaQuestoesJson as Question[]).map(q => q.id);
      const idsB = (cadernoB.mapaQuestoesJson as Question[]).map(q => q.id);
      const idsC = (cadernoC.mapaQuestoesJson as Question[]).map(q => q.id);

      // As ordens de questões não devem ser todas idênticas entre as versões
      const saoIguais = JSON.stringify(idsA) === JSON.stringify(idsB) && JSON.stringify(idsB) === JSON.stringify(idsC);
      expect(saoIguais).toBe(false);
    });
  });

  // =========================================================================
  // 2. PONTUAÇÃO 10,0 RIGOROSA
  // =========================================================================
  describe('2. Validação Rigorosa de Pontuação Total (Exatamente 10.0 pts)', () => {
    it('deve aprovar caderno cuja soma é rigorosamente 10.0 pontos com diferentes divisões', () => {
      // 4 questões de 2.5 pts
      const quatroQuestoes = [
        criarQuestaoObjetiva('q1', 'Q1', 2.5),
        criarQuestaoObjetiva('q2', 'Q2', 2.5),
        criarQuestaoObjetiva('q3', 'Q3', 2.5),
        criarQuestaoObjetiva('q4', 'Q4', 2.5)
      ];
      const res1 = examService.validarPontuacaoExame(quatroQuestoes);
      expect(res1.valida).toBe(true);
      expect(res1.total).toBe(10.0);

      // 10 questões de 1.0 pt
      const dezQuestoes = Array.from({ length: 10 }, (_, i) =>
        criarQuestaoObjetiva(`q_${i + 1}`, `Questão ${i + 1}`, 1.0)
      );
      const res2 = examService.validarPontuacaoExame(dezQuestoes);
      expect(res2.valida).toBe(true);
      expect(res2.total).toBe(10.0);

      // 20 questões de 0.5 pt
      const vinteQuestoes = Array.from({ length: 20 }, (_, i) =>
        criarQuestaoObjetiva(`q_${i + 1}`, `Questão ${i + 1}`, 0.5)
      );
      const res3 = examService.validarPontuacaoExame(vinteQuestoes);
      expect(res3.valida).toBe(true);
      expect(res3.total).toBe(10.0);
    });

    it('deve aprovar 30 questões dividindo 10.0 pontos com tolerância a arredondamento flutuante', () => {
      // 30 questões de 10/30 pts cada (~0.333333333)
      const trintaQuestoes = Array.from({ length: 30 }, (_, i) =>
        criarQuestaoObjetiva(`q_${i + 1}`, `Questão ${i + 1}`, 10 / 30)
      );
      const res = examService.validarPontuacaoExame(trintaQuestoes);
      expect(res.valida).toBe(true);
      expect(res.total).toBe(10.0);
    });

    it('deve reprovar quando a soma for menor que 10.0 pontos e indicar a pontuação atual', () => {
      const questoes = [
        criarQuestaoObjetiva('q1', 'Q1', 2.0),
        criarQuestaoObjetiva('q2', 'Q2', 3.0),
        criarQuestaoObjetiva('q3', 'Q3', 2.5)
      ]; // Total = 7.5

      const res = examService.validarPontuacaoExame(questoes);
      expect(res.valida).toBe(false);
      expect(res.total).toBe(7.5);
      expect(res.mensagem).toContain('A soma das questões deve ser exatamente 10.0 pontos');
      expect(res.mensagem).toContain('7.5 pts');
    });

    it('deve reprovar quando a soma for maior que 10.0 pontos e indicar a pontuação atual', () => {
      const questoes = [
        criarQuestaoObjetiva('q1', 'Q1', 4.0),
        criarQuestaoObjetiva('q2', 'Q2', 4.0),
        criarQuestaoObjetiva('q3', 'Q3', 3.0)
      ]; // Total = 11.0

      const res = examService.validarPontuacaoExame(questoes);
      expect(res.valida).toBe(false);
      expect(res.total).toBe(11.0);
      expect(res.mensagem).toContain('A soma das questões deve ser exatamente 10.0 pontos');
      expect(res.mensagem).toContain('11.0 pts');
    });

    it('deve rejeitar salvarProvaComEscopo se a soma das questões for diferente de 10.0', async () => {
      const provaInvalida: ProvaMontadaRegistro = {
        id: 'prova_invalida_pts',
        titulo: 'Prova com Nota Inválida',
        turmaId: 't1',
        totalQuestoes: 2,
        pontuacaoTotal: 6.0,
        questoesSnapshot: [
          criarQuestaoObjetiva('q1', 'Q1', 3.0),
          criarQuestaoObjetiva('q2', 'Q2', 3.0)
        ] // Total = 6.0
      };

      await expect(examService.salvarProvaComEscopo(provaInvalida)).rejects.toThrow(
        /A soma das questões deve ser exatamente 10.0 pontos/
      );
    });
  });

  // =========================================================================
  // 3. LIMITE DE 30 QUESTÕES
  // =========================================================================
  describe('3. Validação do Limite de 30 Questões', () => {
    it('deve definir o LIMITE_MAXIMO_QUESTOES estritamente como 30', () => {
      expect(LIMITE_MAXIMO_QUESTOES).toBe(30);
    });

    it('deve permitir adicionar questões até o limite de 30 e bloquear a 31ª', () => {
      const lista29 = Array.from({ length: 29 }, (_, i) => criarQuestaoObjetiva(`q_${i}`, `Q${i}`, 0.3));
      expect(questionService.validarLimite(lista29)).toBe(true);

      const lista30 = Array.from({ length: 30 }, (_, i) => criarQuestaoObjetiva(`q_${i}`, `Q${i}`, 0.3));
      // Com 30 questões, validarLimite deve retornar falso (não permite adicionar a 31ª)
      expect(questionService.validarLimite(lista30)).toBe(false);
    });

    it('deve bloquear generateVersions quando a prova tiver mais de 30 questões', async () => {
      const maisDe30Questoes = Array.from({ length: 31 }, (_, i) =>
        criarQuestaoObjetiva(`q_${i + 1}`, `Q${i + 1}`, 10 / 31)
      );
      jest.spyOn(mockExamRepo, 'getQuestions').mockResolvedValue(maisDe30Questoes);

      await expect(
        examService.generateVersions({
          shuffleQuestions: true,
          shuffleAlternatives: true,
          withStudentIdentification: true
        })
      ).rejects.toThrow('O limite máximo permitido por prova é de 30 questões.');
    });

    it('deve bloquear salvarProvaComEscopo quando questoesSnapshot tiver mais de 30 questões', async () => {
      const maisDe30Questoes = Array.from({ length: 32 }, (_, i) =>
        criarQuestaoObjetiva(`q_${i + 1}`, `Q${i + 1}`, 10 / 32)
      );

      const provaExcedente: ProvaMontadaRegistro = {
        id: 'prova_excedente_32q',
        titulo: 'Prova com 32 questões',
        turmaId: 't1',
        totalQuestoes: 32,
        pontuacaoTotal: 10.0,
        questoesSnapshot: maisDe30Questoes
      };

      await expect(examService.salvarProvaComEscopo(provaExcedente)).rejects.toThrow(
        'O limite máximo permitido por prova é de 30 questões.'
      );
    });

    it('deve gerar com sucesso prova e gabarito no teto máximo exato de 30 questões', async () => {
      const exatamente30Questoes = Array.from({ length: 30 }, (_, i) =>
        criarQuestaoObjetiva(`q_${i + 1}`, `Questão ${i + 1} de 30`, 10 / 30)
      );
      jest.spyOn(mockExamRepo, 'getQuestions').mockResolvedValue(exatamente30Questoes);

      const versions = await examService.generateVersions({
        shuffleQuestions: true,
        shuffleAlternatives: true,
        withStudentIdentification: true
      });

      expect(versions).toHaveLength(mockStudents.length);
      expect(versions[0].questions).toHaveLength(30);

      // Valida que o QR Code e gabarito suportam todas as 30 questões sem truncamento
      const examId = 'EXAM-t1-N2';
      const ra = '20241001';
      const semente = sementeGabarito(examId, ra, 'A');
      const respostas = exatamente30Questoes.map(q => {
        const correta = q.alternativas?.find(a => a.correta);
        return correta ? correta.letraOriginal || 'A' : 'A';
      });
      const opcoes = exatamente30Questoes.map(q => q.alternativas?.length || 5);
      const pontos = exatamente30Questoes.map(q => q.pontuacao);

      const layout = codificarGabaritoQr(respostas, opcoes, pontos, semente);
      expect(layout.nq).toBe(30);

      const decodificado = decodificarGabaritoQr(layout, semente);
      expect(decodificado).not.toBeNull();
      expect(decodificado!.totalQuestoes).toBe(30);
      expect(Object.keys(decodificado!.gabarito)).toHaveLength(30);
    });
  });

  // =========================================================================
  // 4. AGRUPAMENTO DO EXAME N-1
  // =========================================================================
  describe('4. Agrupamento do Exame Cumulativo (N-1)', () => {
    const bancoMisto: Question[] = [
      criarQuestaoObjetiva('q_n1_1', 'Questão de N1 número 1', 2.0, 0, 'N1', 't1'),
      criarQuestaoObjetiva('q_n1_2', 'Questão de N1 número 2', 2.0, 1, 'N1', 't1'),
      criarQuestaoObjetiva('q_n2_1', 'Questão de N2 número 1', 2.0, 2, 'N2', 't1'),
      criarQuestaoObjetiva('q_n2_2', 'Questão de N2 número 2', 2.0, 3, 'N2', 't1'),
      criarQuestaoObjetiva('q_n3_1', 'Questão de N3 número 1', 1.0, 4, 'N3', 't1'),
      criarQuestaoObjetiva('q_exame_1', 'Questão específica de Exame N-1', 1.0, 0, 'N-1', 't1'),
      criarQuestaoObjetiva('q_outra_turma', 'Questão de outra turma N1', 2.0, 0, 'N1', 't2')
    ];

    it('deve agrupar na contagem do ciclo exame todas as questões de N1, N2, N3 e N-1 para a turma', () => {
      const contagem = questionService.contarQuestoesPorCiclo(bancoMisto, 't1', true);

      expect(contagem.n1).toBe(2);
      expect(contagem.n2).toBe(2);
      expect(contagem.n3).toBe(1);
      // exame agrupa N1(2) + N2(2) + N3(1) + N-1(1) = 6 questões
      expect(contagem.exame).toBe(6);
    });

    it('deve filtrar e agregar todas as questões de N1, N2, N3 e N-1 quando ciclo for N-1', () => {
      const filtradasN1 = questionService.filtrarQuestoesAvancado(bancoMisto, {
        turmaId: 't1',
        apenasTurma: true,
        ciclo: 'N1'
      });
      expect(filtradasN1).toHaveLength(2);

      const filtradasN2 = questionService.filtrarQuestoesAvancado(bancoMisto, {
        turmaId: 't1',
        apenasTurma: true,
        ciclo: 'N2'
      });
      expect(filtradasN2).toHaveLength(2);

      // Ciclo N-1: agrega N1 + N2 + N3 + N-1 da turma t1
      const filtradasExameN1 = questionService.filtrarQuestoesAvancado(bancoMisto, {
        turmaId: 't1',
        apenasTurma: true,
        ciclo: 'N-1'
      });
      expect(filtradasExameN1).toHaveLength(6);

      const ids = filtradasExameN1.map(q => q.id);
      expect(ids).toContain('q_n1_1');
      expect(ids).toContain('q_n1_2');
      expect(ids).toContain('q_n2_1');
      expect(ids).toContain('q_n2_2');
      expect(ids).toContain('q_n3_1');
      expect(ids).toContain('q_exame_1');
      expect(ids).not.toContain('q_outra_turma');
    });

    it('deve permitir compor e salvar uma avaliação completa de Exame N-1 somando 10.0 pontos', async () => {
      // Montagem do caderno N-1 com 5 questões originadas de múltiplos ciclos somando 10.0 pts
      const questoesExameN1: Question[] = [
        criarQuestaoObjetiva('q_n1_1', 'Q1 N1', 2.0, 0, 'N1', 't1'),
        criarQuestaoObjetiva('q_n1_2', 'Q2 N1', 2.0, 1, 'N1', 't1'),
        criarQuestaoObjetiva('q_n2_1', 'Q3 N2', 2.0, 2, 'N2', 't1'),
        criarQuestaoObjetiva('q_n2_2', 'Q4 N2', 2.0, 3, 'N2', 't1'),
        criarQuestaoObjetiva('q_n3_1', 'Q5 N3', 2.0, 4, 'N3', 't1')
      ];

      const validacaoPontos = examService.validarPontuacaoExame(questoesExameN1);
      expect(validacaoPontos.valida).toBe(true);
      expect(validacaoPontos.total).toBe(10.0);

      const provaExame: ProvaMontadaRegistro = {
        id: 'prova_exame_n1_completa',
        titulo: 'Exame Final Semestral (N-1)',
        disciplina: 'Engenharia de Software IV',
        semestre: '2026/2',
        ciclo: 'N-1',
        turmaId: 't1',
        totalQuestoes: 5,
        pontuacaoTotal: 10.0,
        questoesSnapshot: questoesExameN1
      };

      const salva = await examService.salvarProvaComEscopo(provaExame);
      expect(salva).toBeDefined();
      expect(salva.ciclo).toBe('N-1');
      expect(salva.cadernos).toBeDefined();
      expect(salva.cadernos!.length).toBeGreaterThanOrEqual(4);

      // Valida que cada caderno gerado preserva a sincronia das 5 questões com o gabarito
      salva.cadernos!.forEach(caderno => {
        expect(caderno.mapaQuestoesJson).toHaveLength(5);
        expect(Object.keys(caderno.gabaritoOficialJson)).toHaveLength(5);
      });
    });
  });
});
