import { ResultadoController } from '@/controllers/ResultadoController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const resultadoController = new ResultadoController();

export async function GET(request: Request) {
  return resultadoController.getResultados(request);
}

export async function POST(request: Request) {
  return resultadoController.saveResultado(request);
}

export async function DELETE(request: Request) {
  return resultadoController.deleteResultado(request);
}
