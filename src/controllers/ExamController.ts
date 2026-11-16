import { NextResponse } from 'next/server';
import { ExamService } from '@/services/ExamService';
import { GenerateExamConfig, ProvaMontadaRegistro } from '@/types';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class ExamController {
  constructor(private examService: ExamService = new ExamService()) {}

  async getExams(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const url = request ? new URL(request.url) : null;
      const turmaId = url ? url.searchParams.get('turmaId') : null;

      const data = await this.examService.listarProvasComEscopo({ turmaId, session });
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async saveExam(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const body: ProvaMontadaRegistro = await request.json();
      const saved = await this.examService.salvarProvaComEscopo(body, session);
      return NextResponse.json(saved, { status: 201 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteExam(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) {
        return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });
      }

      const success = await this.examService.excluirProvaComEscopo(id, session);
      return NextResponse.json({ success }, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async handleGenerate(config: GenerateExamConfig) {
    if (typeof config.shuffleQuestions !== 'boolean' || typeof config.shuffleAlternatives !== 'boolean') {
      return { status: 400, data: { error: 'Configurações de embaralhamento inválidas.' } };
    }

    try {
      const versions = await this.examService.generateVersions(config);
      return { status: 200, data: versions };
    } catch (error: any) {
      return { status: 500, data: { error: error.message } };
    }
  }

  private handleError(error: any): NextResponse {
    console.error('ExamController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
