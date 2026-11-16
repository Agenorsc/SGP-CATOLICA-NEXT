import { CadernoController } from '@/controllers/CadernoController';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const cadernoController = new CadernoController();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(context.params);
  return cadernoController.getCaderno(request, resolvedParams?.id);
}
