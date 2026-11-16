import { AlunoController } from '@/controllers/AlunoController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const alunoController = new AlunoController();

export async function POST(request: Request) {
  return alunoController.importAlunos(request);
}

