import { prisma } from '@/lib/prisma';
import { Question, AvaliacaoCiclo } from '@/types';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaQuestionRepository implements IBaseRepository<Question> {
  private mapQuestion(q: any): Question {
    // Deduplicação defensiva por letra e ordenação A-E
    const mapLetras = new Map<string, any>();
    (q.alternativas || []).forEach((a: any) => {
      const letra = String(a.letraOriginal || '').trim().toUpperCase();
      if (letra) {
        // Mantém a última versão cadastrada
        mapLetras.set(letra, a);
      }
    });
    const altsDeduplicadas = Array.from(mapLetras.values()).sort((a, b) =>
      String(a.letraOriginal).localeCompare(String(b.letraOriginal))
    );

    return {
      id: q.id,
      tipo: q.tipo as 'objetiva' | 'discursiva',
      enunciado: q.enunciado,
      pontuacao: q.pontuacao,
      tags: q.tags,
      turmaId: q.turmaId || undefined,
      teacherId: q.professorId || undefined,
      classId: q.turmaId || undefined,
      statement: q.enunciado,
      type: q.tipo === 'objetiva' ? 'OBJECTIVE' : 'DISCURSIVE',
      points: q.pontuacao,
      stage: (q.avaliacao as any) || 'N2',
      avaliacao: (q.avaliacao as AvaliacaoCiclo) || 'N2',
      options: altsDeduplicadas.map(a => ({
        letter: a.letraOriginal as 'A' | 'B' | 'C' | 'D' | 'E',
        text: a.texto,
        isCorrect: a.correta
      })),
      alternativas: altsDeduplicadas.map(a => ({
        id: a.id,
        letraOriginal: a.letraOriginal,
        texto: a.texto,
        correta: a.correta
      }))
    };
  }

  async findAll(): Promise<Question[]> {
    const records = await prisma.questao.findMany({
      include: { alternativas: true },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(q => this.mapQuestion(q));
  }

  async findById(id: string): Promise<Question | undefined> {
    const q = await prisma.questao.findUnique({
      where: { id },
      include: { alternativas: true }
    });

    if (!q) return undefined;
    return this.mapQuestion(q);
  }

  async findByTurmaId(turmaId: string): Promise<Question[]> {
    const records = await prisma.questao.findMany({
      where: {
        OR: [
          { turmaId: turmaId },
          { turmaId: null } // Inclui questões de banco geral
        ]
      },
      include: { alternativas: true },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(q => this.mapQuestion(q));
  }

  async save(question: Question): Promise<Question> {
    await prisma.questao.upsert({
      where: { id: question.id },
      update: {
        tipo: question.tipo,
        enunciado: question.enunciado,
        pontuacao: question.pontuacao,
        tags: question.tags,
        turmaId: question.turmaId || question.classId || null,
        professorId: question.teacherId || null,
        avaliacao: question.avaliacao || question.stage || 'N2'
      },
      create: {
        id: question.id,
        tipo: question.tipo,
        enunciado: question.enunciado,
        pontuacao: question.pontuacao,
        tags: question.tags,
        turmaId: question.turmaId || question.classId || null,
        professorId: question.teacherId || null,
        avaliacao: question.avaliacao || question.stage || 'N2'
      }
    });

    // Remove alternativas anteriores desta questão para evitar acúmulo de duplicatas no banco
    await prisma.alternativa.deleteMany({
      where: { questaoId: question.id }
    });

    if (question.alternativas && question.alternativas.length > 0) {
      // Deduplicação estrita por letra para garantir integridade
      const mapLetras = new Map<string, typeof question.alternativas[0]>();
      question.alternativas.forEach(alt => {
        const letra = String(alt.letraOriginal || '').trim().toUpperCase();
        if (letra) mapLetras.set(letra, alt);
      });

      for (const alt of mapLetras.values()) {
        const altId = alt.id || `alt_${question.id}_${alt.letraOriginal}`;
        await prisma.alternativa.create({
          data: {
            id: altId,
            letraOriginal: alt.letraOriginal,
            texto: alt.texto,
            correta: alt.correta,
            questaoId: question.id
          }
        });
      }
    }

    return question;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.alternativa.deleteMany({
        where: { questaoId: id }
      });
      await prisma.questao.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
