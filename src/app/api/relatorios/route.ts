import { RelatorioController } from '@/controllers/RelatorioController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const relatorioController = new RelatorioController();

export async function GET(request?: Request) {
  return relatorioController.getRelatorio(request);
}
