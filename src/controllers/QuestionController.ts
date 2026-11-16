import { NextResponse } from 'next/server';
import { QuestionService } from '@/services/QuestionService';
import { Question } from '@/types';
import { sessionFromRequest } from '@/lib/session';
import { HttpError } from '@/lib/errors';

export class QuestionController {
  constructor(private questionService: QuestionService = new QuestionService()) {}

  async getQuestions(request?: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const data = await this.questionService.listarQuestoesComEscopo(session);
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async saveQuestion(request: Request): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const body: Question = await request.json();
      const saved = await this.questionService.salvarQuestaoComEscopo(body, session);
      return NextResponse.json(saved, { status: 201 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteQuestion(
    request: Request,
    context: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> {
    try {
      const session = request ? sessionFromRequest(request) : null;
      const { id } = await context.params;
      const success = await this.questionService.excluirQuestaoComEscopo(id, session);
      return NextResponse.json({ success }, { status: 200 });
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): NextResponse {
    console.error('QuestionController Error:', error);
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error?.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}
