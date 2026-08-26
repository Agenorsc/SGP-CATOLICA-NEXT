export interface Alternative {
  id: string;
  letraOriginal: string;
  texto: string;
  correta: boolean;
}

export interface Question {
  id: string;
  tipo: 'objetiva' | 'discursiva';
  enunciado: string;
  pontuacao: number;
  tags: string[];
  alternativas?: Alternative[];
}

export interface Student {
  id: string;
  nome: string;
  matricula: string;
  email: string;
}

export interface ExamVersionLayout {
  versionNumber: number;
  versionLetter: string;
  student: Student | null;
  qrPayload: string;
  questions: Question[];
}

export interface GenerateExamConfig {
  shuffleQuestions: boolean;
  shuffleAlternatives: boolean;
  withStudentIdentification: boolean;
}