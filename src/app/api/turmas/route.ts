import { NextResponse } from 'next/server';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { TurmaModel } from '@/models/TurmaModel';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaRepo = new PrismaTurmaRepository();

export async function GET(request?: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;

    if (session?.role === 'PROFESSOR') {
      const turmas = await turmaRepo.findByProfessorId(session.id);
      return NextResponse.json(turmas);
    }

    const turmas = await turmaRepo.findAll();
    return NextResponse.json(turmas);
  } catch (error: any) {
    console.error('Erro ao listar turmas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const body = await request.json();

    if (session?.role === 'PROFESSOR') {
      body.professorId = session.id;
      body.professorNome = session.name;
    }

    const turma = new TurmaModel(body);
    const saved = await turmaRepo.save(turma);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar turma:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
