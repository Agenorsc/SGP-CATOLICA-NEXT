import { ExamRepository } from '@/repositories/ExamRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { prisma } from '@/lib/prisma';
import { ExamModel } from '@/models/ExamModel';
import { ExamVersionLayout, GenerateExamConfig, Question, ProvaMontadaRegistro } from '@/types';
import { shuffleArray } from '@/lib/shuffle';
import { UserSession } from '@/lib/session';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export class ExamService {
  constructor(
    private examRepository: any = new ExamRepository(),
    private turmaRepository: any = new PrismaTurmaRepository()
  ) {}

  // Algoritmo determinístico de embaralhamento
  public shuffleArray<T>(array: T[], seed: number): T[] {
    return shuffleArray(array, seed);
  }

  async listarProvas(turmaId?: string): Promise<ProvaMontadaRegistro[]> {
    if (turmaId && turmaId !== 'TODAS') {
      return this.examRepository.findByTurmaId(turmaId);
    }
    return this.examRepository.findAll();
  }

  async listarProvasComEscopo(options?: {
    turmaId?: string | null;
    session?: UserSession | null;
  }): Promise<ProvaMontadaRegistro[]> {
    const { turmaId, session } = options || {};

    if (session?.role === 'PROFESSOR' && turmaId && turmaId !== 'TODAS') {
      const turma = await this.turmaRepository.findById(turmaId);
      if (!turma || turma.professorId !== session.id) {
        throw new ForbiddenError('Acesso negado a esta turma.');
      }
    }

    try {
      let where: any = {};
      if (session?.role === 'PROFESSOR') {
        if (turmaId && turmaId !== 'TODAS') {
          where = {
            turmaId,
            OR: [
              { professorId: session.id },
              { turma: { professorId: session.id } }
            ]
          };
        } else {
          where = {
            OR: [
              { professorId: session.id },
              { turma: { professorId: session.id } }
            ]
          };
        }
      } else {
        if (turmaId && turmaId !== 'TODAS') {
          where.turmaId = turmaId;
        }
      }

      const records = await (prisma as any).provaMontada?.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { turma: true }
      });

      if (records) {
        return records.map((r: any) => ({
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
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString()
        }));
      }
    } catch (dbErr) {
      console.warn('Banco relacional inacessível no momento, servindo fallback de provas:', dbErr);
    }

    let res: ProvaMontadaRegistro[] = await this.examRepository.findAll();
    if (session?.role === 'PROFESSOR') {
      res = res.filter(p => p.professorId === session.id);
    }
    if (turmaId && turmaId !== 'TODAS') {
      res = res.filter(p => p.turmaId === turmaId);
    }
    return res;
  }

  async salvarProvaMontada(prova: ProvaMontadaRegistro): Promise<ProvaMontadaRegistro> {
    return this.examRepository.save(prova);
  }

  async salvarProvaComEscopo(
    body: ProvaMontadaRegistro,
    session?: UserSession | null
  ): Promise<ProvaMontadaRegistro> {
    if (session?.role === 'PROFESSOR') {
      body.professorId = session.id;
      if (body.turmaId) {
        const turma = await this.turmaRepository.findById(body.turmaId);
        if (!turma || turma.professorId !== session.id) {
          throw new ForbiddenError('Acesso negado. A turma informada não pertence ao professor.');
        }
      }
    }

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
      console.warn('Banco relacional offline para INSERT de prova, salvando via repositório:', dbErr);
      return this.examRepository.save(novaProva);
    }

    return novaProva;
  }

  async excluirProvaMontada(id: string): Promise<boolean> {
    return this.examRepository.delete(id);
  }

  async excluirProvaComEscopo(id: string, session?: UserSession | null): Promise<boolean> {
    if (session?.role === 'PROFESSOR') {
      const prova = await (prisma as any).provaMontada?.findUnique({
        where: { id },
        include: { turma: true }
      });
      if (prova) {
        if (prova.professorId !== session.id && prova.turma?.professorId !== session.id) {
          throw new ForbiddenError('Acesso negado. Você só pode excluir suas próprias provas.');
        }
      }
    }

    try {
      await (prisma as any).provaMontada?.delete({ where: { id } });
    } catch (_) {}

    return this.examRepository.delete(id);
  }

  /**
   * Trava Rígida de Pontuação Total: exatamente 10.0 pts para autorizar o gabarito
   */
  validarPontuacaoExame(questoes: Question[]): { valida: boolean; total: number; mensagem?: string } {
    const total = Number(questoes.reduce((acc, q) => acc + (q.pontuacao ?? q.points ?? 0), 0).toFixed(1));
    if (Math.abs(total - 10.0) > 0.05) {
      return {
        valida: false,
        total,
        mensagem: `A soma das questões deve ser exatamente 10.0 pontos para gerar o gabarito. Pontuação atual: ${total.toFixed(1)} pts`
      };
    }
    return { valida: true, total: 10.0 };
  }

  async generateVersions(config: GenerateExamConfig): Promise<ExamVersionLayout[]> {
    const students = await this.examRepository.getStudents();
    const baseQuestions = await this.examRepository.getQuestions();

    if (baseQuestions.length === 0) {
      throw new Error('Adicione ao menos 1 questão ao caderno para gerar a avaliação.');
    }

    if (baseQuestions.length > 30) {
      throw new Error('O limite máximo permitido por prova é de 30 questões.');
    }

    return students.map((student: any, index: number) => {
      let versionQuestions = JSON.parse(JSON.stringify(baseQuestions)) as Question[];

      if (config.shuffleQuestions) {
        versionQuestions = this.shuffleArray(versionQuestions, index + 1);
      }

      if (config.shuffleAlternatives) {
        versionQuestions.forEach((q, qIndex) => {
          if (q.tipo === 'objetiva' && q.alternativas) {
            q.alternativas = this.shuffleArray(q.alternativas, index * 10 + qIndex + 1);
          }
        });
      }

      return ExamModel.createVersionLayout(index + 1, student, versionQuestions, config);
    });
  }
}
