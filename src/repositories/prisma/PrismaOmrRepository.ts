import { prisma } from '@/lib/prisma';
import { LeituraOMRRegistro, EvaluationStage } from '@/types';
import { AlunoModel } from '@/models/AlunoModel';
import { IBaseRepository } from '@/repositories/base/IBaseRepository';

export interface SalvarLeituraTransacaoResult {
  leitura: LeituraOMRRegistro;
  aluno: AlunoModel;
}

export class PrismaOmrRepository implements IBaseRepository<LeituraOMRRegistro> {
  async findAll(): Promise<LeituraOMRRegistro[]> {
    const records = await prisma.leituraOMR.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return records.map(r => ({
      id: r.id,
      alunoId: r.alunoId,
      alunoNome: r.alunoNome,
      ra: r.ra,
      turmaId: r.turmaId ?? undefined,
      professorId: r.professorId ?? undefined,
      provaMontadaId: (r as any).provaMontadaId ?? undefined,
      turmaNome: r.turmaNome,
      materia: r.materia,
      versao: r.versao,
      acertos: r.acertos,
      totalQuestoes: r.totalQuestoes,
      notaCalculada: r.notaCalculada,
      dataLeitura: r.dataLeitura,
      respostasDetectadas: (r.respostasDetectadas as any) || {},
      gabaritoOficial: (r.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (r.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: r.fiduciaisDetectados ?? undefined
    }));
  }

  async findById(id: string): Promise<LeituraOMRRegistro | undefined> {
    const r = await prisma.leituraOMR.findUnique({
      where: { id }
    });

    if (!r) return undefined;

    return {
      id: r.id,
      alunoId: r.alunoId,
      alunoNome: r.alunoNome,
      ra: r.ra,
      turmaId: r.turmaId ?? undefined,
      professorId: r.professorId ?? undefined,
      provaMontadaId: (r as any).provaMontadaId ?? undefined,
      turmaNome: r.turmaNome,
      materia: r.materia,
      versao: r.versao,
      acertos: r.acertos,
      totalQuestoes: r.totalQuestoes,
      notaCalculada: r.notaCalculada,
      dataLeitura: r.dataLeitura,
      respostasDetectadas: (r.respostasDetectadas as any) || {},
      gabaritoOficial: (r.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (r.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: r.fiduciaisDetectados ?? undefined
    };
  }

  async findByAlunoId(alunoId: string): Promise<LeituraOMRRegistro[]> {
    const records = await prisma.leituraOMR.findMany({
      where: { alunoId },
      orderBy: { createdAt: 'desc' }
    });

    return records.map(r => ({
      id: r.id,
      alunoId: r.alunoId,
      alunoNome: r.alunoNome,
      ra: r.ra,
      turmaId: r.turmaId ?? undefined,
      professorId: r.professorId ?? undefined,
      provaMontadaId: (r as any).provaMontadaId ?? undefined,
      turmaNome: r.turmaNome,
      materia: r.materia,
      versao: r.versao,
      acertos: r.acertos,
      totalQuestoes: r.totalQuestoes,
      notaCalculada: r.notaCalculada,
      dataLeitura: r.dataLeitura,
      respostasDetectadas: (r.respostasDetectadas as any) || {},
      gabaritoOficial: (r.gabaritoOficial as any) || undefined,
      detalhesQuestoes: (r.detalhesQuestoes as any) || undefined,
      fiduciaisDetectados: r.fiduciaisDetectados ?? undefined
    }));
  }

  /**
   * Persiste a Leitura OMR e atualiza a nota do Aluno (N1, N2, N3 ou N-1)
   * em uma única transação atômica via Prisma ($transaction).
   */
  async saveWithTransaction(
    registro: LeituraOMRRegistro,
    stage?: EvaluationStage
  ): Promise<SalvarLeituraTransacaoResult> {
    return await prisma.$transaction(async (tx) => {
      // 1. Localiza o aluno no banco por ID ou por RA
      let alunoDb = await tx.aluno.findUnique({
        where: { id: registro.alunoId }
      });

      if (!alunoDb && registro.ra) {
        alunoDb = await tx.aluno.findUnique({
          where: { ra: String(registro.ra) }
        });
      }

      if (!alunoDb) {
        throw new Error(
          `Aluno não localizado no banco de dados para o ID "${registro.alunoId}" e RA "${registro.ra}". Transação abortada.`
        );
      }

      // 2. Validação e vínculo de integridade com Turma, Professor e ProvaMontada
      let turmaIdToSave: string | null = null;
      const targetTurmaId = registro.turmaId || alunoDb.turmaId;
      if (targetTurmaId) {
        const turmaExiste = await tx.turma.findUnique({ where: { id: targetTurmaId } });
        if (turmaExiste) turmaIdToSave = targetTurmaId;
      }

      let professorIdToSave: string | null = null;
      if (registro.professorId) {
        const profExiste = await tx.usuario.findUnique({ where: { id: registro.professorId } });
        if (profExiste) professorIdToSave = registro.professorId;
      }

      let provaMontadaIdToSave: string | null = null;
      const pId = registro.provaMontadaId || registro.examId;
      if (pId && (tx as any).provaMontada) {
        const provaExiste = await (tx as any).provaMontada.findUnique({ where: { id: pId } });
        if (provaExiste) provaMontadaIdToSave = pId;
      }

      // 3. Cria o registro de Leitura OMR
      const leituraData: any = {
        id: registro.id,
        alunoId: alunoDb.id,
        alunoNome: alunoDb.nome || registro.alunoNome,
        ra: alunoDb.ra || registro.ra,
        turmaId: turmaIdToSave,
        professorId: professorIdToSave,
        turmaNome: registro.turmaNome,
        materia: registro.materia,
        versao: registro.versao,
        acertos: registro.acertos,
        totalQuestoes: registro.totalQuestoes,
        notaCalculada: registro.notaCalculada,
        dataLeitura: registro.dataLeitura,
        respostasDetectadas: (registro.respostasDetectadas as any) || {},
        gabaritoOficial: (registro.gabaritoOficial as any) || null,
        detalhesQuestoes: (registro.detalhesQuestoes as any) || null,
        fiduciaisDetectados: registro.fiduciaisDetectados ?? true
      };
      if (provaMontadaIdToSave) {
        leituraData.provaMontadaId = provaMontadaIdToSave;
      }

      const savedLeitura = await tx.leituraOMR.create({
        data: leituraData
      });

      // 4. Atualiza a nota do aluno no ciclo correspondente
      const ciclo = stage || registro.stage || 'N1';
      const nota = Number(registro.notaCalculada);
      const dataUpdate: { n1?: number; n2?: number; n3?: number } = {};

      if (ciclo === 'N1') {
        dataUpdate.n1 = nota;
      } else if (ciclo === 'N2') {
        dataUpdate.n2 = nota;
      } else if (ciclo === 'N3') {
        dataUpdate.n3 = nota;
      } else if (ciclo === 'N-1') {
        // N-1 substitui a menor nota entre n1, n2 e n3
        const menor = Math.min(alunoDb.n1, alunoDb.n2, alunoDb.n3);
        if (menor === alunoDb.n1) dataUpdate.n1 = nota;
        else if (menor === alunoDb.n3) dataUpdate.n3 = nota;
        else dataUpdate.n2 = nota;
      } else {
        dataUpdate.n1 = nota;
      }

      const alunoAtualizado = await tx.aluno.update({
        where: { id: alunoDb.id },
        data: dataUpdate
      });

      return {
        leitura: {
          ...registro,
          id: savedLeitura.id,
          alunoId: alunoDb.id,
          provaMontadaId: provaMontadaIdToSave ?? undefined
        },
        aluno: new AlunoModel(alunoAtualizado as any)
      };
    });
  }

  async save(registro: LeituraOMRRegistro): Promise<LeituraOMRRegistro> {
    const res = await this.saveWithTransaction(registro, registro.stage);
    return res.leitura;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.leituraOMR.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }
}
