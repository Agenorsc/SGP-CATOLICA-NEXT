export type AvaliacaoCiclo = 'N1' | 'N2' | 'N3' | 'N-1' | 'GERAL';

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
  turmaId?: string;
  avaliacao?: AvaliacaoCiclo;
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

export interface SecureQrPayload {
  system: 'SGP-CATOLICA';
  examId: string;
  studentId: string;
  ra: string;
  name: string;
  turmaId: string;
  examVersion: string;
}

export interface OMRQuestionResult {
  numero: number;
  respostaMarcada: string | null;
  respostaCorreta: string;
  correta: boolean;
  status: 'CORRETA' | 'INCORRETA' | 'ANULADA' | 'EM_BRANCO';
  fillRate?: number;
}

export interface LeituraOMRRegistro {
  id: string;
  alunoId: string;
  alunoNome: string;
  ra: string;
  turmaId?: string;
  turmaNome: string;
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
