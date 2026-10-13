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

  // 3. Questões e Alternativas
  const questoes = [
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
      tags: ['Pedagógico', 'OMR', 'Avaliação'],
      alternativas: []
    }
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
