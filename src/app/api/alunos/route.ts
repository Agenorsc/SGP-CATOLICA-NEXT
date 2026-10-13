import { NextResponse } from 'next/server';
import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';
import { AlunoModel } from '@/models/AlunoModel';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const alunoRepo = new PrismaAlunoRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId');

    const alunos = turmaId
      ? await alunoRepo.findByTurmaId(turmaId)
      : await alunoRepo.findAll();

    return NextResponse.json(alunos);
  } catch (error: any) {
    console.error('Erro ao listar alunos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const aluno = new AlunoModel(body);
    const saved = await alunoRepo.save(aluno);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar aluno:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
