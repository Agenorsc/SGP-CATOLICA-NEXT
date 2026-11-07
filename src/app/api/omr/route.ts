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
    const body = await request.json();
    const registro: LeituraOMRRegistro = body.registro || body;
    const stage = body.stage || registro.stage;

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
