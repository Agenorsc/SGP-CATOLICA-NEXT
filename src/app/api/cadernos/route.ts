import { NextResponse } from 'next/server';
import { PrismaCadernoRepository } from '@/repositories/prisma/PrismaCadernoRepository';
import { sessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cadernoRepo = new PrismaCadernoRepository();

export async function GET(request: Request) {
  try {
    const session = sessionFromRequest(request);
    const { searchParams } = new URL(request.url);
    const provaMontadaId = searchParams.get('provaMontadaId');

    if (!provaMontadaId) {
      return NextResponse.json({ error: 'provaMontadaId é obrigatório' }, { status: 400 });
    }

    const cadernos = await cadernoRepo.findByProvaMontadaId(provaMontadaId);
    return NextResponse.json(cadernos, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao listar cadernos' }, { status: 500 });
  }
}
