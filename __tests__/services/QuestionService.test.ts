import { QuestionService, LIMITE_MAXIMO_QUESTOES } from '../../src/services/QuestionService';
import { QuestionRepository } from '../../src/repositories/QuestionRepository';
import { Question } from '../../src/types';

describe('QuestionService - Organização por Turma e Ciclo Avaliativo (N1, N2, N3, N-1)', () => {
  let service: QuestionService;
  let mockRepo: QuestionRepository;

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Questão de Arquitetura em Camadas',
      pontuacao: 2.5,
      tags: ['Arquitetura', 'N1'],
      turmaId: 't1',
      avaliacao: 'N1'
    },
    {
      id: 'q2',
      tipo: 'objetiva',
      enunciado: 'Questão de Persistência OMR com QR Code',
      pontuacao: 2.5,
      tags: ['OMR', 'N2'],
      turmaId: 't1',
      avaliacao: 'N2'
    },
    {
      id: 'q3',
      tipo: 'objetiva',
      enunciado: 'Questão sobre Algoritmos de Ajuste de Grade',
      pontuacao: 2.5,
      tags: ['Algoritmos', 'N2'],
      turmaId: 't1',
      avaliacao: 'N2'
    },
    {
      id: 'q4',
      tipo: 'discursiva',
      enunciado: 'Projeto Prático e Seminário de Avaliação',
      pontuacao: 2.5,
      tags: ['Prático', 'N3'],
      turmaId: 't1',
      avaliacao: 'N3'
    },
    {
      id: 'q5',
      tipo: 'objetiva',
      enunciado: 'Exame Substitutivo sobre Padrões Hexagonais',
      pontuacao: 2.5,
      tags: ['Exame', 'N-1', 'Recuperacao'],
      turmaId: 't1',
      avaliacao: 'N-1'
    },
    {
      id: 'q6',
      tipo: 'objetiva',
      enunciado: 'Questão Exclusiva da Turma de Banco de Dados',
      pontuacao: 2.5,
      tags: ['SQL', 'N1'],
      turmaId: 't2',
      avaliacao: 'N1'
    },
    {
      id: 'q7',
      tipo: 'objetiva',
      enunciado: 'Questão Geral do Banco Institucional',
      pontuacao: 2.5,
      tags: ['Geral', 'Logica'],
      // sem turmaId (questão de banco geral)
      avaliacao: 'GERAL'
    }
  ];

  beforeEach(() => {
    mockRepo = new QuestionRepository();
    jest.spyOn(mockRepo, 'findAll').mockResolvedValue(mockQuestions);
    service = new QuestionService(mockRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve instanciar o serviço com sucesso e listar questões do repositório', async () => {
    const list = await service.listarQuestoes();
    expect(list).toHaveLength(7);
  });

  describe('Filtro por Turma', () => {
    it('deve filtrar questões da turma selecionada incluindo questões do banco geral quando apenasTurma for falso', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        turmaId: 't1',
        apenasTurma: false
      });

      // Deve incluir as 5 da t1 + 1 geral (sem turmaId) = 6
      expect(filtradas).toHaveLength(6);
      expect(filtradas.some(q => q.id === 'q6')).toBe(false); // q6 pertence à t2
      expect(filtradas.some(q => q.id === 'q7')).toBe(true);  // q7 é geral
    });

    it('deve filtrar estritamente as questões da turma quando apenasTurma for verdadeiro', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        turmaId: 't1',
        apenasTurma: true
      });

      // Apenas as 5 questões da turma t1
      expect(filtradas).toHaveLength(5);
      expect(filtradas.every(q => q.turmaId === 't1')).toBe(true);
    });
  });

  describe('Filtro por Ciclo Avaliativo (N1, N2, N3 e N-1)', () => {
    it('deve filtrar questões de N1', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        ciclo: 'N1'
      });
      expect(filtradas).toHaveLength(2); // q1 (t1) e q6 (t2)
      expect(filtradas.every(q => q.avaliacao === 'N1')).toBe(true);
    });

    it('deve filtrar questões de N2 da turma t1', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        turmaId: 't1',
        ciclo: 'N2'
      });
      expect(filtradas).toHaveLength(2); // q2 e q3
      expect(filtradas.map(q => q.id)).toEqual(['q2', 'q3']);
    });

    it('deve filtrar questões de N3 (avaliação continuada/projetos)', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        turmaId: 't1',
        ciclo: 'N3'
      });
      expect(filtradas).toHaveLength(1);
      expect(filtradas[0].id).toBe('q4');
    });

    it('deve agregar questões de N1, N2, N3 e exame no ciclo N-1', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        turmaId: 't1',
        ciclo: 'N-1'
      });
      expect(filtradas).toHaveLength(5);
      expect(filtradas.map(q => q.id)).toEqual(['q1', 'q2', 'q3', 'q4', 'q5']);
    });

    it('deve retornar todas as questões quando o ciclo for TODAS', () => {
      const filtradas = service.filtrarQuestoesAvancado(mockQuestions, {
        turmaId: 't1',
        apenasTurma: true,
        ciclo: 'TODAS'
      });
      expect(filtradas).toHaveLength(5);
    });
  });

  describe('Contagem de Questões por Ciclo', () => {
    it('deve calcular contadores corretos para a turma t1', () => {
      const contagem = service.contarQuestoesPorCiclo(mockQuestions, 't1', false);

      expect(contagem.todas).toBe(6); // 5 de t1 + 1 geral
      expect(contagem.n1).toBe(1);    // q1
      expect(contagem.n2).toBe(2);    // q2, q3
      expect(contagem.n3).toBe(1);    // q4
      expect(contagem.exame).toBe(5); // N1, N2, N3 e q5 (N-1)
      expect(contagem.geral).toBe(1); // q7
    });

    it('deve calcular contadores quando apenasTurma for verdadeiro', () => {
      const contagem = service.contarQuestoesPorCiclo(mockQuestions, 't1', true);

      expect(contagem.todas).toBe(5);
      expect(contagem.n1).toBe(1);
      expect(contagem.n2).toBe(2);
      expect(contagem.n3).toBe(1);
      expect(contagem.exame).toBe(5);
      expect(contagem.geral).toBe(0);
    });
  });

  describe('Cálculo de Pontuação e Limite', () => {
    it('deve calcular pontuação total com precisão de 1 casa decimal', () => {
      const questoesSelecionadas = [mockQuestions[0], mockQuestions[1], mockQuestions[2], mockQuestions[3]];
      const total = service.calcularPontuacaoTotal(questoesSelecionadas);
      expect(total).toBe(10.0);
    });

    it('deve validar limite de 20 questões por prova', () => {
      const vinteQuestoes = Array.from({ length: 20 }, (_, i) => ({
        ...mockQuestions[0],
        id: `q_test_${i}`
      }));

      expect(service.validarLimite(vinteQuestoes)).toBe(false); // 20 atinge o limite
      expect(service.validarLimite(vinteQuestoes.slice(0, 19))).toBe(true);
      expect(LIMITE_MAXIMO_QUESTOES).toBe(20);
    });
  });
});
