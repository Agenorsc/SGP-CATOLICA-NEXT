import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/repositories/prisma/PrismaQuestionRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const questionRepo = new PrismaQuestionRepository();
const turmaRepo = new PrismaTurmaRepository();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const { id } = await params;
    const question = await questionRepo.findById(id);
    if (!question) {
      return NextResponse.json({ error: 'Questão não encontrada.' }, { status: 404 });
    }

    if (session?.role === 'PROFESSOR') {
      const isOwner = question.teacherId === session.id;
      let turmaOwner = false;
      if (question.turmaId) {
        const turma = await turmaRepo.findById(question.turmaId);
        if (turma && turma.professorId === session.id) {
          turmaOwner = true;
        }
      }

      if (!isOwner && !turmaOwner) {
        return NextResponse.json(
          { error: 'Acesso negado. Você só pode excluir suas próprias questões.' },
          { status: 403 }
        );
      }
    }

    const success = await questionRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Erro ao excluir questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
