import { Question } from '@/types';

export class QuestionRepository {
  private questions: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual camada é responsável exclusiva pelo isolamento do acesso ao banco de dados no padrão em 5 camadas?',
      pontuacao: 2.5,
      tags: ['Arquitetura', 'Backend', 'PostgreSQL'],
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
      enunciado: 'No contexto de persistência de versões de avaliação (ExamVersion), por que a ordem das alternativas deve ser materializada no banco?',
      pontuacao: 2.5,
      tags: ['Persistência', 'OMR', 'Algoritmos'],
      alternativas: [
        { id: 'alt_2_1', letraOriginal: 'A', texto: 'Para o leitor óptico relacionar a letra assinalada com a alternativa original correta.', correta: true },
        { id: 'alt_2_2', letraOriginal: 'B', texto: 'Para economizar memória no cache do aplicativo móvel.', correta: false },
        { id: 'alt_2_3', letraOriginal: 'C', texto: 'Apenas para formatar a margem visual do documento impresso.', correta: false },
        { id: 'alt_2_4', letraOriginal: 'D', texto: 'Para permitir ao estudante visualizar o gabarito antes da publicação.', correta: false }
      ]
    },
    {
      id: 'q3',
      tipo: 'objetiva',
      enunciado: 'Qual estratégia garante que a leitura de cartões-resposta funcione em locais sem acesso à internet no momento da correção?',
      pontuacao: 2.5,
      tags: ['Offline', 'Mobile', 'Sincronização'],
      alternativas: [
        { id: 'alt_3_1', letraOriginal: 'A', texto: 'Cache local prévio do snapshot do gabarito e fila idempotente via clientCorrectionId.', correta: true },
        { id: 'alt_3_2', letraOriginal: 'B', texto: 'Bloqueio total do app até o sinal 4G/Wi-Fi ser restabelecido.', correta: false },
        { id: 'alt_3_3', letraOriginal: 'C', texto: 'Envio assíncrono por e-mail para processamento no servidor.', correta: false },
        { id: 'alt_3_4', letraOriginal: 'D', texto: 'Uso de processamento de visão exclusivamente na nuvem.', correta: false }
      ]
    },
    {
      id: 'q4',
      tipo: 'discursiva',
      enunciado: 'Explique a importância da separação física entre a folha de respostas OMR e o caderno descritivo de questões para o estudante.',
      pontuacao: 2.5,
      tags: ['Pedagógico', 'OMR', 'Avaliação']
    }
  ];

  async findAll(): Promise<Question[]> {
    return JSON.parse(JSON.stringify(this.questions));
  }

  async findById(id: string): Promise<Question | undefined> {
    return this.questions.find(q => q.id === id);
  }

  async save(question: Question): Promise<Question> {
    const index = this.questions.findIndex(q => q.id === question.id);
    if (index >= 0) {
      this.questions[index] = question;
    } else {
      this.questions.unshift(question);
    }
    return question;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.questions.length;
    this.questions = this.questions.filter(q => q.id !== id);
    return this.questions.length < initialLength;
  }
}
