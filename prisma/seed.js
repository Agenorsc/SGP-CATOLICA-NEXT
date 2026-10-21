const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed do Banco de Dados Supabase ---');

  // 1. Turmas
  const turmas = [
    {
      id: 't1',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      codigoConvite: 'CAT-8842'
    },
    {
      id: 't2',
      nome: 'Arquitetura de Software',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      codigoConvite: 'CAT-9910'
    }
  ];

  for (const t of turmas) {
    await prisma.turma.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }
  console.log(`Turmas inseridas/atualizadas: ${turmas.length}`);

  // 2. Alunos
  const alunos = [
    {
      id: 'alu-01',
      nome: 'AGENOR ALVISE',
      ra: '1328834',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 9.5,
      n2: 8.5,
      n3: 9.0,
      contato: { celular: '(47) 99690-0033' },
      endereco: {
        cep: '89251500',
        logradouro: 'MARINA FRUTUOSO',
        numero: '810',
        bairro: 'CENTRO',
        cidade: 'Jaraguá do Sul',
        estado: 'SC'
      }
    },
    {
      id: 'alu-02',
      nome: 'Beatriz Ramos',
      ra: '20241002',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 7.5,
      n2: 8.0,
      n3: 8.5
    },
    {
      id: 'alu-03',
      nome: 'Lucas Martins',
      ra: '20241003',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 4.5,
      n2: 5.0,
      n3: 6.0
    },
    {
      id: 'alu-04',
      nome: 'Fernanda Lima',
      ra: '20241004',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 10.0,
      n2: 9.5,
      n3: 10.0
    },
    {
      id: 'alu-05',
      nome: 'Leticia Alvise',
      ra: 'RQ123456',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: 't1',
      n1: 8.5,
      n2: 0.0,
      n3: 8.5
    }
  ];

  for (const a of alunos) {
    await prisma.aluno.upsert({
      where: { id: a.id },
      update: a,
      create: a
    });
  }
  console.log(`Alunos inseridos/atualizados: ${alunos.length}`);

  // 3. Questões e Alternativas estritamente individualizadas por Turma (t1 e t2) e Ciclo Avaliativo (N1, N2, N3, N-1)
  const questoes = [
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
      avaliacao: 'N3',
      alternativas: []
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
    { id: 'q1_t2_n1', tipo: 'objetiva', enunciado: 'Qual princípio do acrônimo SOLID preconiza que módulos de alto nível não devem depender diretamente de módulos de baixo nível, mas sim de contratos ou abstrações?', pontuacao: 2.5, tags: ['SOLID', 'Design Patterns', 'Arquitetura'], turmaId: 't2', avaliacao: 'N1', alternativas: [{ id: 'alt_t2_1_1', letraOriginal: 'A', texto: 'Princípio da Inversão de Dependência (Dependency Inversion Principle).', correta: true }, { id: 'alt_t2_1_2', letraOriginal: 'B', texto: 'Princípio da Responsabilidade Única (Single Responsibility Principle).', correta: false }, { id: 'alt_t2_1_3', letraOriginal: 'C', texto: 'Princípio Aberto/Fechado (Open/Closed Principle).', correta: false }, { id: 'alt_t2_1_4', letraOriginal: 'D', texto: 'Princípio da Segregação de Interfaces (Interface Segregation Principle).', correta: false }, { id: 'alt_t2_1_5', letraOriginal: 'E', texto: 'Princípio da Substituição de Liskov (Liskov Substitution Principle).', correta: false }] },
    { id: 'q2_t2_n2', tipo: 'objetiva', enunciado: 'Em uma arquitetura de serviços distribuídos, qual padrão de resiliência impede o efeito dominó de falhas ao interromper temporariamente requisições a um serviço instável?', pontuacao: 2.5, tags: ['Resiliência', 'Microsserviços', 'Arquitetura Distribuída'], turmaId: 't2', avaliacao: 'N2', alternativas: [{ id: 'alt_t2_2_1', letraOriginal: 'A', texto: 'Circuit Breaker (Disjuntor de Circuito), operando nos estados Fechado, Aberto e Meio-Aberto.', correta: true }, { id: 'alt_t2_2_2', letraOriginal: 'B', texto: 'Polling síncrono contínuo com repetições sem intervalo de espera.', correta: false }, { id: 'alt_t2_2_3', letraOriginal: 'C', texto: 'Centralização de toda a lógica em um único processo monolítico compartilhado.', correta: false }, { id: 'alt_t2_2_4', letraOriginal: 'D', texto: 'Compartilhamento síncrono de variáveis globais entre instâncias remotas.', correta: false }] },
    { id: 'q3_t2_n2', tipo: 'objetiva', enunciado: 'Ao projetar uma arquitetura orientada a eventos assíncronos, qual benefício fundamental o uso de uma Dead Letter Queue (DLQ) agrega à confiabilidade do sistema?', pontuacao: 2.5, tags: ['Event-Driven', 'Mensageria', 'Confiabilidade'], turmaId: 't2', avaliacao: 'N2', alternativas: [{ id: 'alt_t2_3_1', letraOriginal: 'A', texto: 'Captura e isolamento de mensagens com falhas recorrentes de processamento, impedindo o travamento da fila principal.', correta: true }, { id: 'alt_t2_3_2', letraOriginal: 'B', texto: 'Execução obrigatória de consultas síncronas diretamente no banco principal.', correta: false }, { id: 'alt_t2_3_3', letraOriginal: 'C', texto: 'Eliminação completa de mecanismos de tolerância a falhas na infraestrutura.', correta: false }, { id: 'alt_t2_3_4', letraOriginal: 'D', texto: 'Limitação do tráfego a uma única mensagem por segundo.', correta: false }] },
    { id: 'q4_t2_n3', tipo: 'discursiva', enunciado: 'Analise os trade-offs entre um monólito modular e uma arquitetura orientada a microsserviços, comparando acoplamento funcional, sobrecarga operacional e consistência de dados.', pontuacao: 2.5, tags: ['Trade-offs', 'Monólito Modular', 'Microsserviços'], turmaId: 't2', avaliacao: 'N3', alternativas: [] },
    { id: 'q5_t2_exame', tipo: 'objetiva', enunciado: 'Na Arquitetura Limpa (Clean Architecture), qual é a regra primordial sobre a direção das dependências entre as camadas do sistema?', pontuacao: 2.5, tags: ['Clean Architecture', 'Camadas', 'Dependências'], turmaId: 't2', avaliacao: 'N-1', alternativas: [{ id: 'alt_t2_5_1', letraOriginal: 'A', texto: 'As dependências no código-fonte devem apontar sempre para dentro, em direção às regras de negócio e entidades de domínio.', correta: true }, { id: 'alt_t2_5_2', letraOriginal: 'B', texto: 'As entidades de domínio devem importar componentes da interface com o usuário e bibliotecas externas.', correta: false }, { id: 'alt_t2_5_3', letraOriginal: 'C', texto: 'Os controladores web devem acessar diretamente arquivos físicos de configuração sem intermediários.', correta: false }, { id: 'alt_t2_5_4', letraOriginal: 'D', texto: 'A camada de banco de dados deve orquestrar as rotas de navegação da interface.', correta: false }] }
  ];

  for (const q of questoes) {
    const { alternativas, ...questaoData } = q;
    await prisma.questao.upsert({
      where: { id: q.id },
      update: questaoData,
      create: questaoData
    });

    if (alternativas && alternativas.length > 0) {
      for (const alt of alternativas) {
        await prisma.alternativa.upsert({
          where: { id: alt.id },
          update: { ...alt, questaoId: q.id },
          create: { ...alt, questaoId: q.id }
        });
      }
    }
  }
  console.log(`Questões inseridas/atualizadas: ${questoes.length}`);

  console.log('--- Seed finalizado com sucesso! ---');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
