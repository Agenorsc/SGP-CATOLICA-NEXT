import { NextResponse } from 'next/server';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaRepo = new PrismaTurmaRepository();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const { id } = await params;
    const turma = await turmaRepo.findById(id);
    if (!turma) {
      return NextResponse.json({ error: 'Turma não encontrada.' }, { status: 404 });
    }

    if (session?.role === 'PROFESSOR' && turma.professorId !== session.id) {
      return NextResponse.json(
        { error: 'Acesso negado. Você só pode excluir suas próprias turmas.' },
        { status: 403 }
      );
    }

    const success = await turmaRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Erro ao excluir turma:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
