import { NextResponse } from 'next/server';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { TurmaModel } from '@/models/TurmaModel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaRepo = new PrismaTurmaRepository();

export async function GET() {
  try {
    const turmas = await turmaRepo.findAll();
    return NextResponse.json(turmas);
  } catch (error: any) {
    console.error('Erro ao listar turmas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const turma = new TurmaModel(body);
    const saved = await turmaRepo.save(turma);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar turma:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
