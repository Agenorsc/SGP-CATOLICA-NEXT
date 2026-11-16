import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { AlunoModel } from '@/models/AlunoModel';
import { UserSession } from '@/lib/session';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors';
import { UnauthorizedError } from '@/lib/errors';
import { importarAlunosDaPlanilha, AlunoImportResult } from '@/services/AlunoImportService';
import { randomUUID } from 'node:crypto';

export class AlunoService {
  constructor(
    private alunoRepository: any = new PrismaAlunoRepository(),
    private turmaRepository: any = new PrismaTurmaRepository()
  ) {}

  async listarAlunos(options?: { turmaId?: string | null; session?: UserSession | null }): Promise<AlunoModel[]> {
    const { turmaId, session } = options || {};
    if (turmaId) {
      if (session?.role === 'PROFESSOR') {
        const turma = await this.turmaRepository.findById(turmaId);
        if (!turma || turma.professorId !== session.id) {
          throw new ForbiddenError('Acesso negado a esta turma.');
        }
      }
      return this.alunoRepository.findByTurmaId(turmaId);
    }

    if (session?.role === 'PROFESSOR') {
      return this.alunoRepository.findByProfessorId(session.id);
    }

    return this.alunoRepository.findAll();
  }

  async buscarPorId(id: string): Promise<AlunoModel | undefined> {
    return this.alunoRepository.findById(id);
  }

  async buscarPorTurma(turmaId: string): Promise<AlunoModel[]> {
    return this.alunoRepository.findByTurmaId(turmaId);
  }

  /**
   * Validação de regras acadêmicas para cadastro de alunos
   */
  validarCadastroAluno(
    dados: Partial<AlunoModel>,
    turmasDisponiveis: { id: string }[],
    alunosExistentes: AlunoModel[] = [],
    idEmEdicao?: string | null
  ): { valido: boolean; erro?: string } {
    // 1. Validação Obrigatória de Turma
    if (turmasDisponiveis.length === 0 || !dados.turmaId || dados.turmaId.trim() === '') {
      return { valido: false, erro: 'Cadastre a turma antes!' };
    }

    // 2. Validação de RA Duplicado
    const raTrim = (dados.ra || '').trim();
    if (!raTrim) {
      return { valido: false, erro: 'Informe o Registro Acadêmico (RA).' };
    }

    const raDuplicado = alunosExistentes.some(a => {
      const mesmoId = idEmEdicao && a.id === idEmEdicao;
      return !mesmoId && (a.ra || '').trim().toLowerCase() === raTrim.toLowerCase();
    });

    if (raDuplicado) {
      return { valido: false, erro: 'RA duplicado!' };
    }

    return { valido: true };
  }

  async salvarAluno(dados: Partial<AlunoModel>, session?: UserSession | null): Promise<AlunoModel> {
    if (!dados.turmaId) {
      throw new ValidationError('turmaId é obrigatório.');
    }

    if (session?.role === 'PROFESSOR') {
      const turma = await this.turmaRepository.findById(dados.turmaId);
      if (!turma || turma.professorId !== session.id) {
        throw new ForbiddenError('Acesso negado. Você só pode cadastrar alunos em suas próprias turmas.');
      }
    }

    const aluno = new AlunoModel(dados);
    return this.alunoRepository.save(aluno);
  }

  async importarAlunos(
    file: ArrayBuffer | Uint8Array,
    session?: UserSession | null
  ): Promise<AlunoImportResult & { importados: number }> {
    if (!session) throw new UnauthorizedError();

    const turmas = session.role === 'PROFESSOR'
      ? await this.turmaRepository.findByProfessorId(session.id)
      : await this.turmaRepository.findAll();
    const alunosExistentes = await this.alunoRepository.findAll();
    const resultado = importarAlunosDaPlanilha(file, turmas, alunosExistentes);
    const novosAlunos = resultado.validos.map(row => new AlunoModel({
      id: randomUUID(),
      nome: row.nome,
      ra: row.ra.trim(),
      turmaId: row.turmaId
    }));

    const importados = typeof this.alunoRepository.createMany === 'function'
      ? await this.alunoRepository.createMany(novosAlunos)
      : await Promise.all(novosAlunos.map(aluno => this.alunoRepository.save(aluno))).then(saved => saved.length);

    return { ...resultado, importados };
  }

  async excluirAluno(id: string, session?: UserSession | null): Promise<boolean> {
    const aluno = await this.alunoRepository.findById(id);
    if (!aluno) {
      throw new NotFoundError('Aluno não encontrado.');
    }

    if (session?.role === 'PROFESSOR') {
      const turma = await this.turmaRepository.findById(aluno.turmaId);
      if (!turma || turma.professorId !== session.id) {
        throw new ForbiddenError('Acesso negado. Você só pode excluir alunos de suas próprias turmas.');
      }
    }

    return this.alunoRepository.delete(id);
  }

  async atualizarNotaN2(alunoId: string, notaN2: number): Promise<AlunoModel | undefined> {
    const aluno = await this.alunoRepository.findById(alunoId);
    if (!aluno) return undefined;

    const alunoAtualizado = new AlunoModel({
      ...aluno,
      n2: notaN2
    });
    return this.alunoRepository.save(alunoAtualizado);
  }

  filtrarAlunos(alunos: AlunoModel[], termoBusca: string): AlunoModel[] {
    if (!termoBusca.trim()) return alunos;
    const termo = termoBusca.toLowerCase();
    return alunos.filter(a =>
      a.nome.toLowerCase().includes(termo) ||
      a.ra.toLowerCase().includes(termo)
    );
  }

  calcularEstatisticasGerais(alunos: AlunoModel[]) {
    if (alunos.length === 0) {
      return { mediaGeral: '0.0', taxaAprovacao: 0 };
    }
    const somaMedias = alunos.reduce((acc, a) => acc + a.media, 0);
    const mediaGeral = (somaMedias / alunos.length).toFixed(1);
    const aprovados = alunos.filter(a => a.status === 'Aprovado').length;
    const taxaAprovacao = Math.round((aprovados / alunos.length) * 100);

    return { mediaGeral, taxaAprovacao };
  }
}
