import { NextResponse } from 'next/server';
import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';

const alunoRepo = new PrismaAlunoRepository();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await alunoRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Erro ao excluir aluno:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
