import { QuestionRepository } from '@/repositories/QuestionRepository';
import { Question } from '@/types';

export const LIMITE_MAXIMO_QUESTOES = 20;

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

  filtrarQuestoes(questoes: Question[], busca: string): Question[] {
    if (!busca.trim()) return questoes;
    const termo = busca.toLowerCase();
    return questoes.filter(q =>
      q.enunciado.toLowerCase().includes(termo) ||
      q.tags.some(t => t.toLowerCase().includes(termo))
    );
  }

  calcularPontuacaoTotal(questoes: Question[]): number {
    return questoes.reduce((acc, q) => acc + q.pontuacao, 0);
  }

  validarLimite(questoesSelecionadas: Question[]): boolean {
    return questoesSelecionadas.length < LIMITE_MAXIMO_QUESTOES;
  }
}
