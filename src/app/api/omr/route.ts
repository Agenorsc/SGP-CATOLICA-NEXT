import { NextResponse } from 'next/server';
import { PrismaOmrRepository } from '@/repositories/prisma/PrismaOmrRepository';
import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { LeituraOMRRegistro } from '@/types';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const omrRepo = new PrismaOmrRepository();
const alunoRepo = new PrismaAlunoRepository();
const turmaRepo = new PrismaTurmaRepository();

export async function GET(request?: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const url = request ? new URL(request.url) : null;
    const alunoId = url ? url.searchParams.get('alunoId') : null;

    if (alunoId) {
      if (session?.role === 'PROFESSOR') {
        const aluno = await alunoRepo.findById(alunoId);
        if (!aluno) {
          return NextResponse.json({ error: 'Aluno não encontrado.' }, { status: 404 });
        }
        const turma = await turmaRepo.findById(aluno.turmaId);
        if (!turma || turma.professorId !== session.id) {
          return NextResponse.json(
            { error: 'Acesso negado às leituras deste aluno.' },
            { status: 403 }
          );
        }
      }
      const leituras = await omrRepo.findByAlunoId(alunoId);
      return NextResponse.json(leituras);
    }

    if (session?.role === 'PROFESSOR') {
      const leituras = await omrRepo.findByProfessorId(session.id);
      return NextResponse.json(leituras);
    }

    const leituras = await omrRepo.findAll();
    return NextResponse.json(leituras);
  } catch (error: any) {
    console.error('Erro ao listar leituras OMR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const body = await request.json();
    const registro: LeituraOMRRegistro = body.registro || body;
    const stage = body.stage || registro.stage;

    if (session?.role === 'PROFESSOR') {
      registro.professorId = session.id;
      if (registro.turmaId) {
        const turma = await turmaRepo.findById(registro.turmaId);
        if (turma && turma.professorId && turma.professorId !== session.id) {
          return NextResponse.json(
            { error: 'Acesso negado. A turma indicada pertence a outro professor.' },
            { status: 403 }
          );
        }
      }
    }

    // Executa a transação atômica no Prisma: persiste a LeituraOMR e a Nota do Aluno (N1/N2/N3/N-1)
    const resultado = await omrRepo.saveWithTransaction(registro, stage);
    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error('Erro na transação ao salvar leitura OMR e nota do aluno:', error);
    return NextResponse.json(
      { error: error?.message || 'Falha na transação ao persistir leitura OMR e nota do aluno no banco de dados.' },
      { status: 500 }
    );
  }
}
