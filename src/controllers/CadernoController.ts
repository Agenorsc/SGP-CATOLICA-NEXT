import { NextResponse } from 'next/server';
import { ExamService } from '@/services/ExamService';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class CadernoController {
  constructor(private examService: ExamService = new ExamService()) {}

  async getCaderno(request: Request, idParam?: string): Promise<NextResponse> {
    try {
      const session = sessionFromRequest(request);
      let id = idParam;
      if (!id) {
        const { searchParams } = new URL(request.url);
        id = searchParams.get('id') || undefined;
      }

      if (!id) {
        return NextResponse.json({ error: 'ID do caderno é obrigatório.' }, { status: 400 });
      }

      const caderno = await this.examService.obterCadernoPorId(id, session);
      if (!caderno) {
        return NextResponse.json({ error: 'Caderno de prova não encontrado.' }, { status: 404 });
      }

      return NextResponse.json(caderno, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): NextResponse {
    console.error('CadernoController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error?.message || 'Erro interno no servidor de cadernos.' },
      { status: 500 }
    );
  }
}
