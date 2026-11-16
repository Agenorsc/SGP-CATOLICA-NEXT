import { QuestionController } from '@/controllers/QuestionController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const questionController = new QuestionController();

export async function GET(request?: Request) {
  return questionController.getQuestions(request);
}

export async function POST(request: Request) {
  return questionController.saveQuestion(request);
}
