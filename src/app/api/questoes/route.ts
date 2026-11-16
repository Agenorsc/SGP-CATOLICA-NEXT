import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/repositories/prisma/PrismaQuestionRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { Question } from '@/types';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const questionRepo = new PrismaQuestionRepository();
const turmaRepo = new PrismaTurmaRepository();

export async function GET(request?: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;

    if (session?.role === 'PROFESSOR') {
      const questions = await questionRepo.findByProfessorId(session.id);
      return NextResponse.json(questions);
    }

    const questions = await questionRepo.findAll();
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('Erro ao listar questões:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const body: Question = await request.json();

    if (session?.role === 'PROFESSOR') {
      body.teacherId = session.id;
      const targetTurmaId = body.turmaId || body.classId;
      if (targetTurmaId) {
        const turma = await turmaRepo.findById(targetTurmaId);
        if (!turma || turma.professorId !== session.id) {
          return NextResponse.json(
            { error: 'Acesso negado. A turma informada não pertence ao professor.' },
            { status: 403 }
          );
        }
      }
    }

    const saved = await questionRepo.save(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
