import { NextResponse } from 'next/server';
import { RelatoriosService } from '@/services/RelatoriosService';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class RelatorioController {
  async getRelatorio(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const url = request ? new URL(request.url) : null;
      const turmaId = (url ? url.searchParams.get('turmaId') : null) || 'TODAS';
      const ciclo = ((url ? url.searchParams.get('ciclo') : null) || 'TODAS') as any;

      const relatorio = await RelatoriosService.obterDadosEGerarRelatorio({
        turmaId,
        ciclo,
        session
      });

      return NextResponse.json(relatorio, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Response-Time-Target': 'p95 < 250ms'
        }
      });
    } catch (error: any) {
      console.error('RelatorioController Error:', error);
      if (error instanceof HttpError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
    }
  }
}
