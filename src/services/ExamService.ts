import { ExamRepository } from '@/repositories/ExamRepository';
import { ExamModel } from '@/models/ExamModel';
import { ExamVersionLayout, GenerateExamConfig, Question } from '@/types';
import { shuffleArray } from '@/lib/shuffle';

export class ExamService {
  constructor(private examRepository: ExamRepository = new ExamRepository()) {}

  // Algoritmo determinístico de embaralhamento
  public shuffleArray<T>(array: T[], seed: number): T[] {
    return shuffleArray(array, seed);
  }

  /**
   * Trava Rígida de Pontuação Total: exatamente 10.0 pts para autorizar o gabarito
   */
  validarPontuacaoExame(questoes: Question[]): { valida: boolean; total: number; mensagem?: string } {
    const total = Number(questoes.reduce((acc, q) => acc + (q.pontuacao ?? q.points ?? 0), 0).toFixed(1));
    if (Math.abs(total - 10.0) > 0.05) {
      return {
        valida: false,
        total,
        mensagem: `A soma das questões deve ser exatamente 10.0 pontos para gerar o gabarito. Pontuação atual: ${total.toFixed(1)} pts`
      };
    }
    return { valida: true, total: 10.0 };
  }

  async generateVersions(config: GenerateExamConfig): Promise<ExamVersionLayout[]> {
    const students = await this.examRepository.getStudents();
    const baseQuestions = await this.examRepository.getQuestions();

    if (baseQuestions.length === 0) {
      throw new Error('Adicione ao menos 1 questão ao caderno para gerar a avaliação.');
    }

    if (baseQuestions.length > 30) {
      throw new Error('O limite máximo permitido por prova é de 30 questões.');
    }

    return students.map((student, index) => {
      let versionQuestions = JSON.parse(JSON.stringify(baseQuestions)) as Question[];

      if (config.shuffleQuestions) {
        versionQuestions = this.shuffleArray(versionQuestions, index + 1);
      }

      if (config.shuffleAlternatives) {
        versionQuestions.forEach((q, qIndex) => {
          if (q.tipo === 'objetiva' && q.alternativas) {
            q.alternativas = this.shuffleArray(q.alternativas, index * 10 + qIndex + 1);
          }
        });
      }

      return ExamModel.createVersionLayout(index + 1, student, versionQuestions, config);
    });
  }
}
