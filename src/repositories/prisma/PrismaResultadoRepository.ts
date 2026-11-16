import { prisma } from '@/lib/prisma';
import { ResultadoAvaliacaoRegistro } from '@/types';

export class PrismaResultadoRepository {
  async findById(id: string): Promise<ResultadoAvaliacaoRegistro | null> {
    try {
      const record = await (prisma as any).resultadoAvaliacao.findUnique({
        where: { id },
        include: {
          provaMontada: {
            include: { turma: true }
          },
          cadernoProva: true
        }
      });

      if (!record) return null;

      return {
        id: record.id,
        professorId: record.professorId,
        provaMontadaId: record.provaMontadaId,
        cadernoProvaId: record.cadernoProvaId,
        alunoNome: record.alunoNome,
        alunoRa: record.alunoRa,
        respostasMarcadasJson: record.respostasMarcadasJson as any,
        acertos: record.acertos,
        totalQuestoes: record.totalQuestoes,
        notaFinal: Number(record.notaFinal),
        lidoViaMobile: Boolean(record.lidoViaMobile),
        createdAt: record.createdAt?.toISOString(),
        provaTitulo: record.provaMontada?.titulo,
        turmaNome: record.provaMontada?.turma?.nome,
        codigoVersao: record.cadernoProva?.codigoVersao
      };
    } catch (error) {
      console.warn('Erro ao buscar resultado no Prisma:', error);
      return null;
    }
  }

  async findByProfessorId(professorId: string): Promise<ResultadoAvaliacaoRegistro[]> {
    try {
      const records = await (prisma as any).resultadoAvaliacao.findMany({
        where: { professorId },
        orderBy: { createdAt: 'desc' },
        include: {
          provaMontada: {
            include: { turma: true }
          },
          cadernoProva: true
        }
      });

      return records.map((record: any) => ({
        id: record.id,
        professorId: record.professorId,
        provaMontadaId: record.provaMontadaId,
        cadernoProvaId: record.cadernoProvaId,
        alunoNome: record.alunoNome,
        alunoRa: record.alunoRa,
        respostasMarcadasJson: record.respostasMarcadasJson as any,
        acertos: record.acertos,
        totalQuestoes: record.totalQuestoes,
        notaFinal: Number(record.notaFinal),
        lidoViaMobile: Boolean(record.lidoViaMobile),
        createdAt: record.createdAt?.toISOString(),
        provaTitulo: record.provaMontada?.titulo,
        turmaNome: record.provaMontada?.turma?.nome,
        codigoVersao: record.cadernoProva?.codigoVersao
      }));
    } catch (error) {
      console.warn('Erro ao buscar resultados por professorId:', error);
      return [];
    }
  }

  async findByProvaMontadaId(provaMontadaId: string): Promise<ResultadoAvaliacaoRegistro[]> {
    try {
      const records = await (prisma as any).resultadoAvaliacao.findMany({
        where: { provaMontadaId },
        orderBy: { createdAt: 'desc' },
        include: {
          provaMontada: {
            include: { turma: true }
          },
          cadernoProva: true
        }
      });

      return records.map((record: any) => ({
        id: record.id,
        professorId: record.professorId,
        provaMontadaId: record.provaMontadaId,
        cadernoProvaId: record.cadernoProvaId,
        alunoNome: record.alunoNome,
        alunoRa: record.alunoRa,
        respostasMarcadasJson: record.respostasMarcadasJson as any,
        acertos: record.acertos,
        totalQuestoes: record.totalQuestoes,
        notaFinal: Number(record.notaFinal),
        lidoViaMobile: Boolean(record.lidoViaMobile),
        createdAt: record.createdAt?.toISOString(),
        provaTitulo: record.provaMontada?.titulo,
        turmaNome: record.provaMontada?.turma?.nome,
        codigoVersao: record.cadernoProva?.codigoVersao
      }));
    } catch (error) {
      console.warn('Erro ao buscar resultados por provaMontadaId:', error);
      return [];
    }
  }

  async save(item: ResultadoAvaliacaoRegistro): Promise<ResultadoAvaliacaoRegistro> {
    const record = await (prisma as any).resultadoAvaliacao.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        professorId: item.professorId,
        provaMontadaId: item.provaMontadaId,
        cadernoProvaId: item.cadernoProvaId || null,
        alunoNome: item.alunoNome,
        alunoRa: item.alunoRa || null,
        respostasMarcadasJson: item.respostasMarcadasJson as any,
        acertos: item.acertos,
        totalQuestoes: item.totalQuestoes,
        notaFinal: item.notaFinal,
        lidoViaMobile: item.lidoViaMobile ?? true
      },
      update: {
        alunoNome: item.alunoNome,
        alunoRa: item.alunoRa || null,
        respostasMarcadasJson: item.respostasMarcadasJson as any,
        acertos: item.acertos,
        totalQuestoes: item.totalQuestoes,
        notaFinal: item.notaFinal,
        lidoViaMobile: item.lidoViaMobile ?? true
      }
    });

    return {
      id: record.id,
      professorId: record.professorId,
      provaMontadaId: record.provaMontadaId,
      cadernoProvaId: record.cadernoProvaId,
      alunoNome: record.alunoNome,
      alunoRa: record.alunoRa,
      respostasMarcadasJson: record.respostasMarcadasJson as any,
      acertos: record.acertos,
      totalQuestoes: record.totalQuestoes,
      notaFinal: Number(record.notaFinal),
      lidoViaMobile: Boolean(record.lidoViaMobile),
      createdAt: record.createdAt?.toISOString()
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await (prisma as any).resultadoAvaliacao.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
