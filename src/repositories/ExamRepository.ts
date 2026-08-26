import { Question, Student } from '@/types';

export class ExamRepository {
  private mockStudents: Student[] = [
    { id: 'alu-01', nome: 'Gabriel Menezes', matricula: '20241001', email: 'gabriel.m@catolicasc.edu.br' },
    { id: 'alu-02', nome: 'Beatriz Ramos', matricula: '20241002', email: 'beatriz.r@catolicasc.edu.br' },
    { id: 'alu-03', nome: 'Lucas Martins', matricula: '20241003', email: 'lucas.m@catolicasc.edu.br' },
    { id: 'alu-04', nome: 'Fernanda Lima', matricula: '20241004', email: 'fernanda.l@catolicasc.edu.br' }
  ];

  private mockQuestions: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual das seguintes camadas isola estritamente o acesso ao banco de dados MySQL?',
      pontuacao: 2.5,
      tags: ['Backend', 'Arquitetura'],
      alternativas: [
        { id: 'alt_1_1', letraOriginal: 'A', texto: 'Repositório (Repository)', correta: true },
        { id: 'alt_1_2', letraOriginal: 'B', texto: 'Controle (Controller)', correta: false },
        { id: 'alt_1_3', letraOriginal: 'C', texto: 'Serviço (Service)', correta: false },
        { id: 'alt_1_4', letraOriginal: 'D', texto: 'Rota (Router)', correta: false },
        { id: 'alt_1_5', letraOriginal: 'E', texto: 'Model (Entidade)', correta: false }
      ]
    },
    {
      id: 'q2',
      tipo: 'objetiva',
      enunciado: 'Por que a ordem das alternativas embaralhadas deve ser gravada e materializada na entidade ExamVersion?',
      pontuacao: 2.5,
      tags: ['Persistência', 'OMR'],
      alternativas: [
        { id: 'alt_2_1', letraOriginal: 'A', texto: 'Para o app mobile relacionar a alternativa marcada com a correta.', correta: true },
        { id: 'alt_2_2', letraOriginal: 'B', texto: 'Apenas para gerar a estética visual do PDF.', correta: false },
        { id: 'alt_2_3', letraOriginal: 'C', texto: 'Para permitir a remoção física de dados.', correta: false },
        { id: 'alt_2_4', letraOriginal: 'D', texto: 'Não é necessário persistir.', correta: false }
      ]
    },
    {
      id: 'q3',
      tipo: 'discursiva',
      enunciado: 'Descreva como funciona o tratamento offline da fila de correções com deduplicação via clientCorrectionId.',
      pontuacao: 5.0,
      tags: ['Offline', 'Sincronização']
    }
  ];

  async getStudents(): Promise<Student[]> {
    return this.mockStudents;
  }

  async getQuestions(): Promise<Question[]> {
    return this.mockQuestions;
  }
}