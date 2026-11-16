import { TurmaController } from '@/controllers/TurmaController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaController = new TurmaController();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return turmaController.deleteTurma(request, context);
}
