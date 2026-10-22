import { prisma } from '@/lib/prisma';
import { TurmaModel } from '@/models/TurmaModel';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaTurmaRepository implements IBaseRepository<TurmaModel> {
  async findAll(): Promise<TurmaModel[]> {
    const records = await prisma.turma.findMany({
      include: {
        professor: true
      },
      orderBy: { createdAt: 'asc' }
    });
    return records.map(r => new TurmaModel({
      id: r.id,
      nome: r.nome,
      curso: r.curso,
      semestre: r.semestre,
      codigoConvite: r.codigoConvite,
      professorId: r.professorId || undefined,
      professorNome: r.professor?.nome || undefined
    }));
  }

  async findById(id: string): Promise<TurmaModel | undefined> {
    const record = await prisma.turma.findUnique({
      where: { id },
      include: {
        professor: true
      }
    });
    return record ? new TurmaModel({
      id: record.id,
      nome: record.nome,
      curso: record.curso,
      semestre: record.semestre,
      codigoConvite: record.codigoConvite,
      professorId: record.professorId || undefined,
      professorNome: record.professor?.nome || undefined
    }) : undefined;
  }

  async save(turma: TurmaModel): Promise<TurmaModel> {
    const saved = await prisma.turma.upsert({
      where: { id: turma.id },
      update: {
        nome: turma.nome,
        curso: turma.curso,
        semestre: turma.semestre,
        codigoConvite: turma.codigoConvite,
        professorId: turma.professorId || null
      },
      create: {
        id: turma.id,
        nome: turma.nome,
        curso: turma.curso,
        semestre: turma.semestre,
        codigoConvite: turma.codigoConvite,
        professorId: turma.professorId || null
      },
      include: {
        professor: true
      }
    });
    return new TurmaModel({
      id: saved.id,
      nome: saved.nome,
      curso: saved.curso,
      semestre: saved.semestre,
      codigoConvite: saved.codigoConvite,
      professorId: saved.professorId || undefined,
      professorNome: saved.professor?.nome || undefined
    });
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
