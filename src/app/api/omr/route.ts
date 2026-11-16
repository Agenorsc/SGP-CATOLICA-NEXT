import { OmrController } from '@/controllers/OmrController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const omrController = new OmrController();

export async function GET(request?: Request) {
  return omrController.getLeituras(request);
}

export async function POST(request: Request) {
  return omrController.saveLeitura(request);
}
