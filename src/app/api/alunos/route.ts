import { AlunoController } from '@/controllers/AlunoController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const alunoController = new AlunoController();

export async function GET(request?: Request) {
  return alunoController.getAlunos(request);
}

export async function POST(request: Request) {
  return alunoController.saveAluno(request);
}
