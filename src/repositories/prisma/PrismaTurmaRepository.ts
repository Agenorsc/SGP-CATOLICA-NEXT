import { prisma } from '@/lib/prisma';
import { TurmaModel } from '@/models/TurmaModel';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaTurmaRepository implements IBaseRepository<TurmaModel> {
  async findAll(): Promise<TurmaModel[]> {
    const records = await prisma.turma.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return records.map(r => new TurmaModel(r));
  }

  async findById(id: string): Promise<TurmaModel | undefined> {
    const record = await prisma.turma.findUnique({
      where: { id }
    });
    return record ? new TurmaModel(record) : undefined;
  }

  async save(turma: TurmaModel): Promise<TurmaModel> {
    const saved = await prisma.turma.upsert({
      where: { id: turma.id },
      update: {
        nome: turma.nome,
        curso: turma.curso,
        semestre: turma.semestre,
        codigoConvite: turma.codigoConvite
      },
      create: {
        id: turma.id,
        nome: turma.nome,
        curso: turma.curso,
        semestre: turma.semestre,
        codigoConvite: turma.codigoConvite
      }
    });
    return new TurmaModel(saved);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.turma.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
