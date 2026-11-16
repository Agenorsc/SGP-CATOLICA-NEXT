import { NextResponse } from 'next/server';
import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { AlunoModel } from '@/models/AlunoModel';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const alunoRepo = new PrismaAlunoRepository();
const turmaRepo = new PrismaTurmaRepository();

export async function GET(request?: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const url = request ? new URL(request.url) : null;
    const turmaId = url ? url.searchParams.get('turmaId') : null;

    if (turmaId) {
      if (session?.role === 'PROFESSOR') {
        const turma = await turmaRepo.findById(turmaId);
        if (!turma || turma.professorId !== session.id) {
          return NextResponse.json(
            { error: 'Acesso negado a esta turma.' },
            { status: 403 }
          );
        }
      }
      const alunos = await alunoRepo.findByTurmaId(turmaId);
      return NextResponse.json(alunos);
    }

    if (session?.role === 'PROFESSOR') {
      const alunos = await alunoRepo.findByProfessorId(session.id);
      return NextResponse.json(alunos);
    }

    const alunos = await alunoRepo.findAll();
    return NextResponse.json(alunos);
  } catch (error: any) {
    console.error('Erro ao listar alunos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const body = await request.json();

    if (!body.turmaId) {
      return NextResponse.json({ error: 'turmaId é obrigatório.' }, { status: 400 });
    }

    if (session?.role === 'PROFESSOR') {
      const turma = await turmaRepo.findById(body.turmaId);
      if (!turma || turma.professorId !== session.id) {
        return NextResponse.json(
          { error: 'Acesso negado. Você só pode cadastrar alunos em suas próprias turmas.' },
          { status: 403 }
        );
      }
    }

    const aluno = new AlunoModel(body);
    const saved = await alunoRepo.save(aluno);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar aluno:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
