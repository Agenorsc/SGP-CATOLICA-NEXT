import { ExamService } from '@/services/ExamService';
import { GenerateExamConfig } from '@/types';

export class ExamController {
  constructor(private examService: ExamService = new ExamService()) {}

  async handleGenerate(config: GenerateExamConfig) {
    if (typeof config.shuffleQuestions !== 'boolean' || typeof config.shuffleAlternatives !== 'boolean') {
      return { status: 400, data: { error: 'Configurações de embaralhamento inválidas.' } };
    }

    try {
      const versions = await this.examService.generateVersions(config);
      return { status: 200, data: versions };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }
}