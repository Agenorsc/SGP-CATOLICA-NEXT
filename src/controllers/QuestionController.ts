import { QuestionService } from '@/services/QuestionService';
import { Question } from '@/types';

export class QuestionController {
  constructor(private questionService: QuestionService = new QuestionService()) {}

  async getQuestions() {
    try {
      const data = await this.questionService.listarQuestoes();
      return { status: 200, data };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  async saveQuestion(question: Question) {
    try {
      const saved = await this.questionService.salvarQuestao(question);
      return { status: 200, data: saved };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  async deleteQuestion(id: string) {
    try {
      const success = await this.questionService.excluirQuestao(id);
      return { status: 200, data: { success } };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }
}
