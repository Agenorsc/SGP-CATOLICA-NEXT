import { NextResponse } from 'next/server';
import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const alunoRepo = new PrismaAlunoRepository();
const turmaRepo = new PrismaTurmaRepository();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const { id } = await params;
    const aluno = await alunoRepo.findById(id);
    if (!aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
    }

    if (session?.role === 'PROFESSOR') {
      const turma = await turmaRepo.findById(aluno.turmaId);
      if (!turma || turma.professorId !== session.id) {
        return NextResponse.json(
          { error: 'Acesso negado. Você só pode excluir alunos de suas próprias turmas.' },
          { status: 403 }
        );
      }
    }

    const success = await alunoRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Erro ao excluir aluno:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
