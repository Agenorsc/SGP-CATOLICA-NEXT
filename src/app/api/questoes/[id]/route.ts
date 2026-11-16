import { QuestionController } from '@/controllers/QuestionController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const questionController = new QuestionController();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return questionController.deleteQuestion(request, context);
}
