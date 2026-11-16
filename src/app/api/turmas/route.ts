import { TurmaController } from '@/controllers/TurmaController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaController = new TurmaController();

export async function GET(request?: Request) {
  return turmaController.getTurmas(request);
}

export async function POST(request: Request) {
  return turmaController.saveTurma(request);
}
