import { prisma } from '@/lib/prisma';
import { AlunoModel } from '@/models/AlunoModel';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaAlunoRepository implements IBaseRepository<AlunoModel> {
  private mapRecordToModel(r: any): AlunoModel {
    const contato = (r.contato && typeof r.contato === 'object') ? r.contato : {};
    const filiacao = r.filiacao || contato.filiacao || {
      mae: contato.mae || '',
      pai: contato.pai || ''
    };

    return new AlunoModel({
      id: r.id,
      nome: r.nome,
      ra: r.ra,
      curso: r.curso,
      turno: r.turno,
      turmaId: r.turmaId,
      n1: r.n1 ?? 0,
      n2: r.n2 ?? 0,
      n3: r.n3 ?? 0,
      dataNascimento: r.dataNascimento || contato.dataNascimento || '',
      naturalidade: r.naturalidade || contato.naturalidade || '',
      estadoNatal: r.estadoNatal || contato.estadoNatal || '',
      filiacao: {
        mae: filiacao.mae || contato.mae || '',
        pai: filiacao.pai || contato.pai || ''
      },
      contato: {
        celular: contato.celular || ''
      },
      endereco: r.endereco || {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: ''
      }
    });
  }

  async findAll(): Promise<AlunoModel[]> {
    const records = await prisma.aluno.findMany({
      orderBy: { nome: 'asc' }
    });
    return records.map(r => this.mapRecordToModel(r));
  }

  async findById(id: string): Promise<AlunoModel | undefined> {
    const record = await prisma.aluno.findUnique({
      where: { id }
    });
    return record ? this.mapRecordToModel(record) : undefined;
  }

  async findByRa(ra: string): Promise<AlunoModel | undefined> {
    const record = await prisma.aluno.findUnique({
      where: { ra }
    });
    return record ? this.mapRecordToModel(record) : undefined;
  }

  async findByTurmaId(turmaId: string): Promise<AlunoModel[]> {
    const records = await prisma.aluno.findMany({
      where: { turmaId },
      orderBy: { nome: 'asc' }
    });
    return records.map(r => this.mapRecordToModel(r));
  }

  async findByProfessorId(professorId: string): Promise<AlunoModel[]> {
    const records = await prisma.aluno.findMany({
      where: {
        turma: {
          professorId
        }
      },
      orderBy: { nome: 'asc' }
    });
    return records.map(r => this.mapRecordToModel(r));
  }

  async save(aluno: AlunoModel): Promise<AlunoModel> {
    const contatoJson = {
      ...(typeof aluno.contato === 'object' && aluno.contato ? aluno.contato : {}),
      celular: aluno.contato?.celular || '',
      dataNascimento: aluno.dataNascimento || '',
      naturalidade: aluno.naturalidade || '',
      estadoNatal: aluno.estadoNatal || '',
      filiacao: {
        mae: aluno.filiacao?.mae || '',
        pai: aluno.filiacao?.pai || ''
      },
      mae: aluno.filiacao?.mae || '',
      pai: aluno.filiacao?.pai || ''
    };

    const dataToSave = {
      nome: aluno.nome,
      ra: aluno.ra,
      curso: aluno.curso || 'Engenharia de Software',
      turno: aluno.turno || 'Noturno',
      turmaId: aluno.turmaId,
      n1: aluno.n1 ?? 0,
      n2: aluno.n2 ?? 0,
      n3: aluno.n3 ?? 0,
      contato: contatoJson,
      endereco: (aluno.endereco as any) || null
    };

    // Garante integridade relacional no PostgreSQL procurando por ID ou por RA único
    let existing = await prisma.aluno.findUnique({ where: { id: aluno.id } });
    if (!existing && aluno.ra) {
      existing = await prisma.aluno.findUnique({ where: { ra: aluno.ra } });
    }
    const targetId = existing ? existing.id : aluno.id;

    const saved = await prisma.aluno.upsert({
      where: { id: targetId },
      update: dataToSave,
      create: {
        id: targetId,
        ...dataToSave
      }
    });
    return this.mapRecordToModel(saved);
  }

  async createMany(alunos: AlunoModel[]): Promise<number> {
    if (alunos.length === 0) return 0;

    const result = await prisma.aluno.createMany({
      data: alunos.map(aluno => ({
        id: aluno.id,
        nome: aluno.nome,
        ra: aluno.ra,
        curso: aluno.curso || 'Engenharia de Software',
        turno: aluno.turno || 'Noturno',
        turmaId: aluno.turmaId,
        n1: aluno.n1 ?? 0,
        n2: aluno.n2 ?? 0,
        n3: aluno.n3 ?? 0,
        contato: {
          ...(typeof aluno.contato === 'object' && aluno.contato ? aluno.contato : {}),
          celular: aluno.contato?.celular || '',
          dataNascimento: aluno.dataNascimento || '',
          naturalidade: aluno.naturalidade || '',
          estadoNatal: aluno.estadoNatal || '',
          filiacao: {
            mae: aluno.filiacao?.mae || '',
            pai: aluno.filiacao?.pai || ''
          },
          mae: aluno.filiacao?.mae || '',
          pai: aluno.filiacao?.pai || ''
        },
        endereco: (aluno.endereco as any) || null
      }))
    });

    return result.count;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.aluno.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
