import { NextResponse } from 'next/server';
import { PrismaOmrRepository } from '@/repositories/prisma/PrismaOmrRepository';
import { LeituraOMRRegistro } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const omrRepo = new PrismaOmrRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alunoId = searchParams.get('alunoId');

    const leituras = alunoId
      ? await omrRepo.findByAlunoId(alunoId)
      : await omrRepo.findAll();

    return NextResponse.json(leituras);
  } catch (error: any) {
    console.error('Erro ao listar leituras OMR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: LeituraOMRRegistro = await request.json();
    const saved = await omrRepo.save(body);
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar leitura OMR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
