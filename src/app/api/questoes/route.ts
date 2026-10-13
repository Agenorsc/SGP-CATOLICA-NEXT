import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/repositories/prisma/PrismaQuestionRepository';
import { Question } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const questionRepo = new PrismaQuestionRepository();

export async function GET() {
  try {
    const questions = await questionRepo.findAll();
    return NextResponse.json(questions);
  } catch (error: any) {
    console.error('Erro ao listar questões:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Question = await request.json();
    const saved = await questionRepo.save(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar questão:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
