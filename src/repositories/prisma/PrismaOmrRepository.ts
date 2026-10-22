import { prisma } from '@/lib/prisma';
import { LeituraOMRRegistro } from '@/types';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaOmrRepository implements IBaseRepository<LeituraOMRRegistro> {
  async findAll(): Promise<LeituraOMRRegistro[]> {
    const records = await prisma.leituraOMR.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return records.map(r => ({
      id: r.id,
      alunoId: r.alunoId,
      alunoNome: r.alunoNome,
      ra: r.ra,
      turmaId: r.turmaId ?? undefined,
      professorId: r.professorId ?? undefined,
      turmaNome: r.turmaNome,
      materia: r.materia,
      versao: r.versao,
      acertos: r.acertos,
      totalQuestoes: r.totalQuestoes,
      notaCalculada: r.notaCalculada,
      dataLeitura: r.dataLeitura,
      respostasDetectadas: (r.respostasDetectadas as any) || {},
      gabaritoOficial: (r.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (r.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: r.fiduciaisDetectados ?? undefined
    }));
  }

  async findById(id: string): Promise<LeituraOMRRegistro | undefined> {
    const r = await prisma.leituraOMR.findUnique({
      where: { id }
    });

    if (!r) return undefined;

    return {
      id: r.id,
      alunoId: r.alunoId,
      alunoNome: r.alunoNome,
      ra: r.ra,
      turmaId: r.turmaId ?? undefined,
      professorId: r.professorId ?? undefined,
      turmaNome: r.turmaNome,
      materia: r.materia,
      versao: r.versao,
      acertos: r.acertos,
      totalQuestoes: r.totalQuestoes,
      notaCalculada: r.notaCalculada,
      dataLeitura: r.dataLeitura,
      respostasDetectadas: (r.respostasDetectadas as any) || {},
      gabaritoOficial: (r.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (r.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: r.fiduciaisDetectados ?? undefined
    };
  }

  async findByAlunoId(alunoId: string): Promise<LeituraOMRRegistro[]> {
    const records = await prisma.leituraOMR.findMany({
      where: { alunoId },
      orderBy: { createdAt: 'desc' }
    });

    return records.map(r => ({
      id: r.id,
      alunoId: r.alunoId,
      alunoNome: r.alunoNome,
      ra: r.ra,
      turmaId: r.turmaId ?? undefined,
      professorId: r.professorId ?? undefined,
      turmaNome: r.turmaNome,
      materia: r.materia,
      versao: r.versao,
      acertos: r.acertos,
      totalQuestoes: r.totalQuestoes,
      notaCalculada: r.notaCalculada,
      dataLeitura: r.dataLeitura,
      respostasDetectadas: (r.respostasDetectadas as any) || {},
      gabaritoOficial: (r.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (r.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: r.fiduciaisDetectados ?? undefined
    }));
  }

  async save(registro: LeituraOMRRegistro): Promise<LeituraOMRRegistro> {
    const saved = await prisma.leituraOMR.create({
      data: {
        id: registro.id,
        alunoId: registro.alunoId,
        alunoNome: registro.alunoNome,
        ra: registro.ra,
        turmaId: registro.turmaId || null,
        professorId: registro.professorId || null,
        turmaNome: registro.turmaNome,
        materia: registro.materia,
        versao: registro.versao,
        acertos: registro.acertos,
        totalQuestoes: registro.totalQuestoes,
        notaCalculada: registro.notaCalculada,
        dataLeitura: registro.dataLeitura,
        respostasDetectadas: (registro.respostasDetectadas as any) || {},
        gabaritoOficial: (registro.gabaritoOficial as any) || null,
        detalhesQuestoes: (registro.detalhesQuestoes as any) || null,
        fiduciaisDetectados: registro.fiduciaisDetectados ?? true
      }
    });

    return {
      ...registro,
      id: saved.id
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.leituraOMR.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
