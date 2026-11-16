import { NextResponse } from 'next/server';
import { ResultadoService } from '@/services/ResultadoService';
import { ResultadoAvaliacaoRegistro } from '@/types';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class ResultadoController {
  constructor(private resultadoService: ResultadoService = new ResultadoService()) {}

  async getResultados(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const url = request ? new URL(request.url) : null;
      const turmaId = url ? url.searchParams.get('turmaId') : null;
      const provaMontadaId = url ? url.searchParams.get('provaMontadaId') : null;

      const data = await this.resultadoService.listarResultadosComEscopo({
        turmaId,
        provaMontadaId,
        session
      });

      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async saveResultado(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const body: Partial<ResultadoAvaliacaoRegistro> = await request.json();

      const saved = await this.resultadoService.salvarResultadoComEscopo(body, session);
      return NextResponse.json(saved, { status: 201 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteResultado(request: Request, idParam?: string): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      let id = idParam;
      if (!id && request) {
        const { searchParams } = new URL(request.url);
        id = searchParams.get('id') || undefined;
      }

      if (!id) {
        return NextResponse.json({ error: 'ID da nota é obrigatório para exclusão.' }, { status: 400 });
      }

      const result = await this.resultadoService.excluirResultadoComEscopo(id, session);
      return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): NextResponse {
    console.error('ResultadoController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error?.message || 'Erro interno no servidor de resultados.' },
      { status: 500 }
    );
  }
}
