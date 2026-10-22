import { ExamService } from '../../src/services/ExamService';
import { ExamRepository } from '../../src/repositories/ExamRepository';
import { GenerateExamConfig, Question, Student } from '../../src/types';

describe('ExamService - Regras de Negócio e Embaralhamento', () => {
  let examService: ExamService;
  let mockRepository: ExamRepository;

  const mockStudentsList: Student[] = [
    { id: 'alu-01', nome: 'Gabriel Menezes', matricula: '20241001', email: 'gabriel.m@catolicasc.edu.br' },
    { id: 'alu-02', nome: 'Beatriz Ramos', matricula: '20241002', email: 'beatriz.r@catolicasc.edu.br' }
  ];

  const mockQuestionsList: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual camada isola o banco de dados MySQL?',
      pontuacao: 2.5,
      tags: ['Backend', 'Arquitetura'],
      alternativas: [
        { id: 'alt_1_1', letraOriginal: 'A', texto: 'Repositório (Repository)', correta: true },
        { id: 'alt_1_2', letraOriginal: 'B', texto: 'Controle (Controller)', correta: false },
        { id: 'alt_1_3', letraOriginal: 'C', texto: 'Serviço (Service)', correta: false },
        { id: 'alt_1_4', letraOriginal: 'D', texto: 'Rota (Router)', correta: false }
      ]
    },
    {
      id: 'q2',
      tipo: 'discursiva',
      enunciado: 'Explique o fluxo de sincronização offline no dispositivo.',
      pontuacao: 5.0,
      tags: ['Sincronização', 'Offline']
    }
  ];

  beforeEach(() => {
    mockRepository = new ExamRepository();
    jest.spyOn(mockRepository, 'getStudents').mockResolvedValue(mockStudentsList);
    jest.spyOn(mockRepository, 'getQuestions').mockResolvedValue(mockQuestionsList);
    examService = new ExamService(mockRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve instanciar o serviço com sucesso', () => {
    expect(examService).toBeDefined();
  });

  it('deve gerar versões de exame para todos os alunos', async () => {
    const config: GenerateExamConfig = {
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: true
    };

    const versions = await examService.generateVersions(config);

    expect(versions).toHaveLength(2);
    expect(versions[0].student?.nome).toBe('Gabriel Menezes');
    expect(versions[0].versionLetter).toBe('A');
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[1].student?.nome).toBe('Beatriz Ramos');
    expect(versions[1].versionLetter).toBe('B');
    expect(versions[1].versionNumber).toBe(2);
  });

  it('deve gerar payload nominal no QR Code quando identificação estiver ativa', async () => {
    const config: GenerateExamConfig = {
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: true
    };

    const versions = await examService.generateVersions(config);

    expect(versions[0].qrPayload).toBe('APP-CAT-EXAM-V1-20241001');
    expect(versions[1].qrPayload).toBe('APP-CAT-EXAM-V2-20241002');
  });

  it('deve gerar payload anônimo no QR Code quando identificação estiver desativada', async () => {
    const config: GenerateExamConfig = {
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: false
    };

    const versions = await examService.generateVersions(config);

    expect(versions[0].student).toBeNull();
    expect(versions[0].qrPayload).toBe('APP-CAT-EXAM-V1-ANON');
    expect(versions[1].student).toBeNull();
    expect(versions[1].qrPayload).toBe('APP-CAT-EXAM-V2-ANON');
  });

  it('deve manter todas as alternativas e a resposta correta ao embaralhar alternativas', async () => {
    const config: GenerateExamConfig = {
      shuffleQuestions: false,
      shuffleAlternatives: true,
      withStudentIdentification: true
    };

    const versions = await examService.generateVersions(config);
    const questaoObjetivaOriginal = mockQuestionsList[0];
    const questaoObjetivaGerada = versions[0].questions[0];

    expect(questaoObjetivaGerada.alternativas).toBeDefined();
    expect(questaoObjetivaGerada.alternativas).toHaveLength(questaoObjetivaOriginal.alternativas!.length);

    const alternativaCorretaPresente = questaoObjetivaGerada.alternativas?.some(alt => alt.correta === true);
    expect(alternativaCorretaPresente).toBe(true);

    const alternativasIdsOriginais = questaoObjetivaOriginal.alternativas!.map(a => a.id).sort();
    const alternativasIdsGeradas = questaoObjetivaGerada.alternativas!.map(a => a.id).sort();
    expect(alternativasIdsGeradas).toEqual(alternativasIdsOriginais);
  });

  it('deve embaralhar array de forma determinística usando seed', () => {
    const listaOriginal = [1, 2, 3, 4, 5];
    const embaralhado1 = examService.shuffleArray(listaOriginal, 42);
    const embaralhado2 = examService.shuffleArray(listaOriginal, 42);

    expect(embaralhado1).toEqual(embaralhado2);
    expect(embaralhado1).toHaveLength(listaOriginal.length);
    expect(embaralhado1.sort()).toEqual(listaOriginal.sort());
  });

  it('deve permitir gerar caderno com flexibilidade total contendo apenas 1 questão', async () => {
    jest.spyOn(mockRepository, 'getQuestions').mockResolvedValue([mockQuestionsList[0]]);

    const versions = await examService.generateVersions({
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: true
    });

    expect(versions).toHaveLength(2);
    expect(versions[0].questions).toHaveLength(1);
    expect(versions[0].questions[0].id).toBe('q1');
  });

  it('deve bloquear a geração do caderno quando a lista de questões estiver zerada (0 questões)', async () => {
    jest.spyOn(mockRepository, 'getQuestions').mockResolvedValue([]);

    await expect(examService.generateVersions({
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: true
    })).rejects.toThrow('Adicione ao menos 1 questão ao caderno para gerar a avaliação.');
  });

  describe('Trava Rígida de Pontuação Total (Exatamente 10.0 pts)', () => {
    it('deve reprovar quando a soma for menor que 10.0 pts e retornar mensagem explicativa', () => {
      const questoesMenor: Question[] = [
        { id: 'q1', tipo: 'objetiva', enunciado: 'Q1', pontuacao: 4.0, tags: [] },
        { id: 'q2', tipo: 'objetiva', enunciado: 'Q2', pontuacao: 4.5, tags: [] }
      ]; // Soma: 8.5 pts

      const res = examService.validarPontuacaoExame(questoesMenor);
      expect(res.valida).toBe(false);
      expect(res.total).toBe(8.5);
      expect(res.mensagem).toContain('A soma das questões deve ser exatamente 10.0 pontos');
      expect(res.mensagem).toContain('8.5 pts');
    });

    it('deve reprovar quando a soma for maior que 10.0 pts e retornar mensagem explicativa', () => {
      const questoesMaior: Question[] = [
        { id: 'q1', tipo: 'objetiva', enunciado: 'Q1', pontuacao: 6.0, tags: [] },
        { id: 'q2', tipo: 'objetiva', enunciado: 'Q2', pontuacao: 5.0, tags: [] }
      ]; // Soma: 11.0 pts

      const res = examService.validarPontuacaoExame(questoesMaior);
      expect(res.valida).toBe(false);
      expect(res.total).toBe(11.0);
      expect(res.mensagem).toContain('A soma das questões deve ser exatamente 10.0 pontos');
      expect(res.mensagem).toContain('11.0 pts');
    });

    it('deve aprovar quando a soma for rigorosamente igual a 10.0 pts', () => {
      const questoesExatas: Question[] = [
        { id: 'q1', tipo: 'objetiva', enunciado: 'Q1', pontuacao: 2.5, tags: [] },
        { id: 'q2', tipo: 'objetiva', enunciado: 'Q2', pontuacao: 2.5, tags: [] },
        { id: 'q3', tipo: 'objetiva', enunciado: 'Q3', pontuacao: 5.0, tags: [] }
      ]; // Soma: 10.0 pts

      const res = examService.validarPontuacaoExame(questoesExatas);
      expect(res.valida).toBe(true);
      expect(res.total).toBe(10.0);
      expect(res.mensagem).toBeUndefined();
    });
  });
});
