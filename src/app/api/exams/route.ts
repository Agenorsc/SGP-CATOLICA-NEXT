import { ExamController } from '@/controllers/ExamController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const examController = new ExamController();

export async function GET(request?: Request) {
  return examController.getExams(request);
}

export async function POST(request: Request) {
  return examController.saveExam(request);
}

export async function DELETE(request: Request) {
  return examController.deleteExam(request);
}
