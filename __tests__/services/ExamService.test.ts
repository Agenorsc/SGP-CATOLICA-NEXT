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

  it('deve lançar erro quando o número de questões na prova exceder o limite de 20', async () => {
    const twentyOneQuestions: Question[] = Array.from({ length: 21 }, (_, i) => ({
      id: `q${i + 1}`,
      tipo: 'discursiva',
      enunciado: `Enunciado da questão ${i + 1}`,
      pontuacao: 1.0,
      tags: ['Limite']
    }));

    jest.spyOn(mockRepository, 'getQuestions').mockResolvedValue(twentyOneQuestions);

    const config: GenerateExamConfig = {
      shuffleQuestions: true,
      shuffleAlternatives: true,
      withStudentIdentification: true
    };

    await expect(examService.generateVersions(config)).rejects.toThrow(
      'O limite máximo permitido por prova é de 20 questões.'
    );
  });

  it('deve gerar uma versão para cada estudante matriculado', async () => {
    const config: GenerateExamConfig = {
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: true
    };

    const versions = await examService.generateVersions(config);

    expect(versions).toHaveLength(mockStudentsList.length);
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[0].versionLetter).toBe('A');
    expect(versions[1].versionNumber).toBe(2);
    expect(versions[1].versionLetter).toBe('B');
  });

  it('deve gerar QR Code com matrícula e dados do aluno quando withStudentIdentification for verdadeiro', async () => {
    const config: GenerateExamConfig = {
      shuffleQuestions: false,
      shuffleAlternatives: false,
      withStudentIdentification: true
    };

    const versions = await examService.generateVersions(config);

    expect(versions[0].student).not.toBeNull();
    expect(versions[0].student?.matricula).toBe('20241001');
    expect(versions[0].qrPayload).toBe('APP-CAT-EXAM-V1-20241001');

    expect(versions[1].student).not.toBeNull();
    expect(versions[1].student?.matricula).toBe('20241002');
    expect(versions[1].qrPayload).toBe('APP-CAT-EXAM-V2-20241002');
  });

  it('deve gerar QR Code anônimo e student nulo quando withStudentIdentification for falso', async () => {
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
});