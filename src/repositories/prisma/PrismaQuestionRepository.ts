import { prisma } from '@/lib/prisma';
import { Question } from '@/types';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export class PrismaQuestionRepository implements IBaseRepository<Question> {
  async findAll(): Promise<Question[]> {
    const records = await prisma.questao.findMany({
      include: { alternativas: true },
      orderBy: { createdAt: 'asc' }
    });

    return records.map(q => ({
      id: q.id,
      tipo: q.tipo as 'objetiva' | 'discursiva',
      enunciado: q.enunciado,
      pontuacao: q.pontuacao,
      tags: q.tags,
      alternativas: q.alternativas.map(a => ({
        id: a.id,
        letraOriginal: a.letraOriginal,
        texto: a.texto,
        correta: a.correta
      }))
    }));
  }

  async findById(id: string): Promise<Question | undefined> {
    const q = await prisma.questao.findUnique({
      where: { id },
      include: { alternativas: true }
    });

    if (!q) return undefined;

    return {
      id: q.id,
      tipo: q.tipo as 'objetiva' | 'discursiva',
      enunciado: q.enunciado,
      pontuacao: q.pontuacao,
      tags: q.tags,
      alternativas: q.alternativas.map(a => ({
        id: a.id,
        letraOriginal: a.letraOriginal,
        texto: a.texto,
        correta: a.correta
      }))
    };
  }

  async save(question: Question): Promise<Question> {
    await prisma.questao.upsert({
      where: { id: question.id },
      update: {
        tipo: question.tipo,
        enunciado: question.enunciado,
        pontuacao: question.pontuacao,
        tags: question.tags
      },
      create: {
        id: question.id,
        tipo: question.tipo,
        enunciado: question.enunciado,
        pontuacao: question.pontuacao,
        tags: question.tags
      }
    });

    if (question.alternativas && question.alternativas.length > 0) {
      for (const alt of question.alternativas) {
        await prisma.alternativa.upsert({
          where: { id: alt.id },
          update: {
            letraOriginal: alt.letraOriginal,
            texto: alt.texto,
            correta: alt.correta,
            questaoId: question.id
          },
          create: {
            id: alt.id,
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
      await prisma.questao.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
