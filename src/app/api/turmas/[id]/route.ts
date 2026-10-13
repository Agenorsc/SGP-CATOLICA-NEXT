import { NextResponse } from 'next/server';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';

const turmaRepo = new PrismaTurmaRepository();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await turmaRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Erro ao excluir turma:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
