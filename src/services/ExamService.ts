import { ExamRepository } from '@/repositories/ExamRepository';
import { ExamModel } from '@/models/ExamModel';
import { ExamVersionLayout, GenerateExamConfig, Question } from '@/types';

export class ExamService {
  constructor(private examRepository: ExamRepository = new ExamRepository()) {}

  // Algoritmo determinístico de embaralhamento
  public shuffleArray<T>(array: T[], seed: number): T[] {
    const copy = [...array];
    let currentIndex = copy.length;
    let temporaryValue: T;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.abs(Math.sin(seed++) * 10000)) % currentIndex;
      currentIndex -= 1;
      temporaryValue = copy[currentIndex];
      copy[currentIndex] = copy[randomIndex];
      copy[randomIndex] = temporaryValue;
    }
    return copy;
  }

  async generateVersions(config: GenerateExamConfig): Promise<ExamVersionLayout[]> {
    const students = await this.examRepository.getStudents();
    const baseQuestions = await this.examRepository.getQuestions();

    if (baseQuestions.length > 20) {
      throw new Error('O limite máximo permitido por prova é de 20 questões.');
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