import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProvaMontadaRegistro } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache em memória para desenvolvimento e fallback caso o banco Postgres não responda
let fallbackProvasMemoria: ProvaMontadaRegistro[] = [];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const turmaId = searchParams.get('turmaId');

    try {
      const where: any = {};
      if (turmaId && turmaId !== 'TODAS') {
        where.turmaId = turmaId;
      }
      const records = await (prisma as any).provaMontada?.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { turma: true }
      });

      if (records && records.length > 0) {
        return NextResponse.json(records.map((r: any) => ({
          id: r.id,
          titulo: r.titulo,
          disciplina: r.disciplina || r.turma?.curso || r.turma?.nome || 'Geral',
          semestre: r.semestre || r.turma?.semestre || '2026/2',
          ciclo: r.ciclo,
          turmaId: r.turmaId,
          turmaNome: r.turma?.nome,
          professorId: r.professorId,
          questoesSnapshot: r.questoesSnapshot || [],
          totalQuestoes: r.totalQuestoes,
          pontuacaoTotal: r.pontuacaoTotal,
          shuffleQuestoes: r.shuffleQuestoes,
          shuffleAlternativas: r.shuffleAlternativas,
          nominalQrCode: r.nominalQrCode,
          createdAt: r.createdAt.toISOString()
        })));
      }
    } catch (dbErr) {
      console.warn('Banco relacional inacessível no momento, servindo cache de provas:', dbErr);
    }

    // Fallback gracioso
    let res = fallbackProvasMemoria;
    if (turmaId && turmaId !== 'TODAS') {
      res = res.filter(p => p.turmaId === turmaId);
    }
    return NextResponse.json(res);
  } catch (error: any) {
    console.error('Erro ao listar provas montadas:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: ProvaMontadaRegistro = await request.json();

    const novaProva: ProvaMontadaRegistro = {
      ...body,
      id: body.id || `prova_${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString()
    };

    try {
      const saved = await (prisma as any).provaMontada?.create({
        data: {
          id: novaProva.id,
          titulo: novaProva.titulo,
          disciplina: novaProva.disciplina,
          semestre: novaProva.semestre || '2026/2',
          ciclo: novaProva.ciclo || 'N2',
          turmaId: novaProva.turmaId,
          professorId: novaProva.professorId || null,
          questoesSnapshot: novaProva.questoesSnapshot as any,
          totalQuestoes: novaProva.totalQuestoes || novaProva.questoesSnapshot.length,
          pontuacaoTotal: novaProva.pontuacaoTotal || 10.0,
          shuffleQuestoes: novaProva.shuffleQuestoes ?? true,
          shuffleAlternativas: novaProva.shuffleAlternativas ?? true,
          nominalQrCode: novaProva.nominalQrCode ?? true
        }
      });
      if (saved) {
        novaProva.id = saved.id;
      }
    } catch (dbErr) {
      console.warn('Banco relacional offline para INSERT de prova, salvando em cache:', dbErr);
    }

    fallbackProvasMemoria = [novaProva, ...fallbackProvasMemoria.filter(p => p.id !== novaProva.id)];
    return NextResponse.json(novaProva, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao salvar prova montada:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 });

    try {
      await (prisma as any).provaMontada?.delete({ where: { id } });
    } catch (_) {}

    fallbackProvasMemoria = fallbackProvasMemoria.filter(p => p.id !== id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
