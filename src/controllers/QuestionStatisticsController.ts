import { NextResponse } from 'next/server';
import { QuestionStatisticsService } from '@/services/QuestionStatisticsService';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class QuestionStatisticsController {
  async getEstatisticas(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const url = request ? new URL(request.url) : null;
      const turmaId = (url ? url.searchParams.get('turmaId') : null) || undefined;
      const provaMontadaId = (url ? url.searchParams.get('provaMontadaId') : null) || undefined;

      const resultado = await QuestionStatisticsService.gerarComEscopo({
        turmaId,
        provaMontadaId,
        session
      });

      return NextResponse.json(resultado);
    } catch (error: any) {
      console.error('QuestionStatisticsController Error:', error);
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      return NextResponse.json({ error: error?.message || 'Falha ao gerar estatísticas por questão.' }, { status: 500 });
    }
  }
}
