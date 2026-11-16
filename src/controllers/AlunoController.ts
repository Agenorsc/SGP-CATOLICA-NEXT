import { NextResponse } from 'next/server';
import { AlunoService } from '@/services/AlunoService';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class AlunoController {
  constructor(private alunoService: AlunoService = new AlunoService()) {}

  async getAlunos(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const url = request ? new URL(request.url) : null;
      const turmaId = url ? url.searchParams.get('turmaId') : null;

      const data = await this.alunoService.listarAlunos({ turmaId, session });
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async saveAluno(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const body = await request.json();
      const saved = await this.alunoService.salvarAluno(body, session);
      return NextResponse.json(saved, { status: 201 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async importAlunos(request: Request): Promise<NextResponse> {
    try {
      const session = sessionFromRequest(request);
      const formData = await request.formData();
      const file = formData.get('file') as { arrayBuffer?: () => Promise<ArrayBuffer> } | null;
      if (!file || typeof file.arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'Envie um arquivo no campo "file".' }, { status: 400 });
      }

      const resultado = await this.alunoService.importarAlunos(await file.arrayBuffer(), session);
      return NextResponse.json(resultado, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteAluno(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const { id } = await context.params;
      const success = await this.alunoService.excluirAluno(id, session);
      return NextResponse.json({ success }, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): NextResponse {
    console.error('AlunoController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
