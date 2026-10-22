import { Question } from '@/types';
import { IBaseRepository } from './base/IBaseRepository';

export class QuestionRepository implements IBaseRepository<Question> {
  private fallbackQuestions: Question[] = [
    // ==========================================
    // TURMA 1: Engenharia de Software IV (t1)
    // ==========================================
    {
      id: 'q1_t1_n1',
      tipo: 'objetiva',
      enunciado: 'No levantamento de requisitos de software, qual técnica garante a validação funcional contínua das necessidades do usuário por meio de critérios de aceitação objetivos no formato Given-When-Then?',
      pontuacao: 2.5,
      tags: ['Requisitos', 'Engenharia de Software', 'BDD'],
      turmaId: 't1',
      avaliacao: 'N1',
      alternativas: [
        { id: 'alt_t1_1_1', letraOriginal: 'A', texto: 'Especificação Baseada em Comportamento com validação orientada ao negócio e critérios objetivos de aceitação.', correta: true },
        { id: 'alt_t1_1_2', letraOriginal: 'B', texto: 'Documentação monolítica estática entregue exclusivamente no encerramento do semestre.', correta: false },
        { id: 'alt_t1_1_3', letraOriginal: 'C', texto: 'Eliminação formal das reuniões de alinhamento com os usuários-chave.', correta: false },
        { id: 'alt_t1_1_4', letraOriginal: 'D', texto: 'Codificação direta nos ambientes produtivos sem validação prévia de regras.', correta: false },
        { id: 'alt_t1_1_5', letraOriginal: 'E', texto: 'Transferência de toda a responsabilidade de requisitos para os usuários finais.', correta: false }
      ]
    },
    {
      id: 'q2_t1_n2',
      tipo: 'objetiva',
      enunciado: 'Durante a execução de testes automatizados na esteira de integração contínua (CI), qual o principal objetivo dos testes de regressão?',
      pontuacao: 2.5,
      tags: ['Qualidade', 'Testes', 'CI/CD'],
      turmaId: 't1',
      avaliacao: 'N2',
      alternativas: [
        { id: 'alt_t1_2_1', letraOriginal: 'A', texto: 'Garantir que alterações recentes no código ou correções de defeitos não introduzam falhas em funcionalidades pré-existentes.', correta: true },
        { id: 'alt_t1_2_2', letraOriginal: 'B', texto: 'Avaliar unicamente a velocidade de conexão física entre roteadores locais.', correta: false },
        { id: 'alt_t1_2_3', letraOriginal: 'C', texto: 'Substituir integralmente todos os testes unitários por verificações manuais ocasionais.', correta: false },
        { id: 'alt_t1_2_4', letraOriginal: 'D', texto: 'Monitorar a temperatura física dos servidores de hospedagem.', correta: false }
      ]
    },
    {
      id: 'q3_t1_n2',
      tipo: 'objetiva',
      enunciado: 'Em um fluxo de entrega contínua (CD), como a estratégia de Feature Flags auxilia na redução de riscos durante o lançamento de novas funcionalidades funcionais?',
      pontuacao: 2.5,
      tags: ['Entrega Contínua', 'DevOps', 'Deploy'],
      turmaId: 't1',
      avaliacao: 'N2',
      alternativas: [
        { id: 'alt_t1_3_1', letraOriginal: 'A', texto: 'Permite habilitar ou desabilitar funcionalidades em produção para grupos específicos sem exigir um novo deploy do sistema.', correta: true },
        { id: 'alt_t1_3_2', letraOriginal: 'B', texto: 'Apaga o histórico de logs do servidor sempre que um novo deploy é concluído.', correta: false },
        { id: 'alt_t1_3_3', letraOriginal: 'C', texto: 'Obriga o encerramento manual das conexões de rede em horário comercial.', correta: false },
        { id: 'alt_t1_3_4', letraOriginal: 'D', texto: 'Transforma automaticamente código legado em funções serverless.', correta: false }
      ]
    },
    {
      id: 'q4_t1_n3',
      tipo: 'discursiva',
      enunciado: 'Apresente uma proposta prática de gestão de dívida técnica em um time ágil, descrevendo critérios para balancear itens de refatoração e novas entregas de valor no backlog.',
      pontuacao: 2.5,
      tags: ['Dívida Técnica', 'Gestão Ágil', 'Qualidade'],
      turmaId: 't1',
      avaliacao: 'N3'
    },
    {
      id: 'q5_t1_exame',
      tipo: 'objetiva',
      enunciado: 'No ciclo de vida de desenvolvimento de software, qual prática sintetiza a integração contínua e a entrega rápida de valor apoiada em feedback contínuo?',
      pontuacao: 2.5,
      tags: ['Ciclo de Vida', 'Feedback', 'Engenharia de Software'],
      turmaId: 't1',
      avaliacao: 'N-1',
      alternativas: [
        { id: 'alt_t1_5_1', letraOriginal: 'A', texto: 'Ciclos iterativos com automação de compilação, testes de cobertura e entregas frequentes orientadas a feedback.', correta: true },
        { id: 'alt_t1_5_2', letraOriginal: 'B', texto: 'Abordagem sequencial pura sem entregas incrementais ou validações parciais.', correta: false },
        { id: 'alt_t1_5_3', letraOriginal: 'C', texto: 'Transferência da etapa de testes de aceitação para o final do projeto de implantação.', correta: false },
        { id: 'alt_t1_5_4', letraOriginal: 'D', texto: 'Armazenamento manual de versões em diretórios locais de desenvolvedores.', correta: false }
      ]
    },
    {
      id: 'q1_t2_n1', tipo: 'objetiva', enunciado: 'Qual princípio do acrônimo SOLID preconiza que módulos de alto nível não devem depender diretamente de módulos de baixo nível, mas sim de contratos ou abstrações?', pontuacao: 2.5, tags: ['SOLID', 'Design Patterns', 'Arquitetura'], turmaId: 't2', avaliacao: 'N1',
      alternativas: [{ id: 'alt_t2_1_1', letraOriginal: 'A', texto: 'Princípio da Inversão de Dependência (Dependency Inversion Principle).', correta: true }, { id: 'alt_t2_1_2', letraOriginal: 'B', texto: 'Princípio da Responsabilidade Única (Single Responsibility Principle).', correta: false }, { id: 'alt_t2_1_3', letraOriginal: 'C', texto: 'Princípio Aberto/Fechado (Open/Closed Principle).', correta: false }, { id: 'alt_t2_1_4', letraOriginal: 'D', texto: 'Princípio da Segregação de Interfaces (Interface Segregation Principle).', correta: false }, { id: 'alt_t2_1_5', letraOriginal: 'E', texto: 'Princípio da Substituição de Liskov (Liskov Substitution Principle).', correta: false }]
    },
    {
      id: 'q2_t2_n2', tipo: 'objetiva', enunciado: 'Em uma arquitetura de serviços distribuídos, qual padrão de resiliência impede o efeito dominó de falhas ao interromper temporariamente requisições a um serviço instável?', pontuacao: 2.5, tags: ['Resiliência', 'Microsserviços', 'Arquitetura Distribuída'], turmaId: 't2', avaliacao: 'N2',
      alternativas: [{ id: 'alt_t2_2_1', letraOriginal: 'A', texto: 'Circuit Breaker (Disjuntor de Circuito), operando nos estados Fechado, Aberto e Meio-Aberto.', correta: true }, { id: 'alt_t2_2_2', letraOriginal: 'B', texto: 'Polling síncrono contínuo com repetições sem intervalo de espera.', correta: false }, { id: 'alt_t2_2_3', letraOriginal: 'C', texto: 'Centralização de toda a lógica em um único processo monolítico compartilhado.', correta: false }, { id: 'alt_t2_2_4', letraOriginal: 'D', texto: 'Compartilhamento síncrono de variáveis globais entre instâncias remotas.', correta: false }]
    },
    {
      id: 'q3_t2_n2', tipo: 'objetiva', enunciado: 'Ao projetar uma arquitetura orientada a eventos assíncronos, qual benefício fundamental o uso de uma Dead Letter Queue (DLQ) agrega à confiabilidade do sistema?', pontuacao: 2.5, tags: ['Event-Driven', 'Mensageria', 'Confiabilidade'], turmaId: 't2', avaliacao: 'N2',
      alternativas: [{ id: 'alt_t2_3_1', letraOriginal: 'A', texto: 'Captura e isolamento de mensagens com falhas recorrentes de processamento, impedindo o travamento da fila principal.', correta: true }, { id: 'alt_t2_3_2', letraOriginal: 'B', texto: 'Execução obrigatória de consultas síncronas diretamente no banco principal.', correta: false }, { id: 'alt_t2_3_3', letraOriginal: 'C', texto: 'Eliminação completa de mecanismos de tolerância a falhas na infraestrutura.', correta: false }, { id: 'alt_t2_3_4', letraOriginal: 'D', texto: 'Limitação do tráfego a uma única mensagem por segundo.', correta: false }]
    },
    { id: 'q4_t2_n3', tipo: 'discursiva', enunciado: 'Analise os trade-offs entre um monólito modular e uma arquitetura orientada a microsserviços, comparando acoplamento funcional, sobrecarga operacional e consistência de dados.', pontuacao: 2.5, tags: ['Trade-offs', 'Monólito Modular', 'Microsserviços'], turmaId: 't2', avaliacao: 'N3' },
    {
      id: 'q5_t2_exame', tipo: 'objetiva', enunciado: 'Na Arquitetura Limpa (Clean Architecture), qual é a regra primordial sobre a direção das dependências entre as camadas do sistema?', pontuacao: 2.5, tags: ['Clean Architecture', 'Camadas', 'Dependências'], turmaId: 't2', avaliacao: 'N-1',
      alternativas: [{ id: 'alt_t2_5_1', letraOriginal: 'A', texto: 'As dependências no código-fonte devem apontar sempre para dentro, em direção às regras de negócio e entidades de domínio.', correta: true }, { id: 'alt_t2_5_2', letraOriginal: 'B', texto: 'As entidades de domínio devem importar componentes da interface com o usuário e bibliotecas externas.', correta: false }, { id: 'alt_t2_5_3', letraOriginal: 'C', texto: 'Os controladores web devem acessar diretamente arquivos físicos de configuração sem intermediários.', correta: false }, { id: 'alt_t2_5_4', letraOriginal: 'D', texto: 'A camada de banco de dados deve orquestrar as rotas de navegação da interface.', correta: false }]
    }
  ];

  async findAll(): Promise<Question[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/questoes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          this.fallbackQuestions = data;
          return this.fallbackQuestions;
        }
      } catch (err) {
        console.warn('Falha ao buscar questões da API, usando cache local:', err);
      }
    }
    return JSON.parse(JSON.stringify(this.fallbackQuestions));
  }

  async findById(id: string): Promise<Question | undefined> {
    const list = await this.findAll();
    return list.find(q => q.id === id);
  }

  async save(question: Question): Promise<Question> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/questoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(question)
        });
        if (res.ok) {
          const savedData = await res.json();
          const idx = this.fallbackQuestions.findIndex(q => q.id === savedData.id);
          if (idx >= 0) {
            this.fallbackQuestions[idx] = savedData;
          } else {
            this.fallbackQuestions.unshift(savedData);
          }
          return savedData;
        }
      } catch (err) {
        console.warn('Falha ao salvar questão na API, salvando localmente:', err);
      }
    }

    const index = this.fallbackQuestions.findIndex(q => q.id === question.id);
    if (index >= 0) {
      this.fallbackQuestions[index] = question;
    } else {
      this.fallbackQuestions.unshift(question);
    }
    return question;
  }

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/questoes/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          this.fallbackQuestions = this.fallbackQuestions.filter(q => q.id !== id);
          return true;
        }
      } catch (err) {
        console.warn('Falha ao excluir questão na API:', err);
      }
    }

    const initialLength = this.fallbackQuestions.length;
    this.fallbackQuestions = this.fallbackQuestions.filter(q => q.id !== id);
    return this.fallbackQuestions.length < initialLength;
  }
}
