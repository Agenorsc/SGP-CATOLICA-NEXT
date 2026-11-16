import { QuestionStatisticsController } from '@/controllers/QuestionStatisticsController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const questionStatisticsController = new QuestionStatisticsController();

export async function GET(request?: Request) {
  return questionStatisticsController.getEstatisticas(request);
}
