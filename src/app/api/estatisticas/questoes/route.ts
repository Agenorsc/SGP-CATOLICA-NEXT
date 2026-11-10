import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionStatisticsService } from '@/services/QuestionStatisticsService';
import { LeituraOMRRegistro } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId') || undefined;
    const provaMontadaId = searchParams.get('provaMontadaId') || undefined;
    const leiturasRaw = await prisma.leituraOMR.findMany({
      where: { ...(turmaId ? { turmaId } : {}), ...(provaMontadaId ? ({ provaMontadaId } as any) : {}) },
      orderBy: { createdAt: 'desc' }
    });
    const leituras: LeituraOMRRegistro[] = leiturasRaw.map((leitura: any) => ({
      id: leitura.id, alunoId: leitura.alunoId, alunoNome: leitura.alunoNome, ra: leitura.ra,
      turmaId: leitura.turmaId ?? undefined, professorId: leitura.professorId ?? undefined,
      provaMontadaId: leitura.provaMontadaId ?? undefined, turmaNome: leitura.turmaNome,
      materia: leitura.materia, versao: leitura.versao, acertos: leitura.acertos, totalQuestoes: leitura.totalQuestoes,
      notaCalculada: leitura.notaCalculada, dataLeitura: leitura.dataLeitura,
      respostasDetectadas: (leitura.respostasDetectadas as Record<number, string | null>) || {},
      gabaritoOficial: (leitura.gabaritoOficial as Record<number, string>) || undefined,
      detalhesQuestoes: (leitura.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: leitura.fiduciaisDetectados ?? undefined
    }));
    return NextResponse.json(QuestionStatisticsService.gerar(leituras, { turmaId, provaMontadaId }));
  } catch (error: any) {
    console.error('Erro ao gerar estatísticas por questão:', error);
    return NextResponse.json({ error: error?.message || 'Falha ao gerar estatísticas por questão.' }, { status: 500 });
  }
}
