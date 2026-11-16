import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RelatoriosService } from '@/services/RelatoriosService';
import { AlunoModel, TurmaModel } from '@/models';
import { LeituraOMRRegistro, Question, ProvaMontadaRegistro } from '@/types';
import { sessionFromRequest } from '@/lib/session';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const turmaRepo = new PrismaTurmaRepository();

export async function GET(request?: Request) {
  try {
    const session = request ? sessionFromRequest(request) : null;
    const url = request ? new URL(request.url) : null;
    const turmaId = (url ? url.searchParams.get('turmaId') : null) || 'TODAS';
    const ciclo = ((url ? url.searchParams.get('ciclo') : null) || 'TODAS') as any;

    if (session?.role === 'PROFESSOR' && turmaId !== 'TODAS') {
      const turma = await turmaRepo.findById(turmaId);
      if (!turma || turma.professorId !== session.id) {
        return NextResponse.json(
          { error: 'Acesso negado a esta turma.' },
          { status: 403 }
        );
      }
    }

    let alunosRaw: any[] = [];
    let turmasRaw: any[] = [];
    let leiturasRaw: any[] = [];
    let provasRaw: any[] = [];
    let questoesRaw: any[] = [];

    let whereAluno: any = undefined;
    let whereTurma: any = undefined;
    let whereLeitura: any = undefined;
    let whereProva: any = undefined;
    let whereQuestao: any = undefined;

    if (session?.role === 'PROFESSOR') {
      if (turmaId !== 'TODAS') {
        whereAluno = { turmaId };
        whereTurma = { id: turmaId, professorId: session.id };
        whereLeitura = { turmaId };
        whereProva = { turmaId };
        whereQuestao = { turmaId };
      } else {
        whereTurma = { professorId: session.id };
        whereAluno = { turma: { professorId: session.id } };
        whereLeitura = {
          OR: [
            { professorId: session.id },
            { turma: { professorId: session.id } }
          ]
        };
        whereProva = {
          OR: [
            { professorId: session.id },
            { turma: { professorId: session.id } }
          ]
        };
        whereQuestao = {
          OR: [
            { professorId: session.id },
            { turma: { professorId: session.id } }
          ]
        };
      }
    } else {
      if (turmaId !== 'TODAS') {
        whereAluno = { turmaId };
        whereTurma = { id: turmaId };
        whereLeitura = { turmaId };
        whereProva = { turmaId };
        whereQuestao = { turmaId };
      }
    }

    try {
      [alunosRaw, turmasRaw, leiturasRaw, provasRaw, questoesRaw] = await Promise.all([
        prisma.aluno.findMany({ where: whereAluno, orderBy: { nome: 'asc' } }),
        prisma.turma.findMany({ where: whereTurma }),
        prisma.leituraOMR.findMany({ where: whereLeitura, orderBy: { createdAt: 'desc' } }),
        (prisma as any).provaMontada?.findMany({ where: whereProva, orderBy: { createdAt: 'desc' } }) || [],
        prisma.questao.findMany({ where: whereQuestao, include: { alternativas: true } })
      ]);
    } catch (dbErr) {
      console.warn('Banco relacional inacessível no momento ao agregar relatórios via API:', dbErr);
    }

    const alunos = alunosRaw.map(a => new AlunoModel({
      id: a.id,
      nome: a.nome,
      ra: a.ra,
      curso: a.curso,
      turno: a.turno,
      turmaId: a.turmaId,
      n1: a.n1,
      n2: a.n2,
      n3: a.n3
    }));

    const turmas = turmasRaw.map(t => new TurmaModel({
      id: t.id,
      nome: t.nome,
      curso: t.curso,
      semestre: t.semestre,
      codigoConvite: t.codigoConvite,
      professorId: t.professorId ?? undefined
    }));

    const leiturasOMR: LeituraOMRRegistro[] = leiturasRaw.map(l => ({
      id: l.id,
      alunoId: l.alunoId,
      alunoNome: l.alunoNome,
      ra: l.ra,
      turmaId: l.turmaId ?? undefined,
      professorId: l.professorId ?? undefined,
      turmaNome: l.turmaNome,
      materia: l.materia,
      versao: l.versao,
      acertos: l.acertos,
      totalQuestoes: l.totalQuestoes,
      notaCalculada: l.notaCalculada,
      dataLeitura: l.dataLeitura,
      respostasDetectadas: (l.respostasDetectadas as any) || {},
      gabaritoOficial: (l.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (l.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: l.fiduciaisDetectados ?? undefined
    }));

    const provasMontadas: ProvaMontadaRegistro[] = provasRaw.map((p: any) => ({
      id: p.id,
      titulo: p.titulo,
      disciplina: p.disciplina,
      semestre: p.semestre,
      ciclo: p.ciclo,
      turmaId: p.turmaId,
      professorId: p.professorId,
      questoesSnapshot: p.questoesSnapshot || [],
      totalQuestoes: p.totalQuestoes,
      pontuacaoTotal: p.pontuacaoTotal,
      shuffleQuestoes: p.shuffleQuestoes,
      shuffleAlternativas: p.shuffleAlternativas,
      nominalQrCode: p.nominalQrCode,
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString()
    }));

    const bancoQuestoes: Question[] = questoesRaw.map(q => ({
      id: q.id,
      statement: q.enunciado,
      enunciado: q.enunciado,
      tipo: q.tipo as any,
      pontuacao: q.pontuacao,
      tags: q.tags || [],
      turmaId: q.turmaId ?? undefined,
      avaliacao: (q.avaliacao as any) || 'N2',
      alternativas: q.alternativas?.map((a: any) => ({
        id: a.id,
        letraOriginal: a.letraOriginal,
        texto: a.texto,
        correta: a.correta
      }))
    }));

    const relatorio = RelatoriosService.gerarRelatorioTurma({
      turmaId,
      alunos,
      turmas,
      leiturasOMR,
      provasMontadas,
      bancoQuestoes,
      filtroCiclo: ciclo
    });

    return NextResponse.json(relatorio, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time-Target': 'p95 < 250ms'
      }
    });
  } catch (error: any) {
    console.error('Erro na rota de relatórios agregados:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
