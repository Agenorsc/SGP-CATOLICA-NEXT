import { NextResponse } from 'next/server';
import { TurmaService } from '@/services/TurmaService';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

export class TurmaController {
  constructor(private turmaService: TurmaService = new TurmaService()) {}

  async getTurmas(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const turmas = await this.turmaService.listarTurmas(session);
      return NextResponse.json(turmas, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async saveTurma(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const body = await request.json();
      const saved = await this.turmaService.salvarTurma(body, session);
      try {
        revalidatePath('/');
        revalidatePath('/cadastros');
      } catch (_) {}
      return NextResponse.json(saved, { status: 201 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteTurma(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const { id } = await context.params;
      const success = await this.turmaService.excluirTurma(id, session);
      try {
        revalidatePath('/');
        revalidatePath('/cadastros');
      } catch (_) {}
      return NextResponse.json({ success }, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): NextResponse {
    console.error('TurmaController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
