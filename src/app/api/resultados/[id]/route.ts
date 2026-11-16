import { ResultadoController } from '@/controllers/ResultadoController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const resultadoController = new ResultadoController();

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  return resultadoController.deleteResultado(request, resolvedParams?.id);
}
