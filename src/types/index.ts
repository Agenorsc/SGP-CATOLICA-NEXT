export type AvaliacaoCiclo = 'N1' | 'N2' | 'N3' | 'N-1' | 'GERAL';

export type UserRole = 'ADMIN' | 'PROFESSOR';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  campus: string;
}

export type EvaluationStage = 'N1' | 'N2' | 'N3' | 'N-1';

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isCorrect: boolean;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  disciplina?: string;
  campus?: string;
}

export interface Professor {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  role: UserRole;
  disciplina?: string;
  campus?: string;
  createdAt?: string;
}

export interface Alternative {
  id: string;
  letraOriginal: string;
  texto: string;
  correta: boolean;
}

export interface Question {
  id: string;
  // Especificação nova:
  teacherId?: string;
  classId?: string;
  stage?: EvaluationStage;
  statement?: string;
  type?: 'OBJECTIVE' | 'DISCURSIVE' | 'objetiva' | 'discursiva';
  points?: number;
  tags: string[];
  options?: QuestionOption[];

  // Compatibilidade legada preservada:
  tipo: 'objetiva' | 'discursiva';
  enunciado: string;
  pontuacao: number;
  turmaId?: string;
  avaliacao?: AvaliacaoCiclo;
  alternativas?: Alternative[];
}

export interface ClassRoom {
  id: string;
  teacherId: string;
  name: string;
  course: string;
  semester: string;
}

export interface ExamVersion {
  id: string;
  teacherId: string;
  classId: string;
  title: string;
  stage: EvaluationStage;
  selectedQuestions: Question[];
  shuffleQuestions: boolean;
  shuffleAlternatives: boolean;
  nominalQrCode: boolean;
}

export interface ExamGradeReport {
  teacherId: string;
  classId: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  stage: EvaluationStage;
  correctedAt: string;
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

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface Contato {
  celular: string;
  residencial?: string;
}

export interface Filiacao {
  mae: string;
  pai: string;
}

export interface AlternativaCadastro {
  letra: string;
  texto: string;
  correta: boolean;
}

export interface CardPayload {
  examId: string;
  classId: string;
  className: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  studentRa: string;
  stage: EvaluationStage;
  // Compatibilidade legada
  system?: string;
  turmaId?: string;
  name?: string;
  ra?: string;
  examVersion?: string;
}

export interface QuestionResult {
  questionNumber: number;
  questionId: string;
  markedOption: string | null;
  correctOption: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
}

export interface ScanResult {
  payload: CardPayload;
  questions: QuestionResult[];
  totalScore: number;
  maxExamScore: number;
  capturedImageBase64?: string;
  scannedAt: string;
}

export interface SecureQrPayload {
  system: 'SGP-CATOLICA';
  examId: string;
  studentId: string;
  ra: string;
  name: string;
  turmaId: string;
  examVersion: string;
  // Campos estendidos para novo CardPayload
  classId?: string;
  className?: string;
  teacherId?: string;
  studentName?: string;
  studentRa?: string;
  stage?: EvaluationStage;
}

export interface OMRQuestionResult {
  numero: number;
  respostaMarcada: string | null;
  respostaCorreta: string;
  correta: boolean;
  status: 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO';
  fillRate?: number;
  score?: number;
  maxScore?: number;
}

export interface LeituraOMRRegistro {
  id: string;
  alunoId: string;
  alunoNome: string;
  ra: string;
  turmaId?: string;
  classId?: string;
  professorId?: string;
  teacherId?: string;
  turmaNome: string;
  className?: string;
  stage?: EvaluationStage;
  materia: string;
  versao: string;
  acertos: number;
  totalQuestoes: number;
  notaCalculada: number;
  dataLeitura: string;
  respostasDetectadas: Record<number, string | null>;
  gabaritoOficial?: Record<number, string>;
  detalhesQuestoes?: OMRQuestionResult[];
  fiduciaisDetectados?: boolean;
}
