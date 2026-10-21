import { QuestionRepository } from '@/repositories/QuestionRepository';
import { Question, AvaliacaoCiclo } from '@/types';

export const LIMITE_MAXIMO_QUESTOES = 20;

export interface ContagemCiclos {
  todas: number;
  n1: number;
  n2: number;
  n3: number;
  exame: number;
  geral: number;
}

export class QuestionService {
  constructor(private questionRepository: QuestionRepository = new QuestionRepository()) {}

  async listarQuestoes(): Promise<Question[]> {
    return this.questionRepository.findAll();
  }

  async buscarPorId(id: string): Promise<Question | undefined> {
    return this.questionRepository.findById(id);
  }

  async salvarQuestao(questao: Question): Promise<Question> {
    return this.questionRepository.save(questao);
  }

  async excluirQuestao(id: string): Promise<boolean> {
    return this.questionRepository.delete(id);
  }

  /**
   * Filtro padrão por texto de busca (enunciado ou tags)
   */
  filtrarQuestoes(questoes: Question[], busca: string): Question[] {
    if (!busca.trim()) return questoes;
    const termo = busca.toLowerCase();
    return questoes.filter(q =>
      q.enunciado.toLowerCase().includes(termo) ||
      q.tags.some(t => t.toLowerCase().includes(termo))
    );
  }

  /**
   * Filtro avançado combinando Turma, Ciclo Avaliativo (N1, N2, N3, N-1) e Busca textual
   */
  filtrarQuestoesAvancado(
    questoes: Question[],
    filtros: {
      termoBusca?: string;
      turmaId?: string;
      apenasTurma?: boolean;
      ciclo?: AvaliacaoCiclo | 'TODAS';
    }
  ): Question[] {
    const { termoBusca = '', turmaId, apenasTurma = false, ciclo = 'TODAS' } = filtros;

    let resultado = [...questoes];

    // 1. Filtro por Turma
    if (turmaId) {
      if (apenasTurma) {
        resultado = resultado.filter(q => q.turmaId === turmaId);
      } else {
        // Exibe questões da turma selecionada + questões do banco geral (sem turmaId definido ou geral)
        resultado = resultado.filter(q => !q.turmaId || q.turmaId === turmaId);
      }
    }

    // 2. Filtro por Ciclo Avaliativo (N1, N2, N3, N-1, GERAL)
    if (ciclo && ciclo !== 'TODAS') {
      if (ciclo === 'N-1') {
        // N-1 é o exame cumulativo: agrega automaticamente todas as questões cadastradas em N1, N2, N3 e N-1
        resultado = resultado.filter(q => {
          const av = (q.avaliacao || 'N2').toUpperCase();
          return ['N1', 'N2', 'N3', 'N-1', 'EXAME'].includes(av);
        });
      } else {
        resultado = resultado.filter(q => {
          const avaliacaoQuestao = q.avaliacao || 'N2';
          return avaliacaoQuestao.toUpperCase() === ciclo.toUpperCase();
        });
      }
    }

    // 3. Filtro por Texto / Tags
    if (termoBusca.trim()) {
      const termo = termoBusca.toLowerCase();
      resultado = resultado.filter(q =>
        q.enunciado.toLowerCase().includes(termo) ||
        q.tags.some(t => t.toLowerCase().includes(termo))
      );
    }

    return resultado;
  }

  /**
   * Calcula contadores de questões disponíveis por ciclo avaliativo para a turma selecionada
   */
  contarQuestoesPorCiclo(questoes: Question[], turmaId?: string, apenasTurma: boolean = false): ContagemCiclos {
    // Filtra pelo escopo da turma primeiro
    let escopo = questoes;
    if (turmaId) {
      escopo = apenasTurma
        ? questoes.filter(q => q.turmaId === turmaId)
        : questoes.filter(q => !q.turmaId || q.turmaId === turmaId);
    }

    return {
      todas: escopo.length,
      n1: escopo.filter(q => (q.avaliacao || 'N2').toUpperCase() === 'N1').length,
      n2: escopo.filter(q => (q.avaliacao || 'N2').toUpperCase() === 'N2').length,
      n3: escopo.filter(q => (q.avaliacao || 'N2').toUpperCase() === 'N3').length,
      exame: escopo.filter(q => {
        const av = (q.avaliacao || 'N2').toUpperCase();
        return ['N1', 'N2', 'N3', 'N-1', 'EXAME'].includes(av);
      }).length,
      geral: escopo.filter(q => (q.avaliacao || '').toUpperCase() === 'GERAL').length
    };
  }

  calcularPontuacaoTotal(questoes: Question[]): number {
    return Number(questoes.reduce((acc, q) => acc + (q.pontuacao || 0), 0).toFixed(1));
  }

  validarLimite(questoesSelecionadas: Question[]): boolean {
    return questoesSelecionadas.length < LIMITE_MAXIMO_QUESTOES;
  }
}
