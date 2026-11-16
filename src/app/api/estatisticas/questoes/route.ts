import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QuestionStatisticsService } from '@/services/QuestionStatisticsService';
import { LeituraOMRRegistro } from '@/types';
import { sessionFromRequest } from '@/lib/session';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaRepo = new PrismaTurmaRepository();

export async function GET(request?: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const url = request ? new URL(request.url) : null;
    const turmaId = (url ? url.searchParams.get('turmaId') : null) || undefined;
    const provaMontadaId = (url ? url.searchParams.get('provaMontadaId') : null) || undefined;

    if (session?.role === 'PROFESSOR' && turmaId) {
      const turma = await turmaRepo.findById(turmaId);
      if (!turma || turma.professorId !== session.id) {
        return NextResponse.json(
          { error: 'Acesso negado a esta turma.' },
          { status: 403 }
        );
      }
    }

    let where: any = {};
    if (session?.role === 'PROFESSOR') {
      if (turmaId) {
        where = { turmaId };
      } else {
        where = {
          OR: [
            { professorId: session.id },
            { turma: { professorId: session.id } }
          ]
        };
      }
    } else {
      if (turmaId) {
        where = { turmaId };
      }
    }

    if (provaMontadaId) {
      where.provaMontadaId = provaMontadaId;
    }

    const leiturasRaw = await prisma.leituraOMR.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const leituras: LeituraOMRRegistro[] = leiturasRaw.map((leitura: any) => ({
      id: leitura.id,
      alunoId: leitura.alunoId,
      alunoNome: leitura.alunoNome,
      ra: leitura.ra,
      turmaId: leitura.turmaId ?? undefined,
      professorId: leitura.professorId ?? undefined,
      provaMontadaId: leitura.provaMontadaId ?? undefined,
      turmaNome: leitura.turmaNome,
      materia: leitura.materia,
      versao: leitura.versao,
      acertos: leitura.acertos,
      totalQuestoes: leitura.totalQuestoes,
      notaCalculada: leitura.notaCalculada,
      dataLeitura: leitura.dataLeitura,
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
