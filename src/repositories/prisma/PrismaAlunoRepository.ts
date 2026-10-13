import { prisma } from '@/lib/prisma';
import { AlunoModel } from '@/models/AlunoModel';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaAlunoRepository implements IBaseRepository<AlunoModel> {
  async findAll(): Promise<AlunoModel[]> {
    const records = await prisma.aluno.findMany({
      orderBy: { nome: 'asc' }
    });
    return records.map(r => new AlunoModel(r as any));
  }

  async findById(id: string): Promise<AlunoModel | undefined> {
    const record = await prisma.aluno.findUnique({
      where: { id }
    });
    return record ? new AlunoModel(record as any) : undefined;
  }

  async findByRa(ra: string): Promise<AlunoModel | undefined> {
    const record = await prisma.aluno.findUnique({
      where: { ra }
    });
    return record ? new AlunoModel(record as any) : undefined;
  }

  async findByTurmaId(turmaId: string): Promise<AlunoModel[]> {
    const records = await prisma.aluno.findMany({
      where: { turmaId },
      orderBy: { nome: 'asc' }
    });
    return records.map(r => new AlunoModel(r as any));
  }

  async save(aluno: AlunoModel): Promise<AlunoModel> {
    const dataToSave = {
      nome: aluno.nome,
      ra: aluno.ra,
      curso: aluno.curso || 'Engenharia de Software',
      turno: aluno.turno || 'Noturno',
      turmaId: aluno.turmaId,
      n1: aluno.n1 ?? 0,
      n2: aluno.n2 ?? 0,
      n3: aluno.n3 ?? 0,
      contato: (aluno.contato as any) || null,
      endereco: (aluno.endereco as any) || null
    };

    const saved = await prisma.aluno.upsert({
      where: { id: aluno.id },
      update: dataToSave,
      create: {
        id: aluno.id,
        ...dataToSave
      }
    });
    return new AlunoModel(saved as any);
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
