import { AlunoRepository } from '@/repositories/AlunoRepository';
import { AlunoModel } from '@/models/AlunoModel';

export class AlunoService {
  constructor(private alunoRepository: AlunoRepository = new AlunoRepository()) {}

  async listarAlunos(): Promise<AlunoModel[]> {
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

  async salvarAluno(dados: Partial<AlunoModel>): Promise<AlunoModel> {
    const aluno = new AlunoModel(dados);
    return this.alunoRepository.save(aluno);
  }

  async excluirAluno(id: string): Promise<boolean> {
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
