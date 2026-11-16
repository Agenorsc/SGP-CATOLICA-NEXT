import { AlunoController } from '@/controllers/AlunoController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const alunoController = new AlunoController();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return alunoController.deleteAluno(request, context);
}
