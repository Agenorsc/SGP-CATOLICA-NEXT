import { ExamVersionLayout, GenerateExamConfig, Question, Student } from '@/types';

export class ExamModel {
  static createVersionLayout(
    versionNumber: number,
    student: Student | null,
    questions: Question[],
    config: GenerateExamConfig
  ): ExamVersionLayout {
    const versionLetter = String.fromCharCode(64 + versionNumber);
    const qrPayload = config.withStudentIdentification && student
      ? `APP-CAT-EXAM-V${versionNumber}-${student.matricula}`
      : `APP-CAT-EXAM-V${versionNumber}-ANON`;

    return {
      versionNumber,
      versionLetter,
      student: config.withStudentIdentification ? student : null,
      qrPayload,
      questions
    };
  }
}