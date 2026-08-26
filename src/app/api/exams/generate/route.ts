import { NextResponse } from 'next/server';
import { ExamController } from '@/controllers/ExamController';
import { GenerateExamConfig } from '@/types';

export async function POST(request: Request) {
  const body: GenerateExamConfig = await request.json();
  const controller = new ExamController();
  const response = await controller.handleGenerate(body);

  return NextResponse.json(response.data, { status: response.status });
}