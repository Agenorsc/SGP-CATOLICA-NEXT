import { NextResponse } from 'next/server';
import { OmrService } from '@/services/OmrService';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question, LeituraOMRRegistro } from '@/types';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class OmrController {
  constructor(private omrService: OmrService = new OmrService()) {}

  async getLeituras(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const url = request ? new URL(request.url) : null;
      const alunoId = url ? url.searchParams.get('alunoId') : null;

      const data = await this.omrService.listarLeiturasComEscopo({ alunoId, session });
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async saveLeitura(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const body = await request.json();
      const registro: LeituraOMRRegistro = body.registro || body;
      const stage = body.stage || registro.stage;

      const resultado = await this.omrService.salvarLeituraComTransacao(registro, stage, session);
      return NextResponse.json(resultado, { status: 201 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  processar(
    aluno: AlunoModel,
    turma: TurmaModel,
    questoes: Question[],
    materia: string,
    versao: string = 'Versão A'
  ) {
    try {
      const registro = this.omrService.processarCorrecao(aluno, turma, questoes, materia, versao);
      return { status: 200, data: registro };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  private handleError(error: any): NextResponse {
    console.error('OmrController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
