import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/repositories/prisma/PrismaQuestionRepository';

const questionRepo = new PrismaQuestionRepository();

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await questionRepo.delete(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    console.error('Erro ao excluir questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
