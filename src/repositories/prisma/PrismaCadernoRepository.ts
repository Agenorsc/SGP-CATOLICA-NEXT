import { prisma } from '@/lib/prisma';
import { CadernoProvaRegistro } from '@/types';

export class PrismaCadernoRepository {
  async findById(id: string): Promise<CadernoProvaRegistro | null> {
    try {
      const record = await (prisma as any).cadernoProva.findUnique({
        where: { id },
        include: {
          provaMontada: {
            include: {
              turma: true
            }
          }
        }
      });

      if (!record) return null;

      return {
        id: record.id,
        provaMontadaId: record.provaMontadaId,
        codigoVersao: record.codigoVersao,
        alunoNome: record.alunoNome,
        alunoRa: record.alunoRa,
        mapaQuestoesJson: record.mapaQuestoesJson as any,
        gabaritoOficialJson: record.gabaritoOficialJson as any,
        createdAt: record.createdAt?.toISOString()
      };
    } catch (error) {
      console.warn('Erro ao buscar caderno no Prisma:', error);
      return null;
    }
  }

  async findByProvaMontadaId(provaMontadaId: string): Promise<CadernoProvaRegistro[]> {
    try {
      const records = await (prisma as any).cadernoProva.findMany({
        where: { provaMontadaId },
        orderBy: { codigoVersao: 'asc' }
      });

      return records.map((record: any) => ({
        id: record.id,
        provaMontadaId: record.provaMontadaId,
        codigoVersao: record.codigoVersao,
        alunoNome: record.alunoNome,
        alunoRa: record.alunoRa,
        mapaQuestoesJson: record.mapaQuestoesJson as any,
        gabaritoOficialJson: record.gabaritoOficialJson as any,
        createdAt: record.createdAt?.toISOString()
      }));
    } catch (error) {
      console.warn('Erro ao buscar cadernos por provaMontadaId:', error);
      return [];
    }
  }

  async save(caderno: CadernoProvaRegistro): Promise<CadernoProvaRegistro> {
    const record = await (prisma as any).cadernoProva.upsert({
      where: { id: caderno.id },
      create: {
        id: caderno.id,
        provaMontadaId: caderno.provaMontadaId,
        codigoVersao: caderno.codigoVersao,
        alunoNome: caderno.alunoNome || null,
        alunoRa: caderno.alunoRa || null,
        mapaQuestoesJson: caderno.mapaQuestoesJson as any,
        gabaritoOficialJson: caderno.gabaritoOficialJson as any
      },
      update: {
        codigoVersao: caderno.codigoVersao,
        alunoNome: caderno.alunoNome || null,
        alunoRa: caderno.alunoRa || null,
        mapaQuestoesJson: caderno.mapaQuestoesJson as any,
        gabaritoOficialJson: caderno.gabaritoOficialJson as any
      }
    });

    return {
      id: record.id,
      provaMontadaId: record.provaMontadaId,
      codigoVersao: record.codigoVersao,
      alunoNome: record.alunoNome,
      alunoRa: record.alunoRa,
      mapaQuestoesJson: record.mapaQuestoesJson as any,
      gabaritoOficialJson: record.gabaritoOficialJson as any,
      createdAt: record.createdAt?.toISOString()
    };
  }

  async saveMany(cadernos: CadernoProvaRegistro[]): Promise<CadernoProvaRegistro[]> {
    const results: CadernoProvaRegistro[] = [];
    for (const c of cadernos) {
      const saved = await this.save(c);
      results.push(saved);
    }
    return results;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await (prisma as any).cadernoProva.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
